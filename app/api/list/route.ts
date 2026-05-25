import { apiError } from "@/lib/api-error";
// app/api/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

// GET current user's list
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("Not logged in", 401);
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
    return apiError("Failed to fetch list", 500);
  }
}

// POST — add a novel to the user's list
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("Not logged in", 401);
    }

    const userId = user.id;
    const body = await request.json();

    // Validate novelId
    if (!body.novelId || typeof body.novelId !== "number") {
      return apiError("Invalid novel ID", 400);
    }

    // Validate status
    const validStatuses = ["reading", "completed", "on_hold", "dropped", "plan_to_read"];
    if (body.status && !validStatuses.includes(body.status)) {
      return apiError("Invalid status", 400);
    }

    // Validate rating
    if (body.rating !== null && body.rating !== undefined) {
      const rating = parseFloat(body.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        return apiError("Rating must be between 0 and 10", 400);
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
      return apiError("Novel already in your list", 400);
    }

    // Verify novel exists
    const novel = await prisma.novel.findUnique({
      where: { id: body.novelId },
    });

    if (!novel) {
      return apiError("Novel not found", 404);
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
    return apiError("Failed to add to list", 500);
  }
}