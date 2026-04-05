// app/api/novels/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a single novel by ID
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

// PUT (update) a novel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

// DELETE a novel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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