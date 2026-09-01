// Reading pace + streak math for the stats sheet. Pure: folds a year of
// Activity rows (see lib/folio.ts for the row shape and the chapter-delta
// parsing it reuses) into windows, streaks, rhythms, and finish estimates.
// Days are Sydney calendar days keyed by lib/time.ts.
import { chapterDelta, streakDays, type ActivityRow } from "@/lib/folio";
import { calendar, dayKey, formatDay, shiftDay, toKey, weekday } from "@/lib/time";

/** Longest run of consecutive days that each carry at least one mark. */
export function longestStreak(dates: Date[]): number {
  const days = [...new Set(dates.map(dayKey))].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let expected: number | null = null; // the key that would extend the current run
  for (const key of days) {
    run = key === expected ? run + 1 : 1;
    best = Math.max(best, run);
    expected = shiftDay(key, 1);
  }
  return best;
}

/** Chapters logged per day (chapter_update forward progress only). */
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
  /** The day key (see lib/time.ts) that carried the most chapters. */
  bestDay: { day: number; chapters: number } | null;
  /** Chapters by weekday, index 0 = Monday. */
  weekdays: number[];
  /** Chapters per calendar month for the trailing 12, oldest first. */
  months: { label: string; chapters: number }[];
};

/** Fold a year of activity rows into the stats sheet's pace module. */
export function buildPaceStats(activities: ActivityRow[], now: Date): PaceStats {
  const perDayMap = chaptersByDay(activities);
  const today = dayKey(now);
  const daysAgo = (n: number) => shiftDay(today, 1 - n); // trailing n days, today inclusive

  const sumSince = (fromKey: number) => {
    let sum = 0;
    for (const [key, n] of perDayMap) if (key >= fromKey) sum += n;
    return sum;
  };
  const chapters = {
    week: sumSince(daysAgo(7)),
    month: sumSince(daysAgo(30)),
    quarter: sumSince(daysAgo(90)),
    year: sumSince(daysAgo(365)),
  };

  const quarterKey = daysAgo(90);
  const activeDays = new Set(
    activities.map((a) => dayKey(a.createdAt)).filter((k) => k >= quarterKey)
  ).size;

  let bestDay: PaceStats["bestDay"] = null;
  for (const [key, n] of perDayMap) {
    if (!bestDay || n > bestDay.chapters) {
      bestDay = { day: key, chapters: n };
    }
  }

  const weekdays = Array.from({ length: 7 }, () => 0);
  for (const [key, n] of perDayMap) {
    weekdays[(weekday(key) + 6) % 7] += n; // Sunday-first → Monday-first
  }

  const { year, month } = calendar(now);
  const months: PaceStats["months"] = [];
  for (let i = 11; i >= 0; i--) {
    const from = toKey(year, month - i, 1);
    const to = toKey(year, month - i + 1, 1);
    let total = 0;
    for (const [key, n] of perDayMap) if (key >= from && key < to) total += n;
    months.push({
      label: formatDay(from, { month: "short" }).toLowerCase(),
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
