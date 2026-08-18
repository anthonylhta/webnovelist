import { describe, it, expect } from "vitest";

import {
  dayKey,
  longestStreak,
  chaptersByDay,
  buildPaceStats,
  daysToFinish,
} from "@/lib/pace";
import type { ActivityRow } from "@/lib/folio";

const ch = (novelId: number, from: number, to: number, createdAt: Date): ActivityRow => ({
  type: "chapter_update",
  novelId,
  detail: `Title — Chapter ${from} → ${to}`,
  createdAt,
});

describe("dayKey", () => {
  it("encodes the local calendar day", () => {
    expect(dayKey(new Date(2026, 7, 15, 23, 59))).toBe(20260815);
    expect(dayKey(new Date(2026, 0, 1, 0, 0))).toBe(20260101);
  });
});

describe("longestStreak", () => {
  it("finds the longest run of consecutive days", () => {
    const dates = [
      new Date(2026, 7, 1),
      new Date(2026, 7, 2),
      new Date(2026, 7, 2, 18), // same day twice
      new Date(2026, 7, 3),
      new Date(2026, 7, 10),
      new Date(2026, 7, 11),
    ];
    expect(longestStreak(dates)).toBe(3);
  });

  it("crosses month and year boundaries", () => {
    const dates = [new Date(2025, 11, 30), new Date(2025, 11, 31), new Date(2026, 0, 1), new Date(2026, 0, 2)];
    expect(longestStreak(dates)).toBe(4);
  });

  it("is zero with no marks and one for a lone day", () => {
    expect(longestStreak([])).toBe(0);
    expect(longestStreak([new Date(2026, 7, 1)])).toBe(1);
  });
});

describe("chaptersByDay", () => {
  it("sums forward chapter deltas per day and ignores corrections and other types", () => {
    const rows: ActivityRow[] = [
      ch(1, 10, 15, new Date(2026, 7, 1, 9)),
      ch(2, 3, 4, new Date(2026, 7, 1, 21)),
      { type: "chapter_update", novelId: 1, detail: "Title — Corrected chapter to 12", createdAt: new Date(2026, 7, 1) },
      { type: "rating", novelId: 1, detail: "Rated Title — 8/10", createdAt: new Date(2026, 7, 1) },
      ch(1, 15, 16, new Date(2026, 7, 2)),
    ];
    const days = chaptersByDay(rows);
    expect(days.get(20260801)).toBe(6);
    expect(days.get(20260802)).toBe(1);
    expect(days.size).toBe(2);
  });
});

describe("buildPaceStats", () => {
  const now = new Date(2026, 7, 15, 20); // Saturday

  const rows: ActivityRow[] = [
    ch(1, 100, 110, new Date(2026, 7, 15, 8)), // today, Sat: 10
    ch(1, 90, 100, new Date(2026, 7, 14)), // Fri: 10
    ch(2, 1, 21, new Date(2026, 7, 13)), // Thu: 20
    { type: "rating", novelId: 2, detail: "Rated Title — 9/10", createdAt: new Date(2026, 7, 12) }, // a mark, no chapters
    ch(1, 50, 60, new Date(2026, 6, 20)), // last month, inside 30d: 10
    ch(1, 20, 50, new Date(2026, 5, 1)), // ~75 days ago, inside 90d: 30 — best day
    ch(1, 0, 20, new Date(2025, 10, 1)), // last November, inside the year: 20
  ];

  const stats = buildPaceStats(rows, now);

  it("sums chapters over trailing windows", () => {
    expect(stats.chapters).toEqual({ week: 40, month: 50, quarter: 80, year: 100 });
    expect(stats.perDay).toBeCloseTo(50 / 30);
  });

  it("counts active days in the last 90 (marks of any type)", () => {
    expect(stats.activeDays).toBe(6);
  });

  it("reports current and longest streaks", () => {
    expect(stats.currentStreak).toBe(4); // 12th–15th
    expect(stats.longestStreak).toBe(4);
  });

  it("finds the best day", () => {
    expect(stats.bestDay).toEqual({ date: new Date(2026, 5, 1), chapters: 30 });
  });

  it("lays chapters onto weekdays, Monday first", () => {
    // Thu 20 + Sat 10 + Fri 10 + Mon(Jul 20) 10 + Mon(Jun 1) 30 + Sat(Nov 1) 20
    expect(stats.weekdays).toEqual([40, 0, 0, 20, 10, 30, 0]);
  });

  it("gives twelve months oldest first with this month last", () => {
    expect(stats.months).toHaveLength(12);
    expect(stats.months[11]).toEqual({ label: "aug", chapters: 40 });
    expect(stats.months[10]).toEqual({ label: "jul", chapters: 10 });
    expect(stats.months[9]).toEqual({ label: "jun", chapters: 30 });
    expect(stats.months[0]).toEqual({ label: "sep", chapters: 0 });
    // Last November sits inside the trailing twelve (Sep 2025 – Aug 2026).
    expect(stats.months.find((m) => m.label === "nov")?.chapters).toBe(20);
  });

  it("is all zeros for an empty ledger", () => {
    const empty = buildPaceStats([], now);
    expect(empty.chapters).toEqual({ week: 0, month: 0, quarter: 0, year: 0 });
    expect(empty.perDay).toBe(0);
    expect(empty.activeDays).toBe(0);
    expect(empty.currentStreak).toBe(0);
    expect(empty.longestStreak).toBe(0);
    expect(empty.bestDay).toBeNull();
    expect(empty.weekdays).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("daysToFinish", () => {
  it("rounds the remaining chapters up at the given pace", () => {
    expect(daysToFinish(100, 130, 2)).toBe(15);
    expect(daysToFinish(100, 131, 2)).toBe(16);
  });

  it("is null without a target, a pace, or anything left", () => {
    expect(daysToFinish(100, null, 2)).toBeNull();
    expect(daysToFinish(100, 200, 0)).toBeNull();
    expect(daysToFinish(200, 200, 2)).toBeNull();
    expect(daysToFinish(250, 200, 2)).toBeNull();
  });
});
