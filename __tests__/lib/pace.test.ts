import { describe, it, expect } from "vitest";

import { longestStreak, chaptersByDay, buildPaceStats, daysToFinish } from "@/lib/pace";
import type { ActivityRow } from "@/lib/folio";

// Sydney wall-clock instants (AEST +10 in winter, AEDT +11 in summer) so the
// suite means the same thing under any process timezone.
const aest = (local: string) => new Date(`${local}+10:00`);
const aedt = (local: string) => new Date(`${local}+11:00`);

const ch = (novelId: number, from: number, to: number, createdAt: Date): ActivityRow => ({
  type: "chapter_update",
  novelId,
  detail: `Title — Chapter ${from} → ${to}`,
  createdAt,
});

describe("longestStreak", () => {
  it("finds the longest run of consecutive days", () => {
    const dates = [
      aest("2026-08-01T00:00:00"),
      aest("2026-08-02T00:00:00"),
      aest("2026-08-02T18:00:00"), // same day twice
      aest("2026-08-03T00:00:00"),
      aest("2026-08-10T00:00:00"),
      aest("2026-08-11T00:00:00"),
    ];
    expect(longestStreak(dates)).toBe(3);
  });

  it("crosses month and year boundaries", () => {
    const dates = [
      aedt("2025-12-30T00:00:00"),
      aedt("2025-12-31T00:00:00"),
      aedt("2026-01-01T00:00:00"),
      aedt("2026-01-02T00:00:00"),
    ];
    expect(longestStreak(dates)).toBe(4);
  });

  it("counts Sydney days, not UTC ones", () => {
    // 23:00 UTC on Aug 1 is 09:00 on Aug 2 in Sydney — it runs into Aug 3.
    const dates = [new Date("2026-08-01T23:00:00Z"), aest("2026-08-03T00:00:00")];
    expect(longestStreak(dates)).toBe(2);
  });

  it("is zero with no marks and one for a lone day", () => {
    expect(longestStreak([])).toBe(0);
    expect(longestStreak([aest("2026-08-01T00:00:00")])).toBe(1);
  });
});

describe("chaptersByDay", () => {
  it("sums forward chapter deltas per day and ignores corrections and other types", () => {
    const rows: ActivityRow[] = [
      ch(1, 10, 15, aest("2026-08-01T09:00:00")),
      ch(2, 3, 4, aest("2026-08-01T21:00:00")),
      { type: "chapter_update", novelId: 1, detail: "Title — Corrected chapter to 12", createdAt: aest("2026-08-01T00:00:00") },
      { type: "rating", novelId: 1, detail: "Rated Title — 8/10", createdAt: aest("2026-08-01T00:00:00") },
      ch(1, 15, 16, aest("2026-08-02T00:00:00")),
    ];
    const days = chaptersByDay(rows);
    expect(days.get(20260801)).toBe(6);
    expect(days.get(20260802)).toBe(1);
    expect(days.size).toBe(2);
  });

  it("buckets by Sydney day, not UTC", () => {
    // 22:00 UTC on the 15th is 08:00 on the 16th in Sydney.
    const days = chaptersByDay([ch(1, 1, 2, new Date("2026-08-15T22:00:00Z"))]);
    expect(days.get(20260816)).toBe(1);
    expect(days.has(20260815)).toBe(false);
  });
});

describe("buildPaceStats", () => {
  const now = aest("2026-08-15T20:00:00"); // Saturday

  const rows: ActivityRow[] = [
    ch(1, 100, 110, aest("2026-08-15T08:00:00")), // today, Sat: 10
    ch(1, 90, 100, aest("2026-08-14T00:00:00")), // Fri: 10
    ch(2, 1, 21, aest("2026-08-13T00:00:00")), // Thu: 20
    { type: "rating", novelId: 2, detail: "Rated Title — 9/10", createdAt: aest("2026-08-12T00:00:00") }, // a mark, no chapters
    ch(1, 50, 60, aest("2026-07-20T00:00:00")), // last month, inside 30d: 10
    ch(1, 20, 50, aest("2026-06-01T00:00:00")), // ~75 days ago, inside 90d: 30 — best day
    ch(1, 0, 20, aedt("2025-11-01T00:00:00")), // last November, inside the year: 20
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
    expect(stats.bestDay).toEqual({ day: 20260601, chapters: 30 });
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
