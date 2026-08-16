import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { parseMalXml } from "@/lib/mal";
import { sanitizeString } from "@/lib/sanitize";

const MAX_XML_BYTES = 5 * 1024 * 1024;

export type MalImportSummary = {
  total: number;
  entriesAdded: number;
  entriesSkipped: number;
  /** Titles not in the catalog — nothing is created for them; the reader can suggest them. */
  unmatched: { malId: number; title: string; chapters: number | null }[];
};

// POST { xml } — link-only import of a MyAnimeList manga export. Any signed-in
// reader: entries are matched to catalog titles by MAL id, then by title, and
// only the caller's own list rows are created (gaps only). No catalog rows are
// created; moderators additionally get the MAL id back-filled on title matches.
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);

    const body = await request.json();
    if (typeof body.xml !== "string" || body.xml.length === 0) return apiError("No export file", 400);
    if (body.xml.length > MAX_XML_BYTES) return apiError("Export file is too large", 413);

    const entries = parseMalXml(body.xml);
    if (entries.length === 0) return apiError("That doesn't look like a MyAnimeList manga export", 400);

    const mayBackfill = canManageNovels(user.role);
    const summary: MalImportSummary = { total: entries.length, entriesAdded: 0, entriesSkipped: 0, unmatched: [] };

    for (const entry of entries) {
      const novel = await prisma.novel.findFirst({
        where: {
          OR: [{ malId: entry.malId }, { title: { equals: entry.title, mode: "insensitive" } }],
        },
        select: { id: true, malId: true },
      });

      if (!novel) {
        summary.unmatched.push({ malId: entry.malId, title: entry.title, chapters: entry.chapters });
        continue;
      }

      if (mayBackfill && novel.malId === null) {
        await prisma.novel.update({ where: { id: novel.id }, data: { malId: entry.malId } });
      }

      const existing = await prisma.userNovelList.findUnique({
        where: { userId_novelId: { userId: user.id, novelId: novel.id } },
        select: { id: true },
      });
      if (existing) {
        summary.entriesSkipped++;
        continue;
      }

      await prisma.userNovelList.create({
        data: {
          userId: user.id,
          novelId: novel.id,
          status: entry.status,
          rating: entry.score,
          currentChapter: entry.readChapters,
          dateStarted: entry.startedAt,
          dateFinished: entry.finishedAt,
          rereadCount: entry.timesRead,
          notes: entry.comments ? sanitizeString(entry.comments).slice(0, 5000) : null,
        },
      });
      summary.entriesAdded++;
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("MAL import failed:", error);
    return apiError("Import failed", 500);
  }
}
