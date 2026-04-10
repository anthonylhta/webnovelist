// app/LoggedInHome.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Star, TrendingUp, CheckCircle,
  ChevronRight, BookMarked, Loader2,
} from "lucide-react";
import QuickChapterUpdate from "@/components/QuickChapterUpdate";

interface ReadingEntry {
  id: number;
  currentChapter: number;
  updatedAt: string;
  novel: {
    id: number;
    title: string;
    titleChinese: string | null;
    coverImageUrl: string | null;
    totalChapters: number | null;
    author: string | null;
  };
}

interface HomeStats {
  totalNovels: number;
  readingCount: number;
  completedCount: number;
  totalChapters: number;
  avgRating: string | null;
}

interface RecentNovel {
  id: number;
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  genres: string[];
  createdAt: string;
}

export default function LoggedInHome({ userName }: { userName: string }) {
  const [reading, setReading] = useState<ReadingEntry[]>([]);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [recentNovels, setRecentNovels] = useState<RecentNovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/home").then((r) => r.json()),
      fetch("/api/novels?recent=true").then((r) => r.json()),
    ])
      .then(([homeData, novels]) => {
        if (homeData.reading) setReading(homeData.reading);
        if (homeData.stats) setStats(homeData.stats);
        if (Array.isArray(novels)) setRecentNovels(novels.slice(0, 10));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChapterUpdate = (entryId: number, newChapter: number) => {
    setReading(
      reading.map((e) =>
        e.id === entryId ? { ...e, currentChapter: newChapter } : e
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-gray-400 mt-1">Here&apos;s your reading overview.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Total"
            value={stats.totalNovels.toString()}
            color="text-blue-500"
          />
          <StatCard
            icon={<BookMarked className="w-5 h-5" />}
            label="Reading"
            value={stats.readingCount.toString()}
            color="text-green-500"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Completed"
            value={stats.completedCount.toString()}
            color="text-emerald-500"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Chapters"
            value={stats.totalChapters.toLocaleString()}
            color="text-blue-400"
          />
          <StatCard
            icon={<Star className="w-5 h-5 fill-yellow-500" />}
            label="Avg Rating"
            value={stats.avgRating || "—"}
            color="text-yellow-500"
          />
        </div>
      )}

      {/* Continue Reading */}
      {reading.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-green-500" />
              Continue Reading
            </h2>
            <Link
              href="/list"
              className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center gap-1"
            >
              Full List <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reading.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4
                           hover:border-gray-700 transition"
              >
                <div className="flex gap-4">
                  {/* Cover */}
                  <Link href={`/novel/${entry.novel.id}`} className="shrink-0">
                    <img
                      src={
                        entry.novel.coverImageUrl ||
                        "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"
                      }
                      alt={entry.novel.title}
                      className="w-16 h-22 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/novel/${entry.novel.id}`}
                      className="font-semibold truncate block hover:text-blue-400 transition"
                    >
                      {entry.novel.title}
                    </Link>
                    {entry.novel.author && (
                      <p className="text-sm text-gray-500 truncate">
                        {entry.novel.author}
                      </p>
                    )}

                    {/* Chapter Progress */}
                    <div className="mt-2">
                      <QuickChapterUpdate
                        entryId={entry.id}
                        currentChapter={entry.currentChapter}
                        totalChapters={entry.novel.totalChapters}
                        onUpdate={(ch) => handleChapterUpdate(entry.id, ch)}
                      />
                      {entry.novel.totalChapters && (
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-blue-500 rounded-full h-1.5"
                            style={{
                              width: `${Math.min(
                                (entry.currentChapter / entry.novel.totalChapters) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state if not reading anything */}
      {reading.length === 0 && (
        <section className="mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <BookMarked className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Nothing in progress</h3>
            <p className="text-gray-500 text-sm mb-4">
              Start reading a novel and it&apos;ll show up here.
            </p>
            <Link
              href="/browse"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm transition"
            >
              Browse Novels
            </Link>
          </div>
        </section>
      )}

      {/* Recently Added to Site */}
      {recentNovels.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              Recently Added
            </h2>
            <Link
              href="/browse"
              className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center gap-1"
            >
              Browse All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4">
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
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}