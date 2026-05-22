// lib/current-user.ts
import "server-only";
import { cache } from "react";
import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import type { User as PrismaUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fromClerkUser, upsertUser } from "@/lib/sync-user";

// Resolve the local DB user for the signed-in Clerk session.
// Falls back to just-in-time provisioning if the webhook hasn't created the
// row yet (e.g. local dev with no webhook configured). Memoized per request.
export const getCurrentUser = cache(async (): Promise<PrismaUser | null> => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  const clerkUser = await clerkCurrentUser();
  if (!clerkUser) return null;

  return upsertUser(fromClerkUser(clerkUser));
});
