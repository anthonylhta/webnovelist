import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

// GET — list favorite authors
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = user.id;

    const favorites = await prisma.userFavoriteAuthor.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Failed to fetch favorite authors:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite authors" },
      { status: 500 }
    );
  }
}

// POST — add a favorite author
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = user.id;
    const { authorName } = await request.json();

    if (!authorName || typeof authorName !== "string") {
      return NextResponse.json({ error: "Invalid author name" }, { status: 400 });
    }

    // Check max 5
    const count = await prisma.userFavoriteAuthor.count({
      where: { userId },
    });
    if (count >= 5) {
      return NextResponse.json(
        { error: "Maximum 5 favorite authors allowed" },
        { status: 400 }
      );
    }

    // Check not already favorited
    const existing = await prisma.userFavoriteAuthor.findUnique({
      where: { userId_authorName: { userId, authorName } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Author already in favorites" },
        { status: 400 }
      );
    }

    const favorite = await prisma.userFavoriteAuthor.create({
      data: { userId, authorName },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Failed to add favorite author:", error);
    return NextResponse.json(
      { error: "Failed to add favorite author" },
      { status: 500 }
    );
  }
}

// DELETE — remove a favorite author
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = user.id;
    const { authorName } = await request.json();

    const existing = await prisma.userFavoriteAuthor.findUnique({
      where: { userId_authorName: { userId, authorName } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.userFavoriteAuthor.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Failed to remove favorite author:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite author" },
      { status: 500 }
    );
  }
}