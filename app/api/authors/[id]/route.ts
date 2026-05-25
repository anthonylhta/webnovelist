import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { sanitizeString, isValidUrl, containsSuspiciousContent } from "@/lib/sanitize";

// GET — author detail with novels (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorId = parseInt(id);
    if (isNaN(authorId)) return apiError("Invalid author ID", 400);

    const author = await prisma.author.findUnique({
      where: { id: authorId },
      include: {
        novels: {
          orderBy: { title: "asc" },
          select: {
            id: true,
            title: true,
            titleChinese: true,
            coverImageUrl: true,
            status: true,
            genres: true,
            totalChapters: true,
          },
        },
        _count: { select: { favorites: true } },
      },
    });

    if (!author) return apiError("Author not found", 404);

    return NextResponse.json(author);
  } catch (error) {
    console.error("Failed to fetch author:", error);
    return apiError("Failed to fetch author", 500);
  }
}

// PUT — update author (admin/mod only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const authorId = parseInt(id);
    if (isNaN(authorId)) return apiError("Invalid author ID", 400);

    const body = await request.json();

    if (body.name !== undefined) {
      if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
        return apiError("Name cannot be empty", 400);
      }
      if (body.name.length > 200) return apiError("Name is too long", 400);
    }

    const fieldsToCheck = [body.name, body.bio].filter(Boolean);
    for (const field of fieldsToCheck) {
      if (containsSuspiciousContent(field)) return apiError("Input contains invalid characters", 400);
    }

    if (body.imageUrl && !isValidUrl(body.imageUrl)) {
      return apiError("Invalid image URL", 400);
    }

    const existing = await prisma.author.findUnique({ where: { id: authorId } });
    if (!existing) return apiError("Author not found", 404);

    const author = await prisma.author.update({
      where: { id: authorId },
      data: {
        ...(body.name !== undefined && { name: sanitizeString(body.name) }),
        ...(body.bio !== undefined && { bio: body.bio ? sanitizeString(body.bio) : null }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
      },
    });

    return NextResponse.json(author);
  } catch (error) {
    console.error("Failed to update author:", error);
    return apiError("Failed to update author", 500);
  }
}

// DELETE — delete author (admin/mod only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const authorId = parseInt(id);
    if (isNaN(authorId)) return apiError("Invalid author ID", 400);

    const existing = await prisma.author.findUnique({ where: { id: authorId } });
    if (!existing) return apiError("Author not found", 404);

    await prisma.author.delete({ where: { id: authorId } });

    return NextResponse.json({ message: "Author deleted" });
  } catch (error) {
    console.error("Failed to delete author:", error);
    return apiError("Failed to delete author", 500);
  }
}
