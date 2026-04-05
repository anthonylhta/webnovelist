// app/api/novels/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";

// GET — anyone can view a novel
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const novel = await prisma.novel.findUnique({
      where: { id: parseInt(id) },
    });

    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 });
    }

    return NextResponse.json(novel);
  } catch (error) {
    console.error("Failed to fetch novel:", error);
    return NextResponse.json(
      { error: "Failed to fetch novel" },
      { status: 500 }
    );
  }
}

// PUT — only admins and moderators can edit novels
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    if (!canManageNovels(session.user.role)) {
      return NextResponse.json(
        { error: "You don't have permission to edit novels" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const novel = await prisma.novel.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        titleChinese: body.titleChinese,
        author: body.author,
        description: body.description,
        coverImageUrl: body.coverImageUrl,
        totalChapters: body.totalChapters,
        status: body.status,
        genres: body.genres,
        tags: body.tags,
        originalSource: body.originalSource,
        yearPublished: body.yearPublished,
      },
    });

    return NextResponse.json(novel);
  } catch (error) {
    console.error("Failed to update novel:", error);
    return NextResponse.json(
      { error: "Failed to update novel" },
      { status: 500 }
    );
  }
}

// DELETE — only admins can delete novels
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete novels" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.novel.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Novel deleted" });
  } catch (error) {
    console.error("Failed to delete novel:", error);
    return NextResponse.json(
      { error: "Failed to delete novel" },
      { status: 500 }
    );
  }
}