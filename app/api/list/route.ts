// app/api/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

// GET current user's list
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = user.id;

    const list = await prisma.userNovelList.findMany({
      where: { userId },
      include: {
        novel: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to fetch list:", error);
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}

// POST — add a novel to the user's list
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();

    // Validate novelId
    if (!body.novelId || typeof body.novelId !== "number") {
      return NextResponse.json({ error: "Invalid novel ID" }, { status: 400 });
    }

    // Validate status
    const validStatuses = ["reading", "completed", "on_hold", "dropped", "plan_to_read"];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Validate rating
    if (body.rating !== null && body.rating !== undefined) {
      const rating = parseFloat(body.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        return NextResponse.json({ error: "Rating must be between 0 and 10" }, { status: 400 });
      }
    }

    // Check if already in list
    const existing = await prisma.userNovelList.findUnique({
      where: {
        userId_novelId: {
          userId,
          novelId: body.novelId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Novel already in your list" },
        { status: 400 }
      );
    }

    // Verify novel exists
    const novel = await prisma.novel.findUnique({
      where: { id: body.novelId },
    });

    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    const entry = await prisma.userNovelList.create({
      data: {
        userId,
        novelId: body.novelId,
        status: body.status || "plan_to_read",
        rating: body.rating || null,
        currentChapter: body.currentChapter || 0,
        dateStarted: body.dateStarted ? new Date(body.dateStarted) : null,
        dateFinished: body.dateFinished ? new Date(body.dateFinished) : null,
        notes: body.notes || null,
        readingUrl: body.readingUrl || null,
        rereadCount: body.rereadCount || 0,
      },
      include: {
        novel: true,
      },
    });

    // Log activity
    const statusLabels: Record<string, string> = {
      reading: "Started reading",
      completed: "Completed",
      on_hold: "Put on hold",
      dropped: "Dropped",
      plan_to_read: "Plans to read",
    };
    await logActivity(
      userId,
      "add",
      novel.id,
      `${statusLabels[entry.status] || "Added"} ${novel.title}`
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to add to list:", error);
    return NextResponse.json(
      { error: "Failed to add to list" },
      { status: 500 }
    );
  }
}