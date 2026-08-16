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
  type ActivityRow,
} from "@/lib/folio";

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
    expect(isoWeek(new Date(2026, 7, 15))).toBe(33);
  });

  it("puts early January in week 1 when it holds the first Thursday", () => {
    // 2026-01-01 is a Thursday, so week 1 starts Monday 2025-12-29.
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1);
    expect(isoWeek(new Date(2025, 11, 29))).toBe(1);
  });
});

describe("weekStart", () => {
  it("returns the Monday of a mid-week date", () => {
    expect(weekStart(new Date(2026, 7, 15))).toEqual(new Date(2026, 7, 10));
  });

  it("treats Sunday as the end of the week, not the start", () => {
    expect(weekStart(new Date(2026, 7, 16))).toEqual(new Date(2026, 7, 10));
  });

  it("returns the same day at midnight for a Monday", () => {
    expect(weekStart(new Date(2026, 7, 10, 23, 59))).toEqual(new Date(2026, 7, 10));
  });
});

describe("folioLine", () => {
  it("builds the masthead line from join date and now", () => {
    expect(folioLine(new Date(2025, 10, 2), new Date(2026, 7, 15))).toBe(
      "Week of August 10, 2026 · Vol. II · No. 33"
    );
  });

  it("uses Vol. I in the join year", () => {
    expect(folioLine(new Date(2026, 0, 5), new Date(2026, 7, 15))).toContain("Vol. I ·");
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
  const from = new Date(2026, 7, 10);
  const titles = { 1: "Lord of the Mysteries", 2: "Vagabond", 3: "Reverend Insanity" };

  const rows: ActivityRow[] = [
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 330 → 341", createdAt: new Date(2026, 7, 13) },
    { type: "chapter_update", novelId: 2, detail: "Vagabond — Chapter 195 → 198", createdAt: new Date(2026, 7, 12) },
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 325 → 330", createdAt: new Date(2026, 7, 11) },
    { type: "chapter_update", novelId: 2, detail: "Vagabond — Corrected chapter to 198", createdAt: new Date(2026, 7, 12) },
    { type: "rating", novelId: 3, detail: "Rated Reverend Insanity — 9.5/10", createdAt: new Date(2026, 7, 12) },
    { type: "rating", novelId: 2, detail: "Removed rating from Vagabond", createdAt: new Date(2026, 7, 12) },
    // Before the week — must be ignored.
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 300 → 325", createdAt: new Date(2026, 7, 8) },
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
  const now = new Date(2026, 7, 15, 20, 0);

  it("counts consecutive days ending today", () => {
    const dates = [new Date(2026, 7, 15, 8), new Date(2026, 7, 14), new Date(2026, 7, 13)];
    expect(streakDays(dates, now)).toBe(3);
  });

  it("starts from yesterday when today is still blank", () => {
    const dates = [new Date(2026, 7, 14), new Date(2026, 7, 13)];
    expect(streakDays(dates, now)).toBe(2);
  });

  it("breaks on a gap", () => {
    const dates = [new Date(2026, 7, 15), new Date(2026, 7, 13)];
    expect(streakDays(dates, now)).toBe(1);
  });

  it("returns zero with no recent activity", () => {
    expect(streakDays([new Date(2026, 7, 1)], now)).toBe(0);
    expect(streakDays([], now)).toBe(0);
  });
});

describe("buildMonthLedger", () => {
  const now = new Date(2026, 7, 15, 12);

  const rows: ActivityRow[] = [
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 330 → 341", createdAt: new Date(2026, 7, 13) },
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 325 → 330", createdAt: new Date(2026, 7, 13) },
    { type: "chapter_update", novelId: 2, detail: "Vagabond — Chapter 195 → 198", createdAt: new Date(2026, 7, 2) },
    { type: "chapter_update", novelId: 2, detail: "Vagabond — Corrected chapter to 198", createdAt: new Date(2026, 7, 2) },
    { type: "status_change", novelId: 3, detail: "Reverend Insanity — Reading → Completed", createdAt: new Date(2026, 7, 9) },
    { type: "status_change", novelId: 2, detail: "Vagabond — Reading → On Hold", createdAt: new Date(2026, 7, 9) },
    { type: "rating", novelId: 3, detail: "Rated Reverend Insanity — 9.5/10", createdAt: new Date(2026, 7, 9) },
    { type: "rating", novelId: 2, detail: "Removed rating from Vagabond", createdAt: new Date(2026, 7, 10) },
    // Last month — must be ignored.
    { type: "chapter_update", novelId: 1, detail: "Lord of the Mysteries — Chapter 300 → 325", createdAt: new Date(2026, 6, 31) },
    { type: "status_change", novelId: 1, detail: "Solo Leveling — Reading → Completed", createdAt: new Date(2026, 6, 20) },
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

  it("returns a blank ledger for a quiet month", () => {
    const ledger = buildMonthLedger([], new Date(2026, 7, 1));
    expect(ledger).toEqual({ days: [0], chapters: 0, finished: 0, ratings: 0 });
  });
});
