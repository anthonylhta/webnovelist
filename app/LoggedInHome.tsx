// app/LoggedInHome.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, ChevronRight, BookMarked, Loader2,
} from "lucide-react";
import QuickChapterUpdate from "@/components/QuickChapterUpdate";

interface ReadingEntry {
  id: number;
  currentChapter: number;
  novel: {
    id: number;
    title: string;
    coverImageUrl: string | null;
    totalChapters: number | null;
    author: string | null;
  };
}

interface RecentNovel {
  id: number;
  title: string;
  author: string | null;
  coverImageUrl: string | null;
}

export default function LoggedInHome({ userName }: { userName: string }) {
  const [reading, setReading] = useState<ReadingEntry[]>([]);
  const [recentNovels, setRecentNovels] = useState<RecentNovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/home").then((r) => r.json()),
      fetch("/api/novels?recent=true").then((r) => r.json()),
    ])
      .then(([homeData, novels]) => {
        if (homeData.reading) setReading(homeData.reading);
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">
          <Link href={`/user/${userName}`} className="text-blue-400 hover:underline">
            View your profile →
          </Link>
        </p>
      </div>

      {/* Continue Reading */}
      {reading.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              Continue Reading
            </h2>
            <Link
              href="/list"
              className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center gap-1"
            >
              Full List <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reading.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition"
              >
                <div className="flex gap-4">
                  <Link href={`/novel/${entry.novel.id}`} className="shrink-0">
                    <Image
                      src={entry.novel.coverImageUrl || "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"}
                      alt={entry.novel.title}
                      width={64}
                      height={88}
                      className="object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/novel/${entry.novel.id}`}
                      className="font-semibold truncate block hover:text-blue-400 transition"
                    >
                      {entry.novel.title}
                    </Link>
                    {entry.novel.author && (
                      <p className="text-sm text-gray-500 truncate">{entry.novel.author}</p>
                    )}
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

          {/* Mobile Stacked */}
          <div className="md:hidden space-y-3">
            {reading.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-3"
              >
                <div className="flex gap-3 min-w-0">
                  <Link href={`/novel/${entry.novel.id}`} className="shrink-0">
                    <Image
                      src={entry.novel.coverImageUrl || "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"}
                      alt={entry.novel.title}
                      width={48}
                      height={64}
                      className="object-cover rounded-lg"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <Link
                      href={`/novel/${entry.novel.id}`}
                      className="font-semibold text-sm truncate block hover:text-blue-400 transition"
                    >
                      {entry.novel.title}
                    </Link>
                    <div className="mt-1.5">
                      <QuickChapterUpdate
                        entryId={entry.id}
                        currentChapter={entry.currentChapter}
                        totalChapters={entry.novel.totalChapters}
                        onUpdate={(ch) => handleChapterUpdate(entry.id, ch)}
                      />
                      {entry.novel.totalChapters && (
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-1.5">
                          <div
                            className="bg-blue-500 rounded-full h-1"
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

      {/* Empty reading state */}
      {reading.length === 0 && (
        <section className="mb-8 sm:mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8 text-center">
            <BookMarked className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-1 text-sm sm:text-base">Nothing in progress</h3>
            <p className="text-gray-500 text-xs sm:text-sm mb-4">
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
        <section className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              Recently Added
            </h2>
            <Link
              href="/browse"
              className="text-blue-400 hover:text-blue-300 transition text-sm flex items-center gap-1"
            >
              Browse All <ChevronRight className="w-4 h-4" />
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
                    src={novel.coverImageUrl || "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"}
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
        </section>
      )}
    </div>
  );
}