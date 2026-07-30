import { describe, it, expect, vi, afterEach } from "vitest";
import {
  fetchAniListEntries,
  AniListUserNotFoundError,
  mediaTypeFromAniList,
  listStatusFromAniList,
  novelStatusFromAniList,
  dateFromAniList,
  stripAniListHtml,
  titleFromAniList,
  primaryAuthor,
} from "@/lib/anilist";

const makeEntry = (mediaId: number, status = "CURRENT") => ({
  status,
  progress: 10,
  score: 8,
  repeat: 0,
  startedAt: { year: null, month: null, day: null },
  completedAt: { year: null, month: null, day: null },
  media: {
    id: mediaId,
    format: "MANGA",
    countryOfOrigin: "JP",
    chapters: null,
    status: "RELEASING",
    genres: [],
    description: null,
    coverImage: null,
    title: { english: `Title ${mediaId}`, romaji: null, native: null },
    staff: { edges: [] },
  },
});

const mockFetch = (body: unknown, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status < 400,
      status,
      json: () => Promise.resolve(body),
    })
  );

afterEach(() => vi.unstubAllGlobals());

describe("fetchAniListEntries", () => {
  it("flattens status lists and dedupes by media id", async () => {
    mockFetch({
      data: {
        MediaListCollection: {
          lists: [
            { isCustomList: false, entries: [makeEntry(1), makeEntry(2)] },
            { isCustomList: false, entries: [makeEntry(2, "COMPLETED"), makeEntry(3)] },
          ],
        },
      },
    });
    const entries = await fetchAniListEntries("someone");
    expect(entries.map((e) => e.media.id)).toEqual([1, 2, 3]);
  });

  it("skips custom lists entirely", async () => {
    mockFetch({
      data: {
        MediaListCollection: {
          lists: [
            { isCustomList: true, entries: [makeEntry(9)] },
            { isCustomList: false, entries: [makeEntry(1)] },
          ],
        },
      },
    });
    const entries = await fetchAniListEntries("someone");
    expect(entries.map((e) => e.media.id)).toEqual([1]);
  });

  it("throws AniListUserNotFoundError on a 404", async () => {
    mockFetch({ errors: [{ message: "Not Found.", status: 404 }] }, 404);
    await expect(fetchAniListEntries("ghost")).rejects.toThrow(AniListUserNotFoundError);
  });

  it("throws a plain error on other failures", async () => {
    mockFetch({ errors: [{ message: "rate limited", status: 429 }] }, 429);
    await expect(fetchAniListEntries("someone")).rejects.toThrow(/429/);
  });
});

describe("mediaTypeFromAniList", () => {
  it("splits NOVEL by origin", () => {
    expect(mediaTypeFromAniList("NOVEL", "JP")).toBe("light_novel");
    expect(mediaTypeFromAniList("NOVEL", "KR")).toBe("webnovel");
    expect(mediaTypeFromAniList("NOVEL", "CN")).toBe("webnovel");
  });

  it("splits comics by origin", () => {
    expect(mediaTypeFromAniList("MANGA", "KR")).toBe("manhwa");
    expect(mediaTypeFromAniList("MANGA", "CN")).toBe("manhua");
    expect(mediaTypeFromAniList("MANGA", "JP")).toBe("manga");
    expect(mediaTypeFromAniList("ONE_SHOT", "JP")).toBe("manga");
  });
});

describe("listStatusFromAniList", () => {
  it("maps every AniList status onto ours", () => {
    expect(listStatusFromAniList("CURRENT")).toBe("reading");
    expect(listStatusFromAniList("REPEATING")).toBe("reading");
    expect(listStatusFromAniList("COMPLETED")).toBe("completed");
    expect(listStatusFromAniList("PAUSED")).toBe("on_hold");
    expect(listStatusFromAniList("DROPPED")).toBe("dropped");
    expect(listStatusFromAniList("PLANNING")).toBe("plan_to_read");
  });
});

describe("novelStatusFromAniList", () => {
  it("maps release statuses", () => {
    expect(novelStatusFromAniList("RELEASING")).toBe("Ongoing");
    expect(novelStatusFromAniList("FINISHED")).toBe("Completed");
    expect(novelStatusFromAniList("HIATUS")).toBe("Hiatus");
    expect(novelStatusFromAniList("CANCELLED")).toBe("Hiatus");
    expect(novelStatusFromAniList(null)).toBeNull();
  });
});

describe("dateFromAniList", () => {
  it("builds a UTC date, defaulting missing parts to 1", () => {
    expect(dateFromAniList({ year: 2024, month: 3, day: 15 })?.toISOString()).toBe(
      "2024-03-15T00:00:00.000Z"
    );
    expect(dateFromAniList({ year: 2024, month: null, day: null })?.toISOString()).toBe(
      "2024-01-01T00:00:00.000Z"
    );
  });

  it("returns null without a year", () => {
    expect(dateFromAniList({ year: null, month: 3, day: 15 })).toBeNull();
  });
});

describe("stripAniListHtml", () => {
  it("converts breaks and strips tags/entities", () => {
    expect(stripAniListHtml("Line one.<br><br />Line <i>two</i> &amp; three&#039;s")).toBe(
      "Line one.\n\nLine two & three's"
    );
  });
});

describe("titleFromAniList", () => {
  it("prefers english, then romaji, then native", () => {
    expect(titleFromAniList({ english: "E", romaji: "R", native: "N" })).toBe("E");
    expect(titleFromAniList({ english: null, romaji: "R", native: "N" })).toBe("R");
    expect(titleFromAniList({ english: null, romaji: null, native: "N" })).toBe("N");
  });
});

describe("primaryAuthor", () => {
  it("prefers writing roles over art", () => {
    const staff = {
      edges: [
        { role: "Art", node: { name: { full: "Artist" } } },
        { role: "Story", node: { name: { full: "Writer" } } },
      ],
    };
    expect(primaryAuthor(staff)).toBe("Writer");
  });

  it("matches role prefixes like 'Original Story'", () => {
    const staff = {
      edges: [{ role: "Original Story", node: { name: { full: "Novelist" } } }],
    };
    expect(primaryAuthor(staff)).toBe("Novelist");
  });

  it("falls back to the first credit, or null", () => {
    expect(
      primaryAuthor({ edges: [{ role: "Art", node: { name: { full: "Artist" } } }] })
    ).toBe("Artist");
    expect(primaryAuthor({ edges: [] })).toBeNull();
  });
});
