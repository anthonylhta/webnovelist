// app/page.tsx
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import Link from "next/link";
import {
  BookOpen, TrendingUp,
  ChevronRight, Search, Users,
} from "lucide-react";
import LoggedInHome from "./LoggedInHome";
import NovelCard from "@/components/NovelCard";

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
    const [readingEntries, recentNovels] = await Promise.all([
      prisma.userNovelList.findMany({
        where: { userId: currentUser.id, status: "reading" },
        include: {
          novel: {
            select: {
              id: true,
              title: true,
              nativeTitle: true,
              coverImageUrl: true,
              totalChapters: true,
              author: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
      prisma.novel.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, title: true, nativeTitle: true, author: true, coverImageUrl: true },
      }),
    ]);

    return (
      <LoggedInHome
        userName={currentUser.username || "Reader"}
        initialReading={readingEntries.map((e) => ({
          id: e.id,
          currentChapter: e.currentChapter,
          novel: e.novel,
        }))}
        recentNovels={recentNovels}
      />
    );
  }

  const [trendingNovels, recentNovels, genreStats, userCount, entryCount] =
    await Promise.all([
      prisma.novel.findMany({
        include: {
          _count: { select: { userEntries: true } },
        },
        orderBy: { userEntries: { _count: "desc" } },
        take: 10,
      }),
      prisma.novel.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      getGenreStats(),
      prisma.user.count(),
      prisma.userNovelList.count(),
    ]);

  const { topGenres, totalNovels } = genreStats;

  return (
    <div className="-mt-8 -mx-4">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 sm:pt-24 pb-16 sm:pb-20 flex flex-col items-center text-center">
        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gold-dim mb-5">
            A reading tracker for web novels
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-semibold text-paper mb-4">
            WebNovelist
          </h1>
          <div className="rule-gold w-24 mx-auto mb-6" />
          <p className="text-base sm:text-lg text-muted mb-8 max-w-md mx-auto px-4">
            Log every chapter, rate what you read, and build a library worth
            showing off. Never lose your place again.
          </p>

          {/* Search Bar */}
          <form action="/browse" className="w-full max-w-lg mx-auto mb-6 px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
              <input
                type="text"
                name="search"
                placeholder="Search for a novel…"
                className="w-full bg-surface/80 border border-hairline rounded-lg pl-12 pr-4 py-3 sm:py-4
                           text-paper placeholder-faint focus:outline-none focus:border-gold-dim
                           backdrop-blur-sm text-base"
              />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Link
              href="/sign-up"
              className="bg-gold text-ink hover:bg-gold-bright px-6 py-3 rounded-md font-medium transition text-center"
            >
              Sign Up Free
            </Link>
            <Link
              href="/browse"
              className="border border-hairline text-body hover:border-gold-dim hover:text-gold px-6 py-3 rounded-md font-medium transition text-center"
            >
              Browse Novels
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Novels */}
      {trendingNovels.length > 0 && (
        <section className="px-4 mb-12 sm:mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                Trending
              </h2>
              <Link
                href="/browse"
                className="text-muted hover:text-gold transition text-sm flex items-center gap-1"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {trendingNovels.map((novel, i) => (
                <NovelCard
                  key={novel.id}
                  id={novel.id}
                  title={novel.title}
                  nativeTitle={novel.nativeTitle}
                  coverImageUrl={novel.coverImageUrl}
                  priority={i === 0}
                  footer={
                    <div className="flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-faint" />
                      <span className="text-xs text-faint">
                        {novel._count.userEntries} tracking
                      </span>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Added */}
      {recentNovels.length > 0 && (
        <section className="px-4 mb-12 sm:mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                Recently Added
              </h2>
              <Link
                href="/browse"
                className="text-muted hover:text-gold transition text-sm flex items-center gap-1"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {recentNovels.map((novel) => (
                <NovelCard
                  key={novel.id}
                  id={novel.id}
                  title={novel.title}
                  nativeTitle={novel.nativeTitle}
                  coverImageUrl={novel.coverImageUrl}
                  footer={<p className="text-xs text-faint truncate">{novel.author}</p>}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Genre */}
      {topGenres.length > 0 && (
        <section className="px-4 mb-12 sm:mb-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper mb-5 sm:mb-6">
              Browse by Genre
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {topGenres.map(([genre, count]) => (
                <Link
                  key={genre}
                  href={`/browse?genre=${genre}`}
                  className="bg-surface border border-hairline rounded-lg p-3 sm:p-4
                             hover:border-gold-dim hover:bg-elevated transition group"
                >
                  <div className="font-serif text-base sm:text-lg text-body group-hover:text-gold transition">
                    {genre}
                  </div>
                  <div className="text-xs sm:text-sm text-faint mt-0.5">
                    {count} novel{count !== 1 ? "s" : ""}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Site Stats */}
      <section className="px-4 mb-12 sm:mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface border border-hairline rounded-lg p-6 sm:p-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center divide-x divide-hairline">
              <div>
                <div className="font-serif text-3xl sm:text-4xl font-semibold text-gold">
                  {totalNovels}
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-faint mt-1.5">Novels</div>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl font-semibold text-gold">
                  {userCount}
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-faint mt-1.5">Readers</div>
              </div>
              <div>
                <div className="font-serif text-3xl sm:text-4xl font-semibold text-gold">
                  {entryCount.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-faint mt-1.5">Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto text-center py-8 sm:py-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-paper mb-3">
            Ready to start tracking?
          </h2>
          <p className="text-muted mb-7 text-sm sm:text-base">
            Join the community and keep track of every chapter.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-gold text-ink hover:bg-gold-bright px-7 sm:px-8 py-3 sm:py-4 rounded-md
                       font-medium text-base sm:text-lg transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}