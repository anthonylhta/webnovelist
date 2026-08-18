// app/page.tsx
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import Link from "next/link";
import LoggedInHome from "./LoggedInHome";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import { buildWeekDigest, folioLine, streakDays, weekStart } from "@/lib/folio";
import { getRecommendations } from "@/lib/recommendations";

// Genre breakdown + novel count is a full-table scan; it changes rarely, so cache
// it for an hour rather than re-scanning on every home-page request.
const getGenreStats = unstable_cache(
  async () => {
    const allNovels = await prisma.novel.findMany({ select: { genres: true } });
    const genreCounts: Record<string, number> = {};
    allNovels.forEach((novel) => {
      novel.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 9);
    return { topGenres, totalNovels: allNovels.length };
  },
  ["home-genre-stats"],
  { revalidate: 3600 }
);

export default async function Home() {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - 90);

    // One 90-day activity query feeds both the week digest and the streak.
    const [readingEntries, activities, finishedThisYear, suggestions] = await Promise.all([
      prisma.userNovelList.findMany({
        where: { userId: currentUser.id, status: "reading" },
        include: {
          novel: {
            select: {
              id: true,
              title: true,
              nativeTitle: true,
              totalChapters: true,
              latestChapter: true,
              author: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.activity.findMany({
        where: { userId: currentUser.id, createdAt: { gte: since } },
        select: { type: true, novelId: true, detail: true, createdAt: true },
      }),
      prisma.userNovelList.count({
        where: {
          userId: currentUser.id,
          status: "completed",
          dateFinished: { gte: new Date(now.getFullYear(), 0, 1) },
        },
      }),
      getRecommendations(currentUser.id, 5),
    ]);

    const digestIds = [
      ...new Set(
        activities
          .map((a) => a.novelId)
          .filter((id): id is number => id !== null)
      ),
    ];
    const digestNovels = digestIds.length
      ? await prisma.novel.findMany({
          where: { id: { in: digestIds } },
          select: { id: true, title: true },
        })
      : [];
    const titleOf = Object.fromEntries(digestNovels.map((n) => [n.id, n.title]));

    const statusDate = now
      .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      .toLowerCase()
      .replace(",", "");

    return (
      <LoggedInHome
        folio={folioLine(currentUser.createdAt, now)}
        statusDate={statusDate}
        digest={buildWeekDigest(activities, titleOf, weekStart(now))}
        streak={streakDays(activities.map((a) => a.createdAt), now)}
        finishedThisYear={finishedThisYear}
        suggestions={suggestions}
        initialReading={readingEntries.map((e) => ({
          id: e.id,
          currentChapter: e.currentChapter,
          updatedAt: e.updatedAt.toISOString(),
          novel: e.novel,
        }))}
      />
    );
  }

  const [trendingNovels, genreStats, userCount, entryCount] = await Promise.all([
    prisma.novel.findMany({
      select: {
        id: true,
        title: true,
        nativeTitle: true,
        _count: { select: { userEntries: true } },
      },
      orderBy: { userEntries: { _count: "desc" } },
      take: 5,
    }),
    getGenreStats(),
    prisma.user.count(),
    prisma.userNovelList.count(),
  ]);

  const { topGenres, totalNovels } = genreStats;

  return (
    <FolioSheet
      statusLeft="webnovelist"
      statusRight={`${totalNovels} titles · ${userCount} readers`}
      footer="ink & gold · a reading ledger"
    >
      {/* Masthead */}
      <div className="border-b border-hairline px-4 pb-6 pt-8 text-center">
        <h1 className="font-serif text-4xl font-semibold text-paper">
          Web<span className="text-gold">Novelist</span>
        </h1>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
          A reading ledger · webnovels · manga · manhwa · light novels
        </p>
      </div>

      {/* Pitch */}
      <div className="border-b border-hairline px-4 py-5 text-center">
        <p className="mx-auto max-w-md font-serif text-[15px] leading-relaxed text-body">
          Log every chapter, rate what you read, and build a library worth
          showing off. Never lose your place again.
        </p>
        <p className="mt-4 flex items-center justify-center gap-5 font-mono text-[12px]">
          <Link
            href="/sign-up"
            className="text-gold transition hover:text-gold-bright"
          >
            [create account]
          </Link>
          <Link
            href="/browse"
            className="text-muted transition hover:text-gold"
          >
            [browse the catalog]
          </Link>
        </p>
      </div>

      {/* Search */}
      <form action="/browse" className="flex items-center gap-3 border-b border-hairline px-4 py-2.5">
        <span aria-hidden className="font-mono text-[11px] text-gold-dim">
          /
        </span>
        <input
          type="text"
          name="search"
          placeholder="search the catalog — title, author…"
          className="w-full bg-transparent font-mono text-[12px] text-paper placeholder-faint focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 font-mono text-[11px] text-gold transition hover:text-gold-bright"
        >
          [search]
        </button>
      </form>

      {/* Most tracked */}
      {trendingNovels.length > 0 && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel
            right={
              <Link
                href="/browse"
                className="normal-case tracking-normal text-gold transition hover:text-gold-bright"
              >
                [catalog]
              </Link>
            }
          >
            Most tracked
          </FolioLabel>
          <div className="divide-y divide-hairline">
            {trendingNovels.map((novel) => (
              <div key={novel.id} className="flex items-baseline gap-2.5 py-2 first:pt-0.5 last:pb-0.5">
                <Link
                  href={`/novel/${novel.id}`}
                  className="min-w-0 truncate font-serif text-[15px] text-paper transition hover:text-gold"
                >
                  {novel.title}
                </Link>
                {novel.nativeTitle && (
                  <span className="hidden min-w-0 shrink truncate font-cjk text-[11px] text-faint sm:inline">
                    {novel.nativeTitle}
                  </span>
                )}
                <span aria-hidden className="leader-dots flex-1" />
                <span className="shrink-0 font-mono text-[10.5px] text-gold tabular-nums">
                  {novel._count.userEntries} tracking
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genres */}
      {topGenres.length > 0 && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel>Browse by genre</FolioLabel>
          <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10.5px]">
            {topGenres.map(([genre, count]) => (
              <Link
                key={genre}
                href={`/browse?genre=${encodeURIComponent(genre)}`}
                className="text-faint transition hover:text-gold"
              >
                {genre.toLowerCase()}
                <span className="text-faint/60"> · {count}</span>
              </Link>
            ))}
          </p>
        </div>
      )}

      {/* Site totals */}
      <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline">
        {[
          { label: "titles", value: totalNovels.toLocaleString() },
          { label: "readers", value: userCount.toLocaleString() },
          { label: "entries tracked", value: entryCount.toLocaleString() },
        ].map((cell) => (
          <div key={cell.label} className="px-4 py-3 text-center">
            <p className="font-mono text-base text-paper tabular-nums">{cell.value}</p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              {cell.label}
            </p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="flex items-center justify-center gap-5 border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
        <a
          href="https://github.com/anthonylhta"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted transition hover:text-gold"
        >
          github/
        </a>
        <a
          href="https://discord.com/users/362585609610461185"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted transition hover:text-gold"
        >
          discord/
        </a>
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
