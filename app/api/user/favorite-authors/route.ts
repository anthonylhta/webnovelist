import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

// GET — list favorite authors
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Not logged in", 401);
    }

    const userId = user.id;

    const favorites = await prisma.userFavoriteAuthor.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Failed to fetch favorite authors:", error);
    return apiError("Failed to fetch favorite authors", 500);
  }
}

// POST — add a favorite author
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Not logged in", 401);
    }

    const userId = user.id;
    const { authorName } = await request.json();

    if (!authorName || typeof authorName !== "string") {
      return apiError("Invalid author name", 400);
    }

    // Check max 5
    const count = await prisma.userFavoriteAuthor.count({
      where: { userId },
    });
    if (count >= 5) {
      return apiError("Maximum 5 favorite authors allowed", 400);
    }

    // Check not already favorited
    const existing = await prisma.userFavoriteAuthor.findUnique({
      where: { userId_authorName: { userId, authorName } },
    });
    if (existing) {
      return apiError("Author already in favorites", 400);
    }

    const favorite = await prisma.userFavoriteAuthor.create({
      data: { userId, authorName },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Failed to add favorite author:", error);
    return apiError("Failed to add favorite author", 500);
  }
}

// DELETE — remove a favorite author
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Not logged in", 401);
    }

    const userId = user.id;
    const { authorName } = await request.json();

    const existing = await prisma.userFavoriteAuthor.findUnique({
      where: { userId_authorName: { userId, authorName } },
    });

    if (!existing) {
      return apiError("Not found", 404);
    }

    await prisma.userFavoriteAuthor.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Failed to remove favorite author:", error);
    return apiError("Failed to remove favorite author", 500);
  }
}