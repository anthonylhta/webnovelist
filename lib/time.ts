// lib/time.ts — the app keeps one clock: Sydney (AEST/AEDT). Every date the
// sheets show, and every calendar day the ledgers, streaks and heatmap count
// in, is read off it — whatever zone the server (UTC on Vercel) or the
// viewer's browser runs in. Calendar days travel as numeric keys (20260815)
// so they compare, step and Map without touching the process timezone.

export const TIME_ZONE = "Australia/Sydney";

const WALL_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

type WallClock = { year: number; month: number; day: number; hour: number; minute: number; second: number };

/** Sydney wall-clock fields of an instant (month 1–12, hour 0–23). */
export function calendar(d: Date): WallClock {
  const f = {} as WallClock;
  for (const p of WALL_CLOCK.formatToParts(d)) {
    if (p.type !== "literal") f[p.type as keyof WallClock] = Number(p.value);
  }
  return f;
}

/** Day key for calendar fields; overflow rolls over like Date (month 13 → January next year). */
export function toKey(year: number, month: number, day: number): number {
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

/** Sydney calendar-day key of an instant, e.g. 20260815. */
export function dayKey(d: Date): number {
  const { year, month, day } = calendar(d);
  return year * 10000 + month * 100 + day;
}

/** A key's calendar day as a UTC-midnight Date — a carrier for arithmetic, not an instant. */
function utc(key: number): Date {
  return new Date(Date.UTC(Math.floor(key / 10000), Math.floor((key % 10000) / 100) - 1, key % 100));
}

/** Step a day key by n calendar days. */
export function shiftDay(key: number, n: number): number {
  return toKey(Math.floor(key / 10000), Math.floor((key % 10000) / 100), (key % 100) + n);
}

/** Weekday of a day key, 0 = Sunday. */
export function weekday(key: number): number {
  return utc(key).getUTCDay();
}

/** Sydney's UTC offset in ms at an instant (+10h AEST, +11h AEDT). */
function offsetAt(d: Date): number {
  const { year, month, day, hour, minute, second } = calendar(d);
  return Date.UTC(year, month - 1, day, hour, minute, second) - (d.getTime() - d.getUTCMilliseconds());
}

/** The instant Sydney's clock reads 00:00 on the day. */
export function startOfDay(key: number): Date {
  const wall = utc(key).getTime(); // the midnight reading, taken as if it were UTC
  const guess = new Date(wall - offsetAt(new Date(wall)));
  // Re-read the offset at the guess: DST flips at 2–3am, so the offset in
  // force at midnight can differ from the one at the first reading (which
  // lands mid-morning Sydney time) — never from the one an hour either side.
  return new Date(wall - offsetAt(guess));
}

/** A calendar day as text, e.g. formatDay(20260815, { month: "short", day: "numeric" }) → "Aug 15". */
export function formatDay(key: number, opts: Intl.DateTimeFormatOptions): string {
  return utc(key).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

/** An instant's Sydney date as text. */
export function formatDate(d: Date | string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(d).toLocaleDateString("en-US", { ...opts, timeZone: TIME_ZONE });
}

/** An instant's Sydney clock time as text, e.g. "9:05 pm". */
export function formatTime(d: Date | string): string {
  return new Date(d)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE })
    .toLowerCase();
}
