import { apiError } from "@/lib/api-error";
// app/api/novels/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { sanitizeString, isValidUrl, containsSuspiciousContent } from "@/lib/sanitize";
import { isMediaType } from "@/lib/media-types";

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

    // Validate required fields (same rules as POST /api/novels)
    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return apiError("Title is required", 400);
    }

    if (body.title.length > 500) {
      return apiError("Title is too long", 400);
    }

    // Check for suspicious content
    const fieldsToCheck = [
      body.title, body.nativeTitle, body.author,
      body.description, body.originalSource
    ].filter(Boolean);

    for (const field of fieldsToCheck) {
      if (containsSuspiciousContent(field)) {
        return apiError("Input contains invalid characters", 400);
      }
    }

    // Validate URL if provided
    if (body.coverImageUrl && !isValidUrl(body.coverImageUrl)) {
      return apiError("Invalid cover image URL", 400);
    }

    if (body.mediaType !== undefined && !isMediaType(body.mediaType)) {
      return apiError("Invalid media type", 400);
    }

    // Sanitize all string inputs
    const novel = await prisma.novel.update({
      where: { id: parseInt(id) },
      data: {
        title: sanitizeString(body.title),
        nativeTitle: body.nativeTitle ? sanitizeString(body.nativeTitle) : null,
        mediaType: body.mediaType,
        author: body.author ? sanitizeString(body.author) : null,
        authorId: body.authorId ?? null,
        description: body.description ? sanitizeString(body.description) : null,
        coverImageUrl: body.coverImageUrl || null,
        totalChapters: body.totalChapters ? parseInt(body.totalChapters) : null,
        status: body.status ? sanitizeString(body.status) : null,
        genres: Array.isArray(body.genres) ? body.genres.map(sanitizeString) : [],
        tags: Array.isArray(body.tags) ? body.tags.map(sanitizeString) : [],
        originalSource: body.originalSource ? sanitizeString(body.originalSource) : null,
        yearPublished: body.yearPublished ? parseInt(body.yearPublished) : null,
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