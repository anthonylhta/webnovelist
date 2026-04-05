// app/api/list/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Make sure the entry belongs to this user
    const existing = await prisma.userNovelList.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const entry = await prisma.userNovelList.update({
      where: { id: parseInt(id) },
      data: {
        status: body.status,
        rating: body.rating,
        currentChapter: body.currentChapter,
        dateStarted: body.dateStarted ? new Date(body.dateStarted) : null,
        dateFinished: body.dateFinished ? new Date(body.dateFinished) : null,
        notes: body.notes,
      },
      include: {
        novel: true,
      },
    });

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
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.userNovelList.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Removed from list" });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}