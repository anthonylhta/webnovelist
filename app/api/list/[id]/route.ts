import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

// PUT — update a list entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("Not logged in", 401);
    }

    const { id } = await params;
    const userId = user.id;
    const body = await request.json();

    // Validate inputs (same rules as POST /api/list)
    const validStatuses = ["reading", "completed", "on_hold", "dropped", "plan_to_read"];
    if (body.status !== undefined && !validStatuses.includes(body.status)) {
      return apiError("Invalid status", 400);
    }

    if (body.rating !== undefined && body.rating !== null) {
      const rating = parseFloat(body.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        return apiError("Rating must be between 0 and 10", 400);
      }
    }

    if (
      body.currentChapter !== undefined &&
      (typeof body.currentChapter !== "number" ||
        !Number.isInteger(body.currentChapter) ||
        body.currentChapter < 0)
    ) {
      return apiError("Invalid chapter number", 400);
    }

    if (
      body.rereadCount !== undefined &&
      (typeof body.rereadCount !== "number" ||
        !Number.isInteger(body.rereadCount) ||
        body.rereadCount < 0)
    ) {
      return apiError("Invalid reread count", 400);
    }

    const existing = await prisma.userNovelList.findUnique({
      where: { id: parseInt(id) },
      include: { novel: true },
    });

    if (!existing || existing.userId !== userId) {
      return apiError("Not found", 404);
    }

    // Build update data
    const updateData: {
      status?: string;
      rating?: number | null;
      currentChapter?: number;
      readingUrl?: string | null;
      rereadCount?: number;
      notes?: string | null;
      dateStarted?: Date | null;
      dateFinished?: Date | null;
    } = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.currentChapter !== undefined) updateData.currentChapter = body.currentChapter;
    if (body.readingUrl !== undefined) updateData.readingUrl = body.readingUrl;
    if (body.rereadCount !== undefined) updateData.rereadCount = body.rereadCount;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.dateStarted !== undefined) {
      updateData.dateStarted = body.dateStarted ? new Date(body.dateStarted) : null;
    }
    if (body.dateFinished !== undefined) {
      updateData.dateFinished = body.dateFinished ? new Date(body.dateFinished) : null;
    }

    const entry = await prisma.userNovelList.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { novel: true },
    });

    // Log activities based on what changed
    const novelTitle = existing.novel.title;

    if (body.currentChapter !== undefined && body.currentChapter !== existing.currentChapter) {
      if (body.currentChapter > existing.currentChapter) {
        await logActivity(
          userId,
          "chapter_update",
          existing.novelId,
          `${novelTitle} — Chapter ${existing.currentChapter} → ${body.currentChapter}`
        );
      } else {
        await logActivity(
          userId,
          "chapter_update",
          existing.novelId,
          `${novelTitle} — Corrected chapter to ${body.currentChapter}`
        );
      }
    }

    if (body.status !== undefined && body.status !== existing.status) {
      const statusLabels: Record<string, string> = {
        reading: "Reading",
        completed: "Completed",
        on_hold: "On Hold",
        dropped: "Dropped",
        plan_to_read: "Plan to Read",
      };
      await logActivity(
        userId,
        "status_change",
        existing.novelId,
        `${novelTitle} — ${statusLabels[existing.status]} → ${statusLabels[body.status]}`
      );
    }

    if (body.rating !== undefined && body.rating !== existing.rating) {
      const ratingText = body.rating === null
        ? `Removed rating from ${novelTitle}`
        : `Rated ${novelTitle} — ${body.rating}/10`;
      await logActivity(userId, "rating", existing.novelId, ratingText);
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to update entry:", error);
    return apiError("Failed to update entry", 500);
  }
}

// DELETE — remove from list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("Not logged in", 401);
    }

    const { id } = await params;
    const userId = user.id;

    const existing = await prisma.userNovelList.findUnique({
      where: { id: parseInt(id) },
      include: { novel: true },
    });

    if (!existing || existing.userId !== userId) {
      return apiError("Not found", 404);
    }

    await prisma.userNovelList.delete({
      where: { id: parseInt(id) },
    });

    await logActivity(
      userId,
      "remove",
      existing.novelId,
      `Removed ${existing.novel.title} from list`
    );

    return NextResponse.json({ message: "Removed from list" });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return apiError("Failed to delete entry", 500);
  }
}