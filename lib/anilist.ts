// lib/anilist.ts
// Client + mappers for importing a user's AniList manga/novel list.
// AniList's `type: MANGA` covers manga, manhwa, manhua, and light novels /
// published webnovels (format NOVEL). The API is public GraphQL — no auth
// needed to read a public list.
import type { MediaType } from "@/lib/media-types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

export interface AniListFuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AniListEntry {
  status: "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING";
  progress: number;
  /** Normalized 0–10 scale (0 = unrated) regardless of the user's scoring setting. */
  score: number;
  repeat: number;
  startedAt: AniListFuzzyDate;
  completedAt: AniListFuzzyDate;
  media: {
    id: number;
    format: string | null;
    countryOfOrigin: string;
    chapters: number | null;
    status: string | null;
    genres: string[];
    description: string | null;
    coverImage: { large: string | null } | null;
    title: { english: string | null; romaji: string | null; native: string | null };
    staff: { edges: { role: string; node: { name: { full: string | null } } }[] };
  };
}

const LIST_QUERY = `query ($userName: String) {
  MediaListCollection(userName: $userName, type: MANGA) {
    lists {
      isCustomList
      entries {
        status
        progress
        score(format: POINT_10_DECIMAL)
        repeat
        startedAt { year month day }
        completedAt { year month day }
        media {
          id
          format
          countryOfOrigin
          chapters
          status
          genres
          description
          coverImage { large }
          title { english romaji native }
          staff(perPage: 4) { edges { role node { name { full } } } }
        }
      }
    }
  }
}`;

export class AniListUserNotFoundError extends Error {
  constructor(userName: string) {
    super(`AniList user "${userName}" not found`);
  }
}

/**
 * Fetches every entry of a user's public manga/novel list. Skips custom lists
 * (their entries also appear in the status lists) and dedupes by media id.
 */
export async function fetchAniListEntries(userName: string): Promise<AniListEntry[]> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: LIST_QUERY, variables: { userName } }),
    cache: "no-store",
  });

  if (res.status === 404) throw new AniListUserNotFoundError(userName);
  if (!res.ok) throw new Error(`AniList request failed with status ${res.status}`);

  const json = await res.json();
  if (json.errors?.some((e: { status?: number }) => e.status === 404)) {
    throw new AniListUserNotFoundError(userName);
  }
  if (json.errors?.length) {
    throw new Error(`AniList returned an error: ${json.errors[0].message}`);
  }

  const lists: { isCustomList: boolean; entries: AniListEntry[] }[] =
    json.data?.MediaListCollection?.lists ?? [];

  const seen = new Set<number>();
  const entries: AniListEntry[] = [];
  for (const list of lists) {
    if (list.isCustomList) continue;
    for (const entry of list.entries) {
      if (seen.has(entry.media.id)) continue;
      seen.add(entry.media.id);
      entries.push(entry);
    }
  }
  return entries;
}

/** AniList format + country of origin → our media type. */
export function mediaTypeFromAniList(format: string | null, countryOfOrigin: string): MediaType {
  if (format === "NOVEL") {
    // KR/CN "novels" on AniList are (published) webnovels; JP ones are light novels
    return countryOfOrigin === "JP" ? "light_novel" : "webnovel";
  }
  if (countryOfOrigin === "KR") return "manhwa";
  if (countryOfOrigin === "CN" || countryOfOrigin === "TW") return "manhua";
  return "manga";
}

/** AniList entry status → our reading-list status. */
export function listStatusFromAniList(status: AniListEntry["status"]): string {
  switch (status) {
    case "CURRENT":
    case "REPEATING":
      return "reading";
    case "COMPLETED":
      return "completed";
    case "PAUSED":
      return "on_hold";
    case "DROPPED":
      return "dropped";
    default:
      return "plan_to_read";
  }
}

/** AniList media status → our novel status (Ongoing / Completed / Hiatus). */
export function novelStatusFromAniList(status: string | null): string | null {
  switch (status) {
    case "RELEASING":
    case "NOT_YET_RELEASED":
      return "Ongoing";
    case "FINISHED":
      return "Completed";
    case "HIATUS":
    case "CANCELLED":
      return "Hiatus";
    default:
      return null;
  }
}

/** Fuzzy date → Date (needs at least a year; missing month/day default to 1). */
export function dateFromAniList(d: AniListFuzzyDate): Date | null {
  if (!d.year) return null;
  return new Date(Date.UTC(d.year, (d.month ?? 1) - 1, d.day ?? 1));
}

/** AniList descriptions are HTML — turn breaks into newlines, drop the rest. */
export function stripAniListHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .trim();
}

/** Best display title: english, then romaji, then native. */
export function titleFromAniList(title: AniListEntry["media"]["title"]): string | null {
  return title.english ?? title.romaji ?? title.native;
}

const AUTHOR_ROLES = ["Story & Art", "Story", "Original Story", "Original Creator"];

/** The staff member most likely to be "the author" (writer over artist). */
export function primaryAuthor(staff: AniListEntry["media"]["staff"]): string | null {
  for (const role of AUTHOR_ROLES) {
    const edge = staff.edges.find((e) => e.role.startsWith(role));
    if (edge?.node.name.full) return edge.node.name.full;
  }
  return staff.edges[0]?.node.name.full ?? null;
}
