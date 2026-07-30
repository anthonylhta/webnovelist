import { apiError } from "@/lib/api-error";
// app/api/import/anilist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import {
  fetchAniListEntries,
  AniListUserNotFoundError,
  mediaTypeFromAniList,
  listStatusFromAniList,
  novelStatusFromAniList,
  dateFromAniList,
  stripAniListHtml,
  titleFromAniList,
  primaryAuthor,
} from "@/lib/anilist";

// POST — import the user's AniList manga/novel list into their reading list.
// Creates missing catalog entries, so it's limited to admins and moderators.
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("Not logged in", 401);
    }

    if (!canManageNovels(user.role)) {
      return apiError("Importing creates catalog entries, so only admins and moderators can run it", 403);
    }

    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    if (!/^[A-Za-z0-9]{2,20}$/.test(username)) {
      return apiError("Enter a valid AniList username", 400);
    }

    let entries;
    try {
      entries = await fetchAniListEntries(username);
    } catch (error) {
      if (error instanceof AniListUserNotFoundError) {
        return apiError(`AniList user "${username}" not found`, 404);
      }
      console.error("AniList fetch failed:", error);
      return apiError("Couldn't reach AniList — try again in a minute", 502);
    }

    let novelsCreated = 0;
    let entriesAdded = 0;
    let entriesSkipped = 0;
    const failures: string[] = [];

    for (const entry of entries) {
      const title = titleFromAniList(entry.media.title);
      if (!title) {
        failures.push(`AniList media #${entry.media.id} (no title)`);
        continue;
      }

      try {
        // Match by AniList id first, then by title so novels already in the
        // catalog get linked instead of duplicated
        let novel = await prisma.novel.findFirst({
          where: {
            OR: [
              { anilistId: entry.media.id },
              { title: { equals: title, mode: "insensitive" } },
            ],
          },
        });

        if (novel) {
          if (!novel.anilistId) {
            novel = await prisma.novel.update({
              where: { id: novel.id },
              data: { anilistId: entry.media.id },
            });
          }
        } else {
          const author = primaryAuthor(entry.media.staff);
          novel = await prisma.novel.create({
            data: {
              title: sanitizeString(title),
              nativeTitle: entry.media.title.native ? sanitizeString(entry.media.title.native) : null,
              mediaType: mediaTypeFromAniList(entry.media.format, entry.media.countryOfOrigin),
              author: author ? sanitizeString(author) : null,
              description: entry.media.description
                ? sanitizeString(stripAniListHtml(entry.media.description))
                : null,
              coverImageUrl: entry.media.coverImage?.large ?? null,
              totalChapters: entry.media.chapters,
              status: novelStatusFromAniList(entry.media.status),
              genres: entry.media.genres,
              anilistId: entry.media.id,
            },
          });
          novelsCreated++;
        }

        // Never clobber an existing list entry — imports only fill gaps
        const existing = await prisma.userNovelList.findUnique({
          where: { userId_novelId: { userId: user.id, novelId: novel.id } },
        });
        if (existing) {
          entriesSkipped++;
          continue;
        }

        await prisma.userNovelList.create({
          data: {
            userId: user.id,
            novelId: novel.id,
            status: listStatusFromAniList(entry.status),
            rating: entry.score > 0 ? entry.score : null,
            currentChapter: entry.progress,
            dateStarted: dateFromAniList(entry.startedAt),
            dateFinished: dateFromAniList(entry.completedAt),
            rereadCount: entry.repeat,
          },
        });
        entriesAdded++;
      } catch (error) {
        console.error(`Failed to import "${title}":`, error);
        failures.push(title);
      }
    }

    return NextResponse.json({
      total: entries.length,
      novelsCreated,
      entriesAdded,
      entriesSkipped,
      failures,
    });
  } catch (error) {
    console.error("AniList import failed:", error);
    return apiError("Import failed", 500);
  }
}
