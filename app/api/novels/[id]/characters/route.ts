import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { sanitizeString, isValidUrl, containsSuspiciousContent } from "@/lib/sanitize";

const ROLES = ["Protagonist", "Main Character", "Antagonist", "Supporting"];

// GET — list characters for a novel (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const novelId = parseInt(id);
    if (isNaN(novelId)) return apiError("Invalid novel ID", 400);

    const characters = await prisma.character.findMany({
      where: { novelId },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      include: { _count: { select: { favorites: true } } },
    });

    return NextResponse.json(characters);
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    return apiError("Failed to fetch characters", 500);
  }
}

// POST — add a character to a novel (admin/mod only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const novelId = parseInt(id);
    if (isNaN(novelId)) return apiError("Invalid novel ID", 400);

    const novel = await prisma.novel.findUnique({ where: { id: novelId } });
    if (!novel) return apiError("Novel not found", 404);

    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return apiError("Name is required", 400);
    }
    if (body.name.length > 200) return apiError("Name is too long", 400);
    if (containsSuspiciousContent(body.name)) return apiError("Invalid characters in name", 400);
    if (body.imageUrl && !isValidUrl(body.imageUrl)) return apiError("Invalid image URL", 400);
    if (body.role && !ROLES.includes(body.role)) return apiError("Invalid role", 400);

    const existing = await prisma.character.findUnique({
      where: { name_novelId: { name: body.name.trim(), novelId } },
    });
    if (existing) return apiError("A character with that name already exists for this novel", 409);

    const character = await prisma.character.create({
      data: {
        name: sanitizeString(body.name),
        role: body.role || null,
        imageUrl: body.imageUrl || null,
        novelId,
      },
      include: { _count: { select: { favorites: true } } },
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error("Failed to create character:", error);
    return apiError("Failed to create character", 500);
  }
}
