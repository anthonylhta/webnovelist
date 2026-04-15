import { prisma } from "@/lib/prisma";

type ActivityType = "add" | "status_change" | "chapter_update" | "rating" | "remove";

export async function logActivity(
  userId: string,
  type: ActivityType,
  novelId: number | null,
  detail?: string
) {
  try {
    // Prevent duplicate entries within 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existing = await prisma.activity.findFirst({
      where: {
        userId,
        type,
        novelId,
        detail: detail || null,
        createdAt: { gte: twoMinutesAgo },
      },
    });

    if (existing) return;

    await prisma.activity.create({
      data: {
        userId,
        type,
        novelId,
        detail: detail || null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}