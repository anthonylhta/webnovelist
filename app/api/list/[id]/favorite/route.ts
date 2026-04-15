import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    const entry = await prisma.userNovelList.findUnique({
      where: { id: parseInt(id) },
    });

    if (!entry || entry.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If toggling ON, check max 5
    if (!entry.isFavorite) {
      const favoriteCount = await prisma.userNovelList.count({
        where: { userId, isFavorite: true },
      });
      if (favoriteCount >= 5) {
        return NextResponse.json(
          { error: "Maximum 5 favorite novels allowed" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.userNovelList.update({
      where: { id: parseInt(id) },
      data: { isFavorite: !entry.isFavorite },
      include: { novel: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}