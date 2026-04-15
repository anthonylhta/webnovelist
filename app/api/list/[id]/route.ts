import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

// PUT — update a list entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    const body = await request.json();

    const existing = await prisma.userNovelList.findUnique({
      where: { id: parseInt(id) },
      include: { novel: true },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Build update data
    const updateData: any = {};
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
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// DELETE — remove from list
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    const existing = await prisma.userNovelList.findUnique({
      where: { id: parseInt(id) },
      include: { novel: true },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}