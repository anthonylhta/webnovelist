import { apiError } from "@/lib/api-error";
// app/api/novels/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
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
      return apiError("Novel not found", 404);
    }

    return NextResponse.json(novel);
  } catch (error) {
    console.error("Failed to fetch novel:", error);
    return apiError("Failed to fetch novel", 500);
  }
}

// PUT — only admins and moderators can edit novels
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("Not logged in", 401);
    }

    if (!canManageNovels(user.role)) {
      return apiError("You don't have permission to edit novels", 403);
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
    return apiError("Failed to update novel", 500);
  }
}

// DELETE — only admins can delete novels
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("Not logged in", 401);
    }

    if (user.role !== "admin") {
      return apiError("Only admins can delete novels", 403);
    }

    const { id } = await params;

    await prisma.novel.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Novel deleted" });
  } catch (error) {
    console.error("Failed to delete novel:", error);
    return apiError("Failed to delete novel", 500);
  }
}