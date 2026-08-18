import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
  entryWeight,
  rankRecommendations,
  type Candidate,
  type LibraryEntry,
} from "@/lib/recommendations";

const shelf = (
  novelId: number,
  title: string,
  status: string,
  rating: number | null,
  novel: Partial<LibraryEntry["novel"]> = {}
): LibraryEntry => ({
  novelId,
  status,
  rating,
  novel: { title, genres: [], tags: [], author: null, mediaType: "webnovel", ...novel },
});

const cand = (id: number, title: string, novel: Partial<Candidate> = {}): Candidate => ({
  id,
  title,
  nativeTitle: null,
  mediaType: "webnovel",
  genres: [],
  tags: [],
  author: null,
  trackers: 0,
  ...novel,
});

describe("entryWeight", () => {
  it("weights by status when unrated", () => {
    expect(entryWeight({ status: "completed", rating: null })).toBe(1.2);
    expect(entryWeight({ status: "reading", rating: null })).toBe(1);
    expect(entryWeight({ status: "plan_to_read", rating: null })).toBe(0.4);
    expect(entryWeight({ status: "dropped", rating: null })).toBe(-0.5);
  });

  it("swings on the rating: 10 doubles, 5 cancels, low pushes away", () => {
    expect(entryWeight({ status: "reading", rating: 10 })).toBe(1);
    expect(entryWeight({ status: "completed", rating: 10 })).toBeCloseTo(1.2);
    expect(entryWeight({ status: "completed", rating: 5 })).toBe(0);
    expect(entryWeight({ status: "completed", rating: 2 })).toBeLessThan(0);
  });
});

describe("rankRecommendations", () => {
  const library = [
    shelf(1, "Lord of the Mysteries", "completed", 10, {
      genres: ["Mystery", "Fantasy"],
      tags: ["Smart MC"],
      author: "Cuttlefish",
    }),
    shelf(2, "Reverend Insanity", "reading", null, { genres: ["Xianxia", "Fantasy"], tags: ["Villain MC"] }),
    shelf(3, "Bad Romance", "dropped", 2, { genres: ["Romance"], tags: ["Fluff"] }),
  ];

  it("returns nothing for an empty shelf", () => {
    expect(rankRecommendations({ library: [], candidates: [cand(9, "X")], relations: [], coReaders: [] })).toEqual([]);
  });

  it("prefers genres and tags the reader rated well, and skips what they dropped", () => {
    const candidates = [
      cand(10, "Mystery Fantasy", { genres: ["Mystery", "Fantasy"], tags: ["Smart MC"] }),
      cand(11, "Plain Fantasy", { genres: ["Fantasy"] }),
      cand(12, "Fluffy Romance", { genres: ["Romance"], tags: ["Fluff"] }),
      cand(13, "Unrelated", { genres: ["Sports"] }),
    ];
    const recs = rankRecommendations({ library, candidates, relations: [], coReaders: [] });
    expect(recs.map((r) => r.novel.id)).toEqual([10, 11]);
    // Fantasy is on two shelf titles, so it leads the list.
    expect(recs[0].reason).toBe("shares fantasy · mystery · smart mc with your shelf");
  });

  it("puts a continuation of a shelf title first and says so", () => {
    const candidates = [
      cand(20, "LotM: Circle of Inevitability", { genres: ["Mystery"] }),
      cand(21, "LotM Manhua", { mediaType: "manhua" }),
      cand(10, "Mystery Fantasy", { genres: ["Mystery", "Fantasy"], tags: ["Smart MC"] }),
    ];
    const relations = [
      { fromId: 1, toId: 20, kind: "sequel" }, // 20 is the sequel of 1
      { fromId: 21, toId: 1, kind: "source" }, // 1 is the source of 21 → 21 is an adaptation
    ];
    const recs = rankRecommendations({ library, candidates, relations, coReaders: [] });
    expect(recs.map((r) => r.novel.id)).toEqual([20, 21, 10]);
    expect(recs[0].reason).toBe("sequel of Lord of the Mysteries");
    expect(recs[1].reason).toBe("adaptation of Lord of the Mysteries");
  });

  it("ignores continuations of titles the reader dropped", () => {
    const candidates = [cand(22, "Bad Romance 2", { genres: ["Romance"] }), cand(11, "Plain Fantasy", { genres: ["Fantasy"] })];
    const relations = [{ fromId: 3, toId: 22, kind: "sequel" }];
    const recs = rankRecommendations({ library, candidates, relations, coReaders: [] });
    expect(recs.map((r) => r.novel.id)).toEqual([11]);
  });

  it("credits the same author", () => {
    const candidates = [cand(30, "Cuttlefish's other book", { author: "Cuttlefish" }), cand(11, "Plain Fantasy", { genres: ["Fantasy"] })];
    const recs = rankRecommendations({ library, candidates, relations: [], coReaders: [] });
    expect(recs[0].novel.id).toBe(30);
    expect(recs[0].reason).toBe("more from Cuttlefish");
  });

  it("uses co-readers and names the shelf title they share", () => {
    const candidates = [cand(40, "Popular Elsewhere"), cand(11, "Plain Fantasy", { genres: ["Fantasy"] })];
    const coReaders = [
      { candidate: 40, mine: 2, readers: 3 },
      { candidate: 40, mine: 1, readers: 1 },
      { candidate: 40, mine: 999, readers: 50 }, // not on this shelf — ignored
    ];
    const recs = rankRecommendations({ library, candidates, relations: [], coReaders });
    expect(recs[0].novel.id).toBe(40);
    expect(recs[0].reason).toBe("also tracked by 3 readers of Reverend Insanity");
  });

  it("breaks ties with popularity, then title, and honours the limit", () => {
    const candidates = [
      cand(50, "Beta", { genres: ["Fantasy"], trackers: 0 }),
      cand(51, "Alpha", { genres: ["Fantasy"], trackers: 0 }),
      cand(52, "Gamma", { genres: ["Fantasy"], trackers: 20 }),
    ];
    const recs = rankRecommendations({ library, candidates, relations: [], coReaders: [] }, 2);
    expect(recs.map((r) => r.novel.title)).toEqual(["Gamma", "Alpha"]);
  });
});
