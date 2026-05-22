// lib/sync-user.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";

export type NormalizedClerkUser = {
  clerkId: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
};

// Turn an arbitrary candidate into a value that satisfies the app's username
// rules (3-30 chars, [a-zA-Z0-9_-]) and is unique across users.
async function resolveUsername(input: NormalizedClerkUser): Promise<string> {
  const raw = input.username || input.email.split("@")[0] || "user";
  let base = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  if (base.length < 3) base = `user_${base}`.slice(0, 30);
  base = base.slice(0, 30);

  let candidate = base;
  let suffix = 0;
  // Keep trying until we find a name not taken by a *different* account.
  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
    });
    if (!existing || existing.clerkId === input.clerkId) return candidate;
    suffix += 1;
    const tag = String(suffix);
    candidate = `${base.slice(0, 30 - tag.length)}${tag}`;
  }
}

// Insert or update the local mirror of a Clerk user. The local row is the
// source of truth for app-owned fields (username, role, avatarUrl, bannerColor),
// so updates only touch the identity fields Clerk owns (email).
export async function upsertUser(
  input: NormalizedClerkUser
): Promise<PrismaUser> {
  // Already linked to this Clerk account.
  const byClerkId = await prisma.user.findUnique({
    where: { clerkId: input.clerkId },
  });
  if (byClerkId) {
    return prisma.user.update({
      where: { clerkId: input.clerkId },
      data: { email: input.email },
    });
  }

  // A pre-existing row with this email (e.g. an account from before Clerk, or
  // one whose webhook hasn't linked it yet) — claim it for this Clerk user
  // instead of creating a duplicate. Keeps their existing username/data.
  if (input.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (byEmail) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId: input.clerkId },
      });
    }
  }

  const username = await resolveUsername(input);
  return prisma.user.create({
    data: {
      clerkId: input.clerkId,
      email: input.email,
      username,
      avatarUrl: input.avatarUrl,
      role: "user",
    },
  });
}

export async function deleteUserByClerkId(clerkId: string): Promise<void> {
  await prisma.user.deleteMany({ where: { clerkId } });
}

type ClerkEmailLike = {
  id: string;
  emailAddress?: string;
  email_address?: string;
};

// Adapter for the `User` object returned by `currentUser()` (camelCase).
export function fromClerkUser(u: {
  id: string;
  username: string | null;
  imageUrl?: string | null;
  primaryEmailAddressId: string | null;
  emailAddresses: ClerkEmailLike[];
}): NormalizedClerkUser {
  return {
    clerkId: u.id,
    email: pickEmail(u.emailAddresses, u.primaryEmailAddressId),
    username: u.username ?? null,
    avatarUrl: u.imageUrl ?? null,
  };
}

// Adapter for the raw `UserJSON` payload delivered by webhooks (snake_case).
export function fromWebhookData(data: {
  id: string;
  username: string | null;
  image_url?: string | null;
  primary_email_address_id: string | null;
  email_addresses: ClerkEmailLike[];
}): NormalizedClerkUser {
  return {
    clerkId: data.id,
    email: pickEmail(data.email_addresses, data.primary_email_address_id),
    username: data.username ?? null,
    avatarUrl: data.image_url ?? null,
  };
}

function pickEmail(
  emails: ClerkEmailLike[],
  primaryId: string | null
): string {
  const list = emails ?? [];
  const primary = primaryId ? list.find((e) => e.id === primaryId) : undefined;
  const chosen = primary ?? list[0];
  return chosen?.emailAddress ?? chosen?.email_address ?? "";
}
