// Pure helpers for the Folio redesign: the masthead's folio line (volume =
// years since the reader joined, number = ISO week) and the week-digest math
// that turns Activity rows into the home page's "This week" module.

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
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Local midnight on the Monday of `date`'s week. */
export function weekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

/** "Week of August 10, 2026 · Vol. II · No. 33" — the masthead's folio line. */
export function folioLine(joinedAt: Date, now: Date): string {
  const monday = weekStart(now);
  const week = monday.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const vol = romanNumeral(now.getFullYear() - joinedAt.getFullYear() + 1);
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
  const key = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const days = new Set(dates.map(key));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
  let run = 0;
  while (days.has(key(cursor))) {
    run++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return run;
}
