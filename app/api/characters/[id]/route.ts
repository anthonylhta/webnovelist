import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { sanitizeString, isValidUrl, containsSuspiciousContent } from "@/lib/sanitize";

const ROLES = ["Protagonist", "Main Character", "Antagonist", "Supporting"];

// GET — character detail (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const characterId = parseInt(id);
    if (isNaN(characterId)) return apiError("Invalid character ID", 400);

    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        novel: {
          select: {
            id: true,
            title: true,
            titleChinese: true,
            coverImageUrl: true,
            authorId: true,
            author: true,
          },
        },
        _count: { select: { favorites: true } },
      },
    });

    if (!character) return apiError("Character not found", 404);

    return NextResponse.json(character);
  } catch (error) {
    console.error("Failed to fetch character:", error);
    return apiError("Failed to fetch character", 500);
  }
}

// PUT — update character (admin/mod only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const characterId = parseInt(id);
    if (isNaN(characterId)) return apiError("Invalid character ID", 400);

    const existing = await prisma.character.findUnique({ where: { id: characterId } });
    if (!existing) return apiError("Character not found", 404);

    const body = await request.json();

    if (body.name !== undefined) {
      if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
        return apiError("Name cannot be empty", 400);
      }
      if (body.name.length > 200) return apiError("Name is too long", 400);
      if (containsSuspiciousContent(body.name)) return apiError("Invalid characters in name", 400);
    }
    if (body.imageUrl && !isValidUrl(body.imageUrl)) return apiError("Invalid image URL", 400);
    if (body.role && !ROLES.includes(body.role)) return apiError("Invalid role", 400);

    const character = await prisma.character.update({
      where: { id: characterId },
      data: {
        ...(body.name !== undefined && { name: sanitizeString(body.name) }),
        ...(body.role !== undefined && { role: body.role || null }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl || null }),
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("Failed to update character:", error);
    return apiError("Failed to update character", 500);
  }
}

// DELETE — delete character (admin/mod only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const characterId = parseInt(id);
    if (isNaN(characterId)) return apiError("Invalid character ID", 400);

    const existing = await prisma.character.findUnique({ where: { id: characterId } });
    if (!existing) return apiError("Character not found", 404);

    await prisma.character.delete({ where: { id: characterId } });

    return NextResponse.json({ message: "Character deleted" });
  } catch (error) {
    console.error("Failed to delete character:", error);
    return apiError("Failed to delete character", 500);
  }
}
