// Alternative titles for a catalog row — romaji, acronyms ("LOTM"), other
// English renderings. Entered one per line; stored as a string array.
export const MAX_ALT_TITLES = 20;
export const MAX_ALT_TITLE_LENGTH = 200;

/** Lines (or an array) → trimmed, de-duplicated (case-insensitive), capped list. */
export function parseAltTitles(input: unknown): string[] {
  const parts: string[] = Array.isArray(input)
    ? input.filter((v): v is string => typeof v === "string")
    : typeof input === "string"
      ? input.split(/\r?\n|;/)
      : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of parts) {
    const t = raw.trim().slice(0, MAX_ALT_TITLE_LENGTH);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= MAX_ALT_TITLES) break;
  }
  return out;
}
