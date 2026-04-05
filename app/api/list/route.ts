// app/api/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET current user's list
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = (session.user as any).id;

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
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

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
      },
      include: {
        novel: true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to add to list:", error);
    return NextResponse.json(
      { error: "Failed to add to list" },
      { status: 500 }
    );
  }
}