"use client";

import { useState } from "react";
import Image from "next/image";
import { safeImageSrc } from "@/lib/image-hosts";
import Link from "next/link";
import { BookOpen, ChevronRight, BookMarked } from "lucide-react";
import QuickChapterUpdate from "@/components/QuickChapterUpdate";
import NovelCard from "@/components/NovelCard";

interface ReadingEntry {
  id: number;
  currentChapter: number;
  novel: {
    id: number;
    title: string;
    nativeTitle: string | null;
    coverImageUrl: string | null;
    totalChapters: number | null;
    author: string | null;
  };
}

interface RecentNovel {
  id: number;
  title: string;
  nativeTitle: string | null;
  author: string | null;
  coverImageUrl: string | null;
}

export default function LoggedInHome({
  userName,
  initialReading,
  recentNovels,
}: {
  userName: string;
  initialReading: ReadingEntry[];
  recentNovels: RecentNovel[];
}) {
  const [reading, setReading] = useState<ReadingEntry[]>(initialReading);

  const handleChapterUpdate = (entryId: number, newChapter: number) => {
    setReading(reading.map((e) => e.id === entryId ? { ...e, currentChapter: newChapter } : e));
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-dim mb-2">Welcome back</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-paper">
          {userName}
        </h1>
        <p className="mt-2 text-sm sm:text-base">
          <Link href={`/user/${userName}`} className="text-muted hover:text-gold transition">
            View your profile →
          </Link>
        </p>
      </div>

      {/* Continue Reading */}
      {reading.length > 0 && (
        <section className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper flex items-center gap-2.5">
              <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              Continue Reading
            </h2>
            <Link href="/list" className="text-muted hover:text-gold transition text-sm flex items-center gap-1">
              Full List <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reading.map((entry, i) => (
              <div key={entry.id} className="bg-surface border border-hairline rounded-lg p-4 hover:border-gold-dim transition">
                <div className="flex gap-4">
                  <Link href={`/novel/${entry.novel.id}`} className="shrink-0">
                    <Image
                      src={safeImageSrc(entry.novel.coverImageUrl, "/default-cover.svg")}
                      alt={entry.novel.title}
                      width={64}
                      height={88}
                      priority={i === 0}
                      className="object-cover rounded-md ring-1 ring-hairline"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/novel/${entry.novel.id}`} className="font-serif text-paper truncate block hover:text-gold transition">
                      {entry.novel.title}
                    </Link>
                    {entry.novel.nativeTitle ? (
                      <p className="font-cjk text-xs text-muted truncate">{entry.novel.nativeTitle}</p>
                    ) : entry.novel.author && (
                      <p className="text-sm text-faint truncate">{entry.novel.author}</p>
                    )}
                    <div className="mt-2">
                      <QuickChapterUpdate
                        entryId={entry.id}
                        currentChapter={entry.currentChapter}
                        totalChapters={entry.novel.totalChapters}
                        onUpdate={(ch) => handleChapterUpdate(entry.id, ch)}
                      />
                      {entry.novel.totalChapters && (
                        <div className="w-full bg-hairline rounded-full h-1.5 mt-2">
                          <div
                            className="bg-gold rounded-full h-1.5"
                            style={{ width: `${Math.min((entry.currentChapter / entry.novel.totalChapters) * 100, 100)}%` }}
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
            {reading.map((entry, i) => (
              <div key={entry.id} className="bg-surface border border-hairline rounded-lg p-3">
                <div className="flex gap-3 min-w-0">
                  <Link href={`/novel/${entry.novel.id}`} className="shrink-0">
                    <Image
                      src={safeImageSrc(entry.novel.coverImageUrl, "/default-cover.svg")}
                      alt={entry.novel.title}
                      width={48}
                      height={64}
                      priority={i === 0}
                      className="object-cover rounded-md ring-1 ring-hairline"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <Link href={`/novel/${entry.novel.id}`} className="font-serif text-sm text-paper truncate block hover:text-gold transition">
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
                        <div className="w-full bg-hairline rounded-full h-1 mt-1.5">
                          <div
                            className="bg-gold rounded-full h-1"
                            style={{ width: `${Math.min((entry.currentChapter / entry.novel.totalChapters) * 100, 100)}%` }}
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

      {reading.length === 0 && (
        <section className="mb-10 sm:mb-12">
          <div className="bg-surface border border-hairline rounded-lg p-6 sm:p-10 text-center">
            <BookMarked className="w-8 h-8 sm:w-10 sm:h-10 text-faint mx-auto mb-3" />
            <h3 className="font-serif text-lg text-paper mb-1">Nothing in progress</h3>
            <p className="text-muted text-xs sm:text-sm mb-5">Start reading a novel and it&apos;ll show up here.</p>
            <Link href="/browse" className="inline-block bg-gold text-ink hover:bg-gold-bright px-5 py-2 rounded-md text-sm font-medium transition">
              Browse Library
            </Link>
          </div>
        </section>
      )}

      {recentNovels.length > 0 && (
        <section className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-paper flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              Recently Added
            </h2>
            <Link href="/browse" className="text-muted hover:text-gold transition text-sm flex items-center gap-1">
              Browse All <ChevronRight className="w-4 h-4" />
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
                footer={novel.nativeTitle ? null : <p className="text-xs text-faint truncate">{novel.author}</p>}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
