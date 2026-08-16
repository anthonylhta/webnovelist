import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { toCsv, type ExportRow } from "@/lib/export";

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

// GET ?format=json|csv — the caller's whole library as a download.
export async function GET(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);

    const format = request.nextUrl.searchParams.get("format") ?? "json";
    if (format !== "json" && format !== "csv") return apiError("format must be json or csv", 400);

    const entries = await prisma.userNovelList.findMany({
      where: { userId: user.id },
      include: {
        novel: {
          select: { id: true, title: true, nativeTitle: true, mediaType: true, totalChapters: true, malId: true, anilistId: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const rows: ExportRow[] = entries.map((e) => ({
      title: e.novel.title,
      native_title: e.novel.nativeTitle,
      media_type: e.novel.mediaType,
      status: e.status,
      current_chapter: e.currentChapter,
      total_chapters: e.novel.totalChapters,
      rating: e.rating,
      date_started: day(e.dateStarted),
      date_finished: day(e.dateFinished),
      reread_count: e.rereadCount,
      reading_url: e.readingUrl,
      notes: e.notes,
      mal_id: e.novel.malId,
      anilist_id: e.novel.anilistId,
      novel_id: e.novel.id,
    }));

    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      return new NextResponse(toCsv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="webnovelist-${user.username}-${stamp}.csv"`,
        },
      });
    }
    return new NextResponse(
      JSON.stringify({ exportedAt: new Date().toISOString(), username: user.username, entries: rows }, null, 2),
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="webnovelist-${user.username}-${stamp}.json"`,
        },
      }
    );
  } catch (error) {
    console.error("Export failed:", error);
    return apiError("Export failed", 500);
  }
}
