// lib/activity.ts
import { prisma } from "@/lib/prisma";

type ActivityType = "add" | "status_change" | "chapter_update" | "rating" | "remove";

export async function logActivity(
  userId: string,
  type: ActivityType,
  novelId: number | null,
  detail?: string
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type,
        novelId,
        detail: detail || null,
      },
    });
  } catch (error) {
    // Don't let activity logging break the main operation
    console.error("Failed to log activity:", error);
  }
}