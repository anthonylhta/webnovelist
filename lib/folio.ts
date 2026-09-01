// Pure helpers for the Folio redesign: the masthead's folio line (volume =
// years since the reader joined, number = ISO week) and the week-digest math
// that turns Activity rows into the home page's "This week" module.
// Days are Sydney calendar days keyed by lib/time.ts.
import { calendar, dayKey, formatDate, shiftDay, startOfDay, toKey, weekday } from "@/lib/time";

/** Roman numeral for the masthead volume (small numbers only — years). */
export function romanNumeral(n: number): string {
  const pairs: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  let rest = Math.max(1, Math.floor(n));
  for (const [value, glyph] of pairs) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

/** ISO 8601 week number (weeks start Monday; week 1 holds the year's first Thursday). */
export function isoWeek(date: Date): number {
  const c = calendar(date);
  const d = new Date(Date.UTC(c.year, c.month - 1, c.day));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Sydney midnight on the Monday of `date`'s week. */
export function weekStart(date: Date): Date {
  const key = dayKey(date);
  const day = weekday(key);
  return startOfDay(shiftDay(key, -(day === 0 ? 6 : day - 1)));
}

/** "Week of August 10, 2026 · Vol. II · No. 33" — the masthead's folio line. */
export function folioLine(joinedAt: Date, now: Date): string {
  const week = formatDate(weekStart(now), {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const vol = romanNumeral(calendar(now).year - calendar(joinedAt).year + 1);
  return `Week of ${week} · Vol. ${vol} · No. ${isoWeek(now)}`;
}

/**
 * Chapters a chapter_update represents. The API writes
 * "Title — Chapter 45 → 46" for forward progress and
 * "Title — Corrected chapter to 45" for backward edits; corrections and
 * anything unparsable count as zero chapters read.
 */
export function chapterDelta(detail: string | null): number {
  const m = detail?.match(/Chapter (\d+) → (\d+)/);
  if (!m) return 0;
  return Math.max(0, Number(m[2]) - Number(m[1]));
}

/** Score from a rating activity ("Rated Title — 8.5/10"); null for removals. */
export function ratingScore(detail: string | null): number | null {
  const m = detail?.match(/— (\d+(?:\.\d+)?)\/10$/);
  return m ? Number(m[1]) : null;
}

export type ActivityRow = {
  type: string;
  novelId: number | null;
  detail: string | null;
  createdAt: Date;
};

export type WeekDigest = {
  totalChapters: number;
  /** Chapters per title this week, most-read first. */
  titles: { novelId: number; title: string; chapters: number }[];
  /** Ratings filed this week (removals excluded). */
  ratings: { novelId: number; title: string; score: number }[];
};

/** Fold this week's activities into the "This week" module's numbers. */
export function buildWeekDigest(
  activities: ActivityRow[],
  titleOf: Record<number, string>,
  from: Date
): WeekDigest {
  const chapters = new Map<number, number>();
  const ratings: WeekDigest["ratings"] = [];

  for (const a of activities) {
    if (a.createdAt < from || a.novelId === null) continue;
    if (a.type === "chapter_update") {
      const delta = chapterDelta(a.detail);
      if (delta > 0) chapters.set(a.novelId, (chapters.get(a.novelId) ?? 0) + delta);
    } else if (a.type === "rating") {
      const score = ratingScore(a.detail);
      if (score !== null) ratings.push({ novelId: a.novelId, title: titleOf[a.novelId] ?? "", score });
    }
  }

  const titles = [...chapters.entries()]
    .map(([novelId, count]) => ({ novelId, title: titleOf[novelId] ?? "", chapters: count }))
    .sort((a, b) => b.chapters - a.chapters);

  return {
    totalChapters: titles.reduce((sum, t) => sum + t.chapters, 0),
    titles,
    ratings,
  };
}

/**
 * Consecutive days with at least one activity, counting back from today —
 * or from yesterday when today is still blank, so an unbroken run isn't
 * reported as zero before the day's first chapter.
 */
export function streakDays(dates: Date[], now: Date): number {
  const days = new Set(dates.map(dayKey));
  let cursor = dayKey(now);
  if (!days.has(cursor)) cursor = shiftDay(cursor, -1);
  let run = 0;
  while (days.has(cursor)) {
    run++;
    cursor = shiftDay(cursor, -1);
  }
  return run;
}

export type MonthLedger = {
  /** Chapters read on each day of the month so far, index 0 = the 1st. */
  days: number[];
  chapters: number;
  /** Titles moved to Completed this month. */
  finished: number;
  /** Ratings filed this month (removals excluded). */
  ratings: number;
};

/** Fold this month's activities into the library page's ledger strip. */
export function buildMonthLedger(activities: ActivityRow[], now: Date): MonthLedger {
  const { year, month, day: today } = calendar(now);
  const from = toKey(year, month, 1);
  const days = Array.from({ length: today }, () => 0);
  let finished = 0;
  let ratings = 0;

  for (const a of activities) {
    const key = dayKey(a.createdAt);
    if (key < from) continue;
    if (a.type === "chapter_update") {
      const delta = chapterDelta(a.detail);
      const day = (key % 100) - 1; // the key's day of month
      if (delta > 0 && day < days.length) days[day] += delta;
    } else if (a.type === "status_change") {
      if (a.detail?.endsWith("→ Completed")) finished++;
    } else if (a.type === "rating") {
      if (ratingScore(a.detail) !== null) ratings++;
    }
  }

  return { days, chapters: days.reduce((sum, n) => sum + n, 0), finished, ratings };
}

/**
 * How far behind the latest released chapter a reader is — null when the
 * title has no known latest chapter, 0 when caught up (or ahead of stale data).
 */
export function chaptersBehind(current: number, latest: number | null): number | null {
  if (latest == null) return null;
  return Math.max(0, latest - current);
}
