import { describe, it, expect } from "vitest";

import {
  calendar,
  dayKey,
  toKey,
  shiftDay,
  weekday,
  startOfDay,
  formatDay,
  formatDate,
  formatTime,
} from "@/lib/time";

// Instants are written with explicit offsets so the suite means the same
// thing under any process timezone (CI runs in UTC, dev in Sydney).
describe("calendar / dayKey", () => {
  it("reads the Sydney calendar day, not the UTC one", () => {
    // 23:30 UTC on the 15th is 09:30 AEST on the 16th.
    expect(dayKey(new Date("2026-08-15T23:30:00Z"))).toBe(20260816);
    expect(calendar(new Date("2026-08-15T23:30:00Z"))).toMatchObject({ year: 2026, month: 8, day: 16, hour: 9, minute: 30 });
  });

  it("follows daylight saving (AEDT, +11)", () => {
    // 13:30 UTC on Jan 15 is 00:30 AEDT on Jan 16.
    expect(dayKey(new Date("2026-01-15T13:30:00Z"))).toBe(20260116);
    expect(calendar(new Date("2026-01-15T13:30:00Z")).hour).toBe(0);
  });
});

describe("toKey / shiftDay / weekday", () => {
  it("rolls month and year overflow like Date", () => {
    expect(toKey(2026, 13, 1)).toBe(20270101);
    expect(toKey(2026, 0, 1)).toBe(20251201);
    expect(toKey(2026, 8, 32)).toBe(20260901);
  });

  it("steps across month and year boundaries", () => {
    expect(shiftDay(20260831, 1)).toBe(20260901);
    expect(shiftDay(20260101, -1)).toBe(20251231);
    expect(shiftDay(20260815, -363)).toBe(20250817);
  });

  it("knows the weekday, Sunday first", () => {
    expect(weekday(20260815)).toBe(6); // Saturday
    expect(weekday(20260816)).toBe(0); // Sunday
  });
});

describe("startOfDay", () => {
  it("is Sydney midnight in standard time", () => {
    expect(startOfDay(20260815)).toEqual(new Date("2026-08-14T14:00:00Z"));
  });

  it("is Sydney midnight in daylight time", () => {
    expect(startOfDay(20260115)).toEqual(new Date("2026-01-14T13:00:00Z"));
  });

  it("is right on the days DST starts and ends", () => {
    // 2026-10-04: clocks go 02:00 AEST → 03:00 AEDT. Midnight is still +10.
    expect(startOfDay(20261004)).toEqual(new Date("2026-10-03T14:00:00Z"));
    // 2026-04-05: clocks go 03:00 AEDT → 02:00 AEST. Midnight is still +11.
    expect(startOfDay(20260405)).toEqual(new Date("2026-04-04T13:00:00Z"));
  });

  it("round-trips through dayKey", () => {
    for (const key of [20260101, 20260405, 20260815, 20261004, 20261231]) {
      expect(dayKey(startOfDay(key))).toBe(key);
      expect(dayKey(new Date(startOfDay(key).getTime() - 1))).toBe(shiftDay(key, -1));
    }
  });
});

describe("formatting", () => {
  it("formats a calendar day", () => {
    expect(formatDay(20260815, { month: "short", day: "numeric", year: "numeric" })).toBe("Aug 15, 2026");
    expect(formatDay(20260815, { month: "short" })).toBe("Aug");
  });

  it("formats an instant on the Sydney clock", () => {
    const late = new Date("2026-08-15T23:30:00Z");
    expect(formatDate(late, { month: "short", day: "numeric" })).toBe("Aug 16");
    expect(formatTime(late)).toBe("9:30 am");
    expect(formatDate("2026-08-15T23:30:00Z", { weekday: "short" })).toBe("Sun");
  });
});
