// app/api/user/[username]/follow/route.ts — follow / unfollow a reader.
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@prisma/client";
import { apiError } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";

type Resolved =
  | { ok: false; response: NextResponse }
  | { ok: true; me: User; target: { id: string } };

/** Rate limit, auth, target lookup, and the no-self-follow rule — shared by all verbs. */
async function resolveTarget(
  request: NextRequest,
  params: Promise<{ username: string }>
): Promise<Resolved> {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return { ok: false, response: rateLimitResponse };

  const me = await getCurrentUser();
  if (!me) return { ok: false, response: apiError("Not logged in", 401) };

  const { username } = await params;
  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) return { ok: false, response: apiError("User not found", 404) };
  if (target.id === me.id) return { ok: false, response: apiError("You can't follow yourself", 400) };

  return { ok: true, me, target };
}

async function state(followerId: string, followingId: string) {
  const [edge, followers] = await Promise.all([
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } }),
    prisma.follow.count({ where: { followingId } }),
  ]);
  return { following: edge !== null, followers };
}

/** GET — am I following them, and how many followers do they have. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const resolved = await resolveTarget(request, params);
    if (!resolved.ok) return resolved.response;
    return NextResponse.json(await state(resolved.me.id, resolved.target.id));
  } catch (error) {
    console.error("Failed to read follow state:", error);
    return apiError("Failed to read follow state", 500);
  }
}

/** POST — follow. Idempotent: following twice is still one edge. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const resolved = await resolveTarget(request, params);
    if (!resolved.ok) return resolved.response;
    const { me, target } = resolved;

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: me.id, followingId: target.id } },
      create: { followerId: me.id, followingId: target.id },
      update: {},
    });
    return NextResponse.json(await state(me.id, target.id));
  } catch (error) {
    console.error("Failed to follow:", error);
    return apiError("Failed to follow", 500);
  }
}

/** DELETE — unfollow. Idempotent. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const resolved = await resolveTarget(request, params);
    if (!resolved.ok) return resolved.response;
    const { me, target } = resolved;

    await prisma.follow.deleteMany({ where: { followerId: me.id, followingId: target.id } });
    return NextResponse.json(await state(me.id, target.id));
  } catch (error) {
    console.error("Failed to unfollow:", error);
    return apiError("Failed to unfollow", 500);
  }
}
