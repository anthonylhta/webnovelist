import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { MAX_PENDING_PER_USER, parseSubmission } from "@/lib/submissions";

const QUEUE_INCLUDE = {
  user: { select: { username: true } },
  novel: { select: { id: true, title: true } },
} as const;

// GET — your own submissions; mods may ask for the queue with ?scope=queue[&status=pending|resolved]
// or just the pending count with ?scope=count (the admin section row badge)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);

    const scope = request.nextUrl.searchParams.get("scope");
    if (scope === "count") {
      if (!canManageNovels(user.role)) return apiError("Forbidden", 403);
      const pending = await prisma.novelSubmission.count({ where: { status: "pending" } });
      return NextResponse.json({ pending });
    }
    if (scope === "queue") {
      if (!canManageNovels(user.role)) return apiError("Forbidden", 403);
      const status = request.nextUrl.searchParams.get("status") ?? "pending";
      const rows = await prisma.novelSubmission.findMany({
        where: status === "resolved" ? { status: { not: "pending" } } : { status: "pending" },
        include: QUEUE_INCLUDE,
        orderBy: status === "resolved" ? { reviewedAt: "desc" } : { createdAt: "asc" },
        take: 200,
      });
      return NextResponse.json(rows);
    }

    const rows = await prisma.novelSubmission.findMany({
      where: { userId: user.id },
      include: { novel: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return apiError("Failed to fetch submissions", 500);
  }
}

// POST — suggest a title (any signed-in reader)
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);

    const parsed = parseSubmission(await request.json());
    if ("error" in parsed) return apiError(parsed.error, 400);

    const pending = await prisma.novelSubmission.count({
      where: { userId: user.id, status: "pending" },
    });
    if (pending >= MAX_PENDING_PER_USER) {
      return apiError(`You already have ${MAX_PENDING_PER_USER} titles waiting for review`, 429);
    }

    const submission = await prisma.novelSubmission.create({
      data: { userId: user.id, ...parsed.data },
    });
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Failed to create submission:", error);
    return apiError("Failed to create submission", 500);
  }
}
