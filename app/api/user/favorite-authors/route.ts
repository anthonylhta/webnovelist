import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

// GET — list favorite authors
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);

    const favorites = await prisma.userFavoriteAuthor.findMany({
      where: { userId: user.id },
      include: { author: true },
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
    if (!user) return apiError("Not logged in", 401);

    const { authorId } = await request.json();

    if (!authorId || typeof authorId !== "number") {
      return apiError("Invalid author ID", 400);
    }

    const count = await prisma.userFavoriteAuthor.count({
      where: { userId: user.id },
    });
    if (count >= 5) return apiError("Maximum 5 favorite authors allowed", 400);

    const author = await prisma.author.findUnique({ where: { id: authorId } });
    if (!author) return apiError("Author not found", 404);

    const existing = await prisma.userFavoriteAuthor.findUnique({
      where: { userId_authorId: { userId: user.id, authorId } },
    });
    if (existing) return apiError("Author already in favorites", 400);

    const favorite = await prisma.userFavoriteAuthor.create({
      data: { userId: user.id, authorId },
      include: { author: true },
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
    if (!user) return apiError("Not logged in", 401);

    const { authorId } = await request.json();

    const existing = await prisma.userFavoriteAuthor.findUnique({
      where: { userId_authorId: { userId: user.id, authorId } },
    });
    if (!existing) return apiError("Not found", 404);

    await prisma.userFavoriteAuthor.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Failed to remove favorite author:", error);
    return apiError("Failed to remove favorite author", 500);
  }
}
