"use client";

import { useState } from "react";
import Link from "next/link";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import FolioPlusOne from "@/components/FolioPlusOne";
import { chaptersBehind, type WeekDigest } from "@/lib/folio";

interface ReadingEntry {
  id: number;
  currentChapter: number;
  updatedAt: string;
  novel: {
    id: number;
    title: string;
    nativeTitle: string | null;
    totalChapters: number | null;
    latestChapter: number | null;
    author: string | null;
  };
}

function shortDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toLowerCase();
}

/** The signed-in home — the Weekly Edition sheet. */
export default function LoggedInHome({
  folio,
  statusDate,
  digest,
  streak,
  finishedThisYear,
  initialReading,
}: {
  folio: string;
  statusDate: string;
  digest: WeekDigest;
  streak: number;
  finishedThisYear: number;
  initialReading: ReadingEntry[];
}) {
  const [reading, setReading] = useState<ReadingEntry[]>(initialReading);

  const handleChapterUpdate = (entryId: number, newChapter: number) => {
    setReading(
      reading.map((e) =>
        e.id === entryId ? { ...e, currentChapter: newChapter } : e
      )
    );
  };

  const pace =
    digest.totalChapters > 0 ? (digest.totalChapters / 7).toFixed(1) : "0";
  const yearShort = String(new Date().getFullYear()).slice(2);
  const [top, second] = digest.titles;
  const rating = digest.ratings[0];

  return (
    <FolioSheet
      statusLeft="webnovelist"
      statusRight={`${statusDate} · ${reading.length} reading`}
      footer="ink & gold · the weekly edition"
    >
      {/* Masthead */}
      <div className="border-b border-hairline px-4 pb-6 pt-7 text-center">
        <h1 className="font-serif text-3xl font-semibold text-paper">
          Web<span className="text-gold">Novelist</span>
        </h1>
        <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
          The Weekly Edition · {folio}
        </p>
      </div>

      {/* This week — the digest, written up rather than widgeted */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel
          right={
            digest.totalChapters > 0
              ? `${digest.totalChapters} chapters`
              : undefined
          }
        >
          This week
        </FolioLabel>
        <p className="font-serif text-[15px] leading-relaxed text-body">
          {!top && !rating ? (
            <>A quiet week — no chapters logged yet. The shelf is patient.</>
          ) : (
            <>
              {top && (
                <>
                  The week belonged to{" "}
                  <em className="text-paper">{top.title}</em> —{" "}
                  {top.chapters} chapter{top.chapters !== 1 && "s"}
                  {second && (
                    <>
                      {" "}
                      — with <em className="text-paper">{second.title}</em> at{" "}
                      {second.chapters}
                    </>
                  )}
                  .{" "}
                </>
              )}
              {rating && (
                <>
                  {digest.ratings.length === 1
                    ? "One rating filed"
                    : `${digest.ratings.length} ratings filed`}
                  : <em className="text-paper">{rating.title}</em>,{" "}
                  <span className="text-gold">★ {rating.score}</span>.
                </>
              )}
            </>
          )}
        </p>
      </div>

      {/* Continuing — dot-leader contents rows */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel
          right={
            <Link
              href="/list"
              className="normal-case tracking-normal text-gold transition hover:text-gold-bright"
            >
              [library]
            </Link>
          }
        >
          Continuing
        </FolioLabel>

        {reading.length === 0 ? (
          <p className="font-serif text-[15px] text-muted">
            Nothing in progress.{" "}
            <Link
              href="/browse"
              className="text-gold transition hover:text-gold-bright"
            >
              Browse the catalog
            </Link>{" "}
            to pick something up.
          </p>
        ) : (
          <div className="divide-y divide-hairline">
            {reading.map((entry) => {
              const total = entry.novel.totalChapters;
              const pct = total
                ? Math.min(
                    Math.round((entry.currentChapter / total) * 100),
                    100
                  )
                : null;
              const behind = chaptersBehind(entry.currentChapter, entry.novel.latestChapter);
              return (
                <div key={entry.id} className="py-2.5 first:pt-0.5 last:pb-0.5">
                  <div className="flex items-baseline gap-2.5">
                    <Link
                      href={`/novel/${entry.novel.id}`}
                      className="min-w-0 truncate font-serif text-[15px] text-paper transition hover:text-gold"
                    >
                      {entry.novel.title}
                    </Link>
                    <span aria-hidden className="leader-dots flex-1" />
                    <span className="shrink-0 font-mono text-[11px] text-gold tabular-nums">
                      ch. {entry.currentChapter}
                      {total ? `/${total}` : ""}
                    </span>
                    <FolioPlusOne
                      entryId={entry.id}
                      currentChapter={entry.currentChapter}
                      totalChapters={total}
                      onUpdate={(ch) => handleChapterUpdate(entry.id, ch)}
                    />
                  </div>
                  <div className="mt-0.5 flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate font-cjk text-[11px] text-faint">
                      {entry.novel.nativeTitle ?? entry.novel.author ?? ""}
                    </span>
                    <span className="shrink-0 font-mono text-[9.5px] text-faint tabular-nums">
                      {pct !== null ? `${pct}% · ` : ""}
                      {behind !== null && behind > 0 ? `${behind} behind · ` : ""}
                      {shortDate(entry.updatedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline">
        {[
          { label: "pace", value: pace, unit: "ch / day" },
          { label: "streak", value: String(streak), unit: streak === 1 ? "day" : "days" },
          { label: `finished ’${yearShort}`, value: String(finishedThisYear), unit: finishedThisYear === 1 ? "title" : "titles" },
        ].map((cell) => (
          <div key={cell.label} className="px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              {cell.label}
            </p>
            <p className="mt-1.5 font-mono text-base text-paper tabular-nums">
              {cell.value}
              <span className="ml-1.5 text-[10px] text-muted">{cell.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
