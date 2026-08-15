// app/stats/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolioSheet, FolioLabel, StatusSeal, LedgerBar } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

interface ListEntry {
  id: number;
  status: string;
  rating: number | null;
  currentChapter: number;
  dateStarted: string | null;
  dateFinished: string | null;
  novel: {
    id: number;
    title: string;
    totalChapters: number | null;
    genres: string[];
    author: string | null;
  };
}

export default function StatsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<ListEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && isSignedIn) {
      fetch("/api/list")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setList(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-xs text-muted">totting up the ledger…</div>
      </div>
    );
  }

  // Calculate stats
  const totalNovels = list.length;
  const statusCounts = {
    reading: list.filter((e) => e.status === "reading").length,
    completed: list.filter((e) => e.status === "completed").length,
    on_hold: list.filter((e) => e.status === "on_hold").length,
    dropped: list.filter((e) => e.status === "dropped").length,
    plan_to_read: list.filter((e) => e.status === "plan_to_read").length,
  };

  const ratedNovels = list.filter((e) => e.rating !== null);
  const averageRating =
    ratedNovels.length > 0
      ? (ratedNovels.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedNovels.length).toFixed(1)
      : "—";

  const totalChaptersRead = list.reduce((sum, e) => sum + e.currentChapter, 0);

  // Genre breakdown
  const genreCounts: Record<string, number> = {};
  list.forEach((entry) => {
    entry.novel.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const maxGenreCount = sortedGenres.length > 0 ? sortedGenres[0][1] : 0;

  // Author breakdown (top 5)
  const authorCounts: Record<string, number> = {};
  list.forEach((entry) => {
    if (entry.novel.author) {
      authorCounts[entry.novel.author] = (authorCounts[entry.novel.author] || 0) + 1;
    }
  });
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Rating distribution
  const ratingBuckets: Record<string, number> = {};
  for (let i = 1; i <= 10; i++) {
    ratingBuckets[i.toString()] = 0;
  }
  ratedNovels.forEach((entry) => {
    const bucket = Math.ceil(entry.rating || 0).toString();
    if (ratingBuckets[bucket] !== undefined) {
      ratingBuckets[bucket]++;
    }
  });
  const maxRatingCount = Math.max(...Object.values(ratingBuckets), 1);

  // Highest and lowest rated
  const sortedByRating = [...ratedNovels].sort(
    (a, b) => (b.rating || 0) - (a.rating || 0)
  );
  const highestRated = sortedByRating[0];
  const lowestRated = sortedByRating[sortedByRating.length - 1];
  const mostRead =
    list.length > 0
      ? list.reduce((max, e) => (e.currentChapter > max.currentChapter ? e : max))
      : null;

  if (totalNovels === 0) {
    return (
      <FolioSheet statusLeft="webnovelist · ledger" footer="ink & gold">
        <div className="px-4 py-14 text-center">
          <p className="font-serif text-[15px] text-muted">
            The ledger is blank.{" "}
            <Link href="/browse" className="text-gold transition hover:text-gold-bright">
              Browse the catalog
            </Link>{" "}
            to start filling it.
          </p>
        </div>
        <FolioNav />
      </FolioSheet>
    );
  }

  const highlightRows = [
    highestRated && {
      label: "highest rated",
      title: highestRated.novel.title,
      value: `★ ${highestRated.rating}`,
    },
    lowestRated && ratedNovels.length > 1
      ? {
          label: "lowest rated",
          title: lowestRated.novel.title,
          value: `★ ${lowestRated.rating}`,
        }
      : null,
    mostRead && {
      label: "furthest in",
      title: mostRead.novel.title,
      value: `${mostRead.currentChapter.toLocaleString()} ch`,
    },
  ].filter(Boolean) as { label: string; title: string; value: string }[];

  return (
    <FolioSheet
      statusLeft="webnovelist · ledger"
      statusRight={`${totalNovels} title${totalNovels !== 1 ? "s" : ""}`}
      footer={`ink & gold · ${totalChaptersRead.toLocaleString()} chapters read`}
    >
      {/* Status counts — one cell per seal */}
      <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline sm:grid-cols-5">
        {(Object.keys(statusCounts) as (keyof typeof statusCounts)[]).map((status) => (
          <div key={status} className="flex items-center justify-center gap-2.5 px-2 py-3">
            <StatusSeal status={status} />
            <span className="font-mono text-[15px] text-paper tabular-nums">
              {statusCounts[status]}
            </span>
          </div>
        ))}
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline">
        {[
          {
            label: "avg rating",
            value: averageRating === "—" ? "—" : `★ ${averageRating}`,
            unit: `${ratedNovels.length} rated`,
          },
          {
            label: "chapters read",
            value: totalChaptersRead.toLocaleString(),
            unit: "all titles",
          },
          {
            label: "completion",
            value: `${Math.round((statusCounts.completed / totalNovels) * 100)}%`,
            unit: `${statusCounts.completed} of ${totalNovels}`,
          },
        ].map((cell) => (
          <div key={cell.label} className="px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              {cell.label}
            </p>
            <p className="mt-1.5 font-mono text-base text-paper tabular-nums">{cell.value}</p>
            <p className="mt-0.5 font-mono text-[9.5px] text-faint tabular-nums">{cell.unit}</p>
          </div>
        ))}
      </div>

      {/* Rating distribution */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel right={`${ratedNovels.length} rated`}>Rating distribution</FolioLabel>
        {ratedNovels.length === 0 ? (
          <p className="font-serif text-[14.5px] text-muted">Nothing rated yet.</p>
        ) : (
          <div className="space-y-1.5">
            {Object.entries(ratingBuckets)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-6 text-right font-mono text-[10.5px] text-muted tabular-nums">
                    {rating}
                  </span>
                  <LedgerBar value={count} max={maxRatingCount} />
                  <span className="w-6 font-mono text-[10.5px] text-muted tabular-nums">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Genre breakdown */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Genres</FolioLabel>
        {sortedGenres.length === 0 ? (
          <p className="font-serif text-[14.5px] text-muted">No genre data yet.</p>
        ) : (
          <div className="space-y-1.5">
            {sortedGenres.map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-3">
                <span className="w-28 truncate font-mono text-[10.5px] text-muted">
                  {genre.toLowerCase()}
                </span>
                <LedgerBar value={count} max={maxGenreCount} />
                <span className="w-6 font-mono text-[10.5px] text-muted tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top authors */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Most-read authors</FolioLabel>
        {topAuthors.length === 0 ? (
          <p className="font-serif text-[14.5px] text-muted">No author data yet.</p>
        ) : (
          <div className="divide-y divide-hairline">
            {topAuthors.map(([author, count]) => (
              <div key={author} className="flex items-baseline gap-2.5 py-2 first:pt-0 last:pb-0">
                <span className="min-w-0 truncate font-serif text-[14.5px] text-paper">
                  {author}
                </span>
                <span aria-hidden className="leader-dots flex-1" />
                <span className="shrink-0 font-mono text-[10.5px] text-gold tabular-nums">
                  {count} title{count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Highlights */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Highlights</FolioLabel>
        <div className="divide-y divide-hairline">
          {highlightRows.map((row) => (
            <div key={row.label} className="flex items-baseline gap-2.5 py-2 first:pt-0 last:pb-0">
              <span className="w-28 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted">
                {row.label}
              </span>
              <span className="min-w-0 truncate font-serif text-[14.5px] text-paper">
                {row.title}
              </span>
              <span aria-hidden className="leader-dots flex-1" />
              <span className="shrink-0 font-mono text-[10.5px] text-gold tabular-nums">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
