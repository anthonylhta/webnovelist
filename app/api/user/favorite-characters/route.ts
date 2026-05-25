import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

// GET — list favorite characters
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Not logged in", 401);
    }

    const userId = user.id;

    const favorites = await prisma.userFavoriteCharacter.findMany({
      where: { userId },
      include: {
        character: {
          include: { novel: { select: { id: true, title: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Failed to fetch favorite characters:", error);
    return apiError("Failed to fetch", 500);
  }
}

// POST — add a favorite character
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Not logged in", 401);
    }

    const userId = user.id;
    const { characterId } = await request.json();

    if (!characterId || typeof characterId !== "number") {
      return apiError("Invalid character ID", 400);
    }

    // Check max 5
    const count = await prisma.userFavoriteCharacter.count({
      where: { userId },
    });
    if (count >= 5) {
      return apiError("Maximum 5 favorite characters allowed", 400);
    }

    // Check character exists
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });
    if (!character) {
      return apiError("Character not found", 404);
    }

    // Check not already favorited
    const existing = await prisma.userFavoriteCharacter.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });
    if (existing) {
      return apiError("Already in favorites", 400);
    }

    const favorite = await prisma.userFavoriteCharacter.create({
      data: { userId, characterId },
      include: {
        character: {
          include: { novel: { select: { id: true, title: true } } },
        },
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Failed to add favorite character:", error);
    return apiError("Failed to add", 500);
  }
}

// DELETE — remove a favorite character
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Not logged in", 401);
    }

    const userId = user.id;
    const { characterId } = await request.json();

    const existing = await prisma.userFavoriteCharacter.findUnique({
      where: { userId_characterId: { userId, characterId } },
    });

    if (!existing) {
      return apiError("Not found", 404);
    }

    await prisma.userFavoriteCharacter.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Failed to remove favorite character:", error);
    return apiError("Failed to remove", 500);
  }
}