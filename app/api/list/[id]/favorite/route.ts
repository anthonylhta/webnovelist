import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Not logged in", 401);
    }

    const { id } = await params;
    const userId = user.id;

    const entry = await prisma.userNovelList.findUnique({
      where: { id: parseInt(id) },
    });

    if (!entry || entry.userId !== userId) {
      return apiError("Not found", 404);
    }

    // If toggling ON, check max 5
    if (!entry.isFavorite) {
      const favoriteCount = await prisma.userNovelList.count({
        where: { userId, isFavorite: true },
      });
      if (favoriteCount >= 5) {
        return apiError("Maximum 5 favorite novels allowed", 400);
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
    return apiError("Failed to toggle favorite", 500);
  }
}