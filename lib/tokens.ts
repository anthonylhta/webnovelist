// lib/tokens.ts
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function createToken(userId: string, type: "email_verification" | "password_reset") {
  // Delete any existing tokens of this type for this user
  await prisma.token.deleteMany({
    where: { userId, type },
  });

  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt =
    type === "email_verification"
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      : new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.token.create({
    data: {
      token,
      type,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function verifyToken(token: string, type: "email_verification" | "password_reset") {
  const tokenRecord = await prisma.token.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!tokenRecord) return null;
  if (tokenRecord.type !== type) return null;
  if (tokenRecord.used) return null;
  if (tokenRecord.expiresAt < new Date()) return null;

  return tokenRecord;
}

export async function markTokenUsed(token: string) {
  await prisma.token.update({
    where: { token },
    data: { used: true },
  });
}