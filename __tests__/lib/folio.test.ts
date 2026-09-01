import { describe, it, expect } from "vitest";

import {
  romanNumeral,
  isoWeek,
  weekStart,
  folioLine,
  chapterDelta,
  ratingScore,
  buildWeekDigest,
  streakDays,
  buildMonthLedger,
  chaptersBehind,
  type ActivityRow,
} from "@/lib/folio";

// Sydney wall-clock instants (AEST +10 in winter, AEDT +11 in summer) so the
// suite means the same thing under any process timezone.
const aest = (local: string) => new Date(`${local}+10:00`);
const aedt = (local: string) => new Date(`${local}+11:00`);

describe("romanNumeral", () => {
  it("converts small numbers", () => {
    expect(romanNumeral(1)).toBe("I");
    expect(romanNumeral(2)).toBe("II");
    expect(romanNumeral(4)).toBe("IV");
    expect(romanNumeral(9)).toBe("IX");
    expect(romanNumeral(14)).toBe("XIV");
  });

  it("clamps zero and negatives to I", () => {
    expect(romanNumeral(0)).toBe("I");
    expect(romanNumeral(-3)).toBe("I");
  });
});

describe("isoWeek", () => {
  it("returns week 33 for Saturday 2026-08-15", () => {
    expect(isoWeek(aest("2026-08-15T00:00:00"))).toBe(33);
  });

  it("puts early January in week 1 when it holds the first Thursday", () => {
    // 2026-01-01 is a Thursday, so week 1 starts Monday 2025-12-29.
    expect(isoWeek(aedt("2026-01-01T00:00:00"))).toBe(1);
    expect(isoWeek(aedt("2025-12-29T00:00:00"))).toBe(1);
  });
});

describe("weekStart", () => {
  it("returns Sydney midnight on the Monday of a mid-week date", () => {
    expect(weekStart(aest("2026-08-15T00:00:00"))).toEqual(aest("2026-08-10T00:00:00"));
  });

  it("treats Sunday as the end of the week, not the start", () => {
    expect(weekStart(aest("2026-08-16T00:00:00"))).toEqual(aest("2026-08-10T00:00:00"));
  });

  it("returns the same day at midnight for a Monday", () => {
    expect(weekStart(aest("2026-08-10T23:59:00"))).toEqual(aest("2026-08-10T00:00:00"));
  });

  it("reads the weekday off the Sydney clock, not UTC", () => {
    // Sunday 15:00 UTC is already Monday 01:00 in Sydney.
    expect(weekStart(new Date("2026-08-09T15:00:00Z"))).toEqual(aest("2026-08-10T00:00:00"));
  });
});

describe("folioLine", () => {
  it("builds the masthead line from join date and now", () => {
    expect(folioLine(aedt("2025-11-02T00:00:00"), aest("2026-08-15T00:00:00"))).toBe(
      "Week of August 10, 2026 · Vol. II · No. 33"
    );
  });

  it("uses Vol. I in the join year", () => {
    expect(folioLine(aedt("2026-01-05T00:00:00"), aest("2026-08-15T00:00:00"))).toContain("Vol. I ·");
  });
});

describe("chapterDelta", () => {
  it("reads the forward-arrow form", () => {
    expect(chapterDelta("Lord of the Mysteries — Chapter 45 → 46")).toBe(1);
    expect(chapterDelta("Shadow Slave — Chapter 100 → 118")).toBe(18);
  });

  it("counts corrections and unparsable details as zero", () => {
    expect(chapterDelta("Berserk — Corrected chapter to 45")).toBe(0);
    expect(chapterDelta(null)).toBe(0);
    expect(chapterDelta("Started reading")).toBe(0);
  });
});

describe("ratingScore", () => {
  it("reads the rated form", () => {
    expect(ratingScore("Rated Reverend Insanity — 9.5/10")).toBe(9.5);
    expect(ratingScore("Rated Solo Leveling — 8/10")).toBe(8);
  });

  it("returns null for removals and null details", () => {
    expect(ratingScore("Removed rating from Solo Leveling")).toBeNull();
    expect(ratingScore(null)).toBeNull();
  });
});

describe("buildWeekDigest", () => {
  const from = aest("2026-08-10T00:00:00");
  const titles = { 1: "Lord of the Mysteries", 2: "Vagabond", 3: "Reverend Insanity" };

  const rows: ActivityRow[] = [
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 330 → 341", createdAt: aest("2026-08-13T00:00:00") },
    { type: "chapter_update", novelId: 2, detail: "Vagabond — Chapter 195 → 198", createdAt: aest("2026-08-12T00:00:00") },
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 325 → 330", createdAt: aest("2026-08-11T00:00:00") },
    { type: "chapter_update", novelId: 2, detail: "Vagabond — Corrected chapter to 198", createdAt: aest("2026-08-12T00:00:00") },
    { type: "rating", novelId: 3, detail: "Rated Reverend Insanity — 9.5/10", createdAt: aest("2026-08-12T00:00:00") },
    { type: "rating", novelId: 2, detail: "Removed rating from Vagabond", createdAt: aest("2026-08-12T00:00:00") },
    // Before the week — must be ignored.
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 300 → 325", createdAt: aest("2026-08-08T00:00:00") },
  ];

  it("sums chapters per title, most-read first, inside the week only", () => {
    const digest = buildWeekDigest(rows, titles, from);
    expect(digest.totalChapters).toBe(19);
    expect(digest.titles).toEqual([
      { novelId: 1, title: "Lord of the Mysteries", chapters: 16 },
      { novelId: 2, title: "Vagabond", chapters: 3 },
    ]);
  });

  it("keeps filed ratings and drops removals", () => {
    const digest = buildWeekDigest(rows, titles, from);
    expect(digest.ratings).toEqual([
      { novelId: 3, title: "Reverend Insanity", score: 9.5 },
    ]);
  });

  it("returns an empty digest for a quiet week", () => {
    const digest = buildWeekDigest([], titles, from);
    expect(digest.totalChapters).toBe(0);
    expect(digest.titles).toEqual([]);
    expect(digest.ratings).toEqual([]);
  });
});

describe("streakDays", () => {
  const now = aest("2026-08-15T20:00:00");

  it("counts consecutive days ending today", () => {
    const dates = [aest("2026-08-15T08:00:00"), aest("2026-08-14T00:00:00"), aest("2026-08-13T00:00:00")];
    expect(streakDays(dates, now)).toBe(3);
  });

  it("starts from yesterday when today is still blank", () => {
    const dates = [aest("2026-08-14T00:00:00"), aest("2026-08-13T00:00:00")];
    expect(streakDays(dates, now)).toBe(2);
  });

  it("breaks on a gap", () => {
    const dates = [aest("2026-08-15T00:00:00"), aest("2026-08-13T00:00:00")];
    expect(streakDays(dates, now)).toBe(1);
  });

  it("returns zero with no recent activity", () => {
    expect(streakDays([aest("2026-08-01T00:00:00")], now)).toBe(0);
    expect(streakDays([], now)).toBe(0);
  });

  it("files a late-UTC mark on the Sydney day it fell on", () => {
    // 22:00 UTC on the 14th is 08:00 on the 15th in Sydney — today, not yesterday.
    expect(streakDays([new Date("2026-08-14T22:00:00Z"), aest("2026-08-14T00:00:00")], now)).toBe(2);
  });
});

describe("buildMonthLedger", () => {
  const now = aest("2026-08-15T12:00:00");

  const rows: ActivityRow[] = [
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 330 → 341", createdAt: aest("2026-08-13T00:00:00") },
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 325 → 330", createdAt: aest("2026-08-13T00:00:00") },
    { type: "chapter_update", novelId: 2, detail: "Vagabond — Chapter 195 → 198", createdAt: aest("2026-08-02T00:00:00") },
    { type: "chapter_update", novelId: 2, detail: "Vagabond — Corrected chapter to 198", createdAt: aest("2026-08-02T00:00:00") },
    { type: "status_change", novelId: 3, detail: "Reverend Insanity — Reading → Completed", createdAt: aest("2026-08-09T00:00:00") },
    { type: "status_change", novelId: 2, detail: "Vagabond — Reading → On Hold", createdAt: aest("2026-08-09T00:00:00") },
    { type: "rating", novelId: 3, detail: "Rated Reverend Insanity — 9.5/10", createdAt: aest("2026-08-09T00:00:00") },
    { type: "rating", novelId: 2, detail: "Removed rating from Vagabond", createdAt: aest("2026-08-10T00:00:00") },
    // Last month — must be ignored.
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 300 → 325", createdAt: aest("2026-07-31T00:00:00") },
    { type: "status_change", novelId: 1, detail: "Solo Leveling — Reading → Completed", createdAt: aest("2026-07-20T00:00:00") },
  ];

  it("lays chapters onto the days of the month so far", () => {
    const ledger = buildMonthLedger(rows, now);
    expect(ledger.days).toHaveLength(15);
    expect(ledger.days[1]).toBe(3);
    expect(ledger.days[12]).toBe(16);
    expect(ledger.chapters).toBe(19);
  });

  it("counts completions and filed ratings, ignoring other moves and removals", () => {
    const ledger = buildMonthLedger(rows, now);
    expect(ledger.finished).toBe(1);
    expect(ledger.ratings).toBe(1);
  });

  it("files a mark by its Sydney day, so a late-UTC July mark opens August", () => {
    // 15:00 UTC on Jul 31 is 01:00 on Aug 1 in Sydney.
    const rows: ActivityRow[] = [
      { type: "chapter_update", novelId: 1, detail: "Title — Chapter 1 → 3", createdAt: new Date("2026-07-31T15:00:00Z") },
    ];
    expect(buildMonthLedger(rows, now).days[0]).toBe(2);
  });

  it("returns a blank ledger for a quiet month", () => {
    const ledger = buildMonthLedger([], aest("2026-08-01T00:00:00"));
    expect(ledger).toEqual({ days: [0], chapters: 0, finished: 0, ratings: 0 });
  });
});

describe("chaptersBehind", () => {
  it("counts the gap to the latest released chapter", () => {
    expect(chaptersBehind(341, 353)).toBe(12);
  });

  it("is zero when caught up or ahead of stale data", () => {
    expect(chaptersBehind(353, 353)).toBe(0);
    expect(chaptersBehind(360, 353)).toBe(0);
  });

  it("is null when the latest chapter is unknown", () => {
    expect(chaptersBehind(341, null)).toBeNull();
  });
});
