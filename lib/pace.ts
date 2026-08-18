// Reading pace + streak math for the stats sheet. Pure: folds a year of
// Activity rows (see lib/folio.ts for the row shape and the chapter-delta
// parsing it reuses) into windows, streaks, rhythms, and finish estimates.
import { chapterDelta, streakDays, type ActivityRow } from "@/lib/folio";

/** Local calendar-day key, e.g. 20260815 — the unit streaks and rhythms count in. */
export function dayKey(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** Local midnight for a day key. */
function keyToDate(key: number): Date {
  return new Date(Math.floor(key / 10000), Math.floor((key % 10000) / 100) - 1, key % 100);
}

/** Longest run of consecutive days that each carry at least one mark. */
export function longestStreak(dates: Date[]): number {
  const days = [...new Set(dates.map(dayKey))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let expected: number | null = null; // the key that would extend the current run
  for (const key of days) {
    run = key === expected ? run + 1 : 1;
    best = Math.max(best, run);
    const next = keyToDate(key);
    next.setDate(next.getDate() + 1); // via Date so month/year rollovers (and DST) resolve
    expected = dayKey(next);
  }
  return best;
}

/** Chapters logged per local day (chapter_update forward progress only). */
export function chaptersByDay(activities: ActivityRow[]): Map<number, number> {
  const days = new Map<number, number>();
  for (const a of activities) {
    if (a.type !== "chapter_update") continue;
    const delta = chapterDelta(a.detail);
    if (delta <= 0) continue;
    const key = dayKey(a.createdAt);
    days.set(key, (days.get(key) ?? 0) + delta);
  }
  return days;
}

export type PaceStats = {
  /** Chapters logged in the trailing 7 / 30 / 90 / 365 days. */
  chapters: { week: number; month: number; quarter: number; year: number };
  /** Chapters per day over the trailing 30 days — the number "at this pace" projections use. */
  perDay: number;
  /** Days with any mark in the trailing 90. */
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  bestDay: { date: Date; chapters: number } | null;
  /** Chapters by weekday, index 0 = Monday. */
  weekdays: number[];
  /** Chapters per calendar month for the trailing 12, oldest first. */
  months: { label: string; chapters: number }[];
};

function daysAgo(now: Date, n: number): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - n + 1); // trailing n days, today inclusive
  return d;
}

/** Fold a year of activity rows into the stats sheet's pace module. */
export function buildPaceStats(activities: ActivityRow[], now: Date): PaceStats {
  const perDayMap = chaptersByDay(activities);
  const week = daysAgo(now, 7);
  const month = daysAgo(now, 30);
  const quarter = daysAgo(now, 90);
  const year = daysAgo(now, 365);

  const sumSince = (from: Date) => {
    const fromKey = dayKey(from);
    let sum = 0;
    for (const [key, n] of perDayMap) if (key >= fromKey) sum += n;
    return sum;
  };
  const chapters = {
    week: sumSince(week),
    month: sumSince(month),
    quarter: sumSince(quarter),
    year: sumSince(year),
  };

  const quarterKey = dayKey(quarter);
  const activeDays = new Set(
    activities.map((a) => dayKey(a.createdAt)).filter((k) => k >= quarterKey)
  ).size;

  let bestDay: PaceStats["bestDay"] = null;
  for (const [key, n] of perDayMap) {
    if (!bestDay || n > bestDay.chapters) {
      bestDay = { date: keyToDate(key), chapters: n };
    }
  }

  const weekdays = Array.from({ length: 7 }, () => 0);
  for (const [key, n] of perDayMap) {
    weekdays[(keyToDate(key).getDay() + 6) % 7] += n; // Sunday-first → Monday-first
  }

  const months: PaceStats["months"] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const from = dayKey(start);
    const to = dayKey(end);
    let total = 0;
    for (const [key, n] of perDayMap) if (key >= from && key < to) total += n;
    months.push({
      label: start.toLocaleDateString("en-US", { month: "short" }).toLowerCase(),
      chapters: total,
    });
  }

  const dates = activities.map((a) => a.createdAt);
  return {
    chapters,
    perDay: chapters.month / 30,
    activeDays,
    currentStreak: streakDays(dates, now),
    longestStreak: longestStreak(dates),
    bestDay,
    weekdays,
    months,
  };
}

/**
 * Days until `current` reaches `target` at `perDay` chapters a day — null when
 * there's no target, no pace, or nothing left to read.
 */
export function daysToFinish(current: number, target: number | null, perDay: number): number | null {
  if (target == null || perDay <= 0) return null;
  const remaining = target - current;
  if (remaining <= 0) return null;
  return Math.ceil(remaining / perDay);
}
