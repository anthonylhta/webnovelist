// app/page.tsx
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import Link from "next/link";
import {
  BookOpen, TrendingUp,
  ChevronRight, Search, Users,
} from "lucide-react";
import LoggedInHome from "./LoggedInHome";
import { safeImageSrc } from "@/lib/image-hosts";

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
        select: { id: true, title: true, author: true, coverImageUrl: true },
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
      <section className="relative px-4 pt-12 sm:pt-16 pb-16 sm:pb-20 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 w-full">
          <div className="text-4xl sm:text-5xl mb-4">📚</div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            WebNovelist
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-lg mx-auto px-4">
            Track your webnovel reading journey. Never lose your place again.
          </p>

          {/* Search Bar */}
          <form action="/browse" className="w-full max-w-lg mx-auto mb-6 px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search for a novel..."
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-12 pr-4 py-3 sm:py-4
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500
                           backdrop-blur-sm text-base sm:text-lg"
              />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/browse"
              className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition text-center"
            >
              Browse Novels
            </Link>
            <Link
              href="/sign-up"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition text-center"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Novels */}
      {trendingNovels.length > 0 && (
        <section className="px-4 mb-10 sm:mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                Trending
              </h2>
              <Link
                href="/browse"
                className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center gap-1"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {trendingNovels.map((novel, i) => (
                <Link
                  key={novel.id}
                  href={`/novel/${novel.id}`}
                  className="shrink-0 w-28 sm:w-36 group"
                >
                  <div className="relative aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden mb-2">
                    <Image
                      fill
                      sizes="(max-width: 640px) 112px, 144px"
                      src={safeImageSrc(novel.coverImageUrl, "/default-cover.svg")}
                      alt={novel.title}
                      priority={i === 0}
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-blue-400 transition">
                    {novel.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {novel._count.userEntries} tracking
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Added */}
      {recentNovels.length > 0 && (
        <section className="px-4 mb-10 sm:mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                Recently Added
              </h2>
              <Link
                href="/browse"
                className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center gap-1"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {recentNovels.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/novel/${novel.id}`}
                  className="shrink-0 w-28 sm:w-36 group"
                >
                  <div className="relative aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden mb-2">
                    <Image
                      fill
                      sizes="(max-width: 640px) 112px, 144px"
                      src={safeImageSrc(novel.coverImageUrl, "/default-cover.svg")}
                      alt={novel.title}
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-blue-400 transition">
                    {novel.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{novel.author}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Genre */}
      {topGenres.length > 0 && (
        <section className="px-4 mb-10 sm:mb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Browse by Genre</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {topGenres.map(([genre, count]) => (
                <Link
                  key={genre}
                  href={`/browse?genre=${genre}`}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4
                             hover:border-gray-600 hover:bg-gray-800/60 transition group"
                >
                  <div className="font-semibold text-sm sm:text-base text-gray-200 group-hover:text-white transition">
                    {genre}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {count} novel{count !== 1 ? "s" : ""}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Site Stats */}
      <section className="px-4 mb-10 sm:mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {totalNovels}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Novels</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {userCount}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Users</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {entryCount.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto text-center py-8 sm:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to start tracking?</h2>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">
            Join the community and keep track of every chapter.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl 
                       font-semibold text-base sm:text-lg transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}