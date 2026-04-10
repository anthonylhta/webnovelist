// app/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  BookOpen, Star, TrendingUp, CheckCircle,
  ChevronRight, Search, Users, BookMarked,
} from "lucide-react";
import LoggedInHome from "./LoggedInHome";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If logged in, show the dashboard
  if (session) {
    return <LoggedInHome userName={session.user?.name || "Reader"} />;
  }

  // ===== LOGGED OUT HOMEPAGE =====

  // Fetch data for the public homepage
  const [trendingNovels, recentNovels, allNovels, userCount, entryCount] =
    await Promise.all([
      // "Trending" = most tracked by users
      prisma.novel.findMany({
        include: {
          _count: { select: { userEntries: true } },
        },
        orderBy: { userEntries: { _count: "desc" } },
        take: 10,
      }),
      // Recently added
      prisma.novel.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // All novels for genre counts
      prisma.novel.findMany({
        select: { genres: true },
      }),
      // User count
      prisma.user.count(),
      // Total list entries
      prisma.userNovelList.count(),
    ]);

  // Genre counts
  const genreCounts: Record<string, number> = {};
  allNovels.forEach((novel) => {
    novel.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9);

  const totalNovels = allNovels.length;

  return (
    <div className="-mt-8 -mx-4">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 flex flex-col items-center text-center">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            WebNovelist
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-lg mx-auto">
            Track your webnovel reading journey. Never lose your place again.
          </p>

          {/* Search Bar */}
          <form action="/browse" className="w-full max-w-lg mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search for a novel..."
                className="w-full bg-gray-900/80 border border-gray-700 rounded-xl pl-12 pr-4 py-4
                           text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500
                           backdrop-blur-sm text-lg"
              />
            </div>
          </form>

          <div className="flex gap-4 justify-center">
            <Link
              href="/browse"
              className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Browse Novels
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Novels */}
      {trendingNovels.length > 0 && (
        <section className="px-4 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                Trending
              </h2>
              <Link
                href="/browse"
                className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center gap-1"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {trendingNovels.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/novel/${novel.id}`}
                  className="shrink-0 w-36 group"
                >
                  <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden mb-2">
                    <img
                      src={
                        novel.coverImageUrl ||
                        "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"
                      }
                      alt={novel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-sm truncate group-hover:text-blue-400 transition">
                    {novel.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Users className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {(novel as any)._count.userEntries} tracking
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
        <section className="px-4 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-green-500" />
                Recently Added
              </h2>
              <Link
                href="/browse"
                className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center gap-1"
              >
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentNovels.map((novel) => (
                <Link
                  key={novel.id}
                  href={`/novel/${novel.id}`}
                  className="shrink-0 w-36 group"
                >
                  <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden mb-2">
                    <img
                      src={
                        novel.coverImageUrl ||
                        "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"
                      }
                      alt={novel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-sm truncate group-hover:text-blue-400 transition">
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
        <section className="px-4 mb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {topGenres.map(([genre, count]) => (
                <Link
                  key={genre}
                  href={`/browse?genre=${genre}`}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4
                             hover:border-blue-500/50 hover:bg-gray-900/80 transition group"
                >
                  <div className="font-semibold group-hover:text-blue-400 transition">
                    {genre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {count} novel{count !== 1 ? "s" : ""}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Site Stats */}
      <section className="px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {totalNovels}
                </div>
                <div className="text-sm text-gray-500 mt-1">Novels</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {userCount}
                </div>
                <div className="text-sm text-gray-500 mt-1">Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {entryCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">Novels Tracked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-3xl font-bold mb-3">Ready to start tracking?</h2>
          <p className="text-gray-400 mb-6">
            Join the community and keep track of every chapter.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl 
                       font-semibold text-lg transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}