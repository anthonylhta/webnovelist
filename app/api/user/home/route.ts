// app/api/user/home/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = user.id;

    // Get user's currently reading novels
    const reading = await prisma.userNovelList.findMany({
      where: { userId, status: "reading" },
      include: { novel: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    // Get user's quick stats
    const allEntries = await prisma.userNovelList.findMany({
      where: { userId },
      select: {
        status: true,
        rating: true,
        currentChapter: true,
      },
    });

    const totalNovels = allEntries.length;
    const readingCount = allEntries.filter((e) => e.status === "reading").length;
    const completedCount = allEntries.filter((e) => e.status === "completed").length;
    const totalChapters = allEntries.reduce((sum, e) => sum + e.currentChapter, 0);
    const ratedEntries = allEntries.filter((e) => e.rating !== null);
    const avgRating =
      ratedEntries.length > 0
        ? (ratedEntries.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedEntries.length).toFixed(1)
        : null;

    return NextResponse.json({
      reading,
      stats: {
        totalNovels,
        readingCount,
        completedCount,
        totalChapters,
        avgRating,
      },
    });
  } catch (error) {
    console.error("Failed to fetch home data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}