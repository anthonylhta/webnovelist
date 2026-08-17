import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { $queryRaw: vi.fn() },
}));

import { prisma } from "@/lib/prisma";
import { normalizeQuery, searchNovelIds, findNovelIdByAnyTitle } from "@/lib/search";

describe("normalizeQuery", () => {
  it("trims, collapses whitespace and caps length", () => {
    expect(normalizeQuery("  lord   of  the mysteries ")).toBe("lord of the mysteries");
    expect(normalizeQuery(undefined)).toBe("");
    expect(normalizeQuery("x".repeat(500))).toHaveLength(100);
  });
});

describe("searchNovelIds", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ranked ids and the window total as a number", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      { id: 7, total: BigInt(3) },
      { id: 2, total: BigInt(3) },
    ] as never);
    const result = await searchNovelIds({ query: "reverand", skip: 0, take: 20 });
    expect(result).toEqual({ ids: [7, 2], total: 3 });
  });

  it("returns an empty page with a zero total when nothing matches", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never);
    expect(await searchNovelIds({ query: "zzz", skip: 0, take: 20 })).toEqual({ ids: [], total: 0 });
  });

  it("passes the query, filters and paging into the SQL as parameters", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never);
    await searchNovelIds({ query: "solo", genre: "Action", mediaType: "manhwa", skip: 20, take: 20 });
    // Tagged template: (strings, ...values); filter fragments arrive as nested Sql values.
    const [, ...values] = vi.mocked(prisma.$queryRaw).mock.calls[0] as unknown[];
    const fragments = values.filter(
      (v): v is { sql: string; values: unknown[] } =>
        typeof v === "object" && v !== null && "sql" in v
    );
    expect(values).toEqual(expect.arrayContaining(["%solo%", "solo", 20, 20]));
    expect(fragments.map((f) => f.sql).join(" ")).toContain("ANY(n.genres)");
    expect(fragments.map((f) => f.sql).join(" ")).toContain("n.media_type =");
    const [strings] = vi.mocked(prisma.$queryRaw).mock.calls[0] as unknown as [TemplateStringsArray];
    expect(strings.join("?")).toContain("unnest(n.alt_titles)");
    expect(fragments.flatMap((f) => f.values)).toEqual(expect.arrayContaining(["Action", "manhwa"]));
  });
});

describe("findNovelIdByAnyTitle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the first id, or null when nothing (or a blank title) matches", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ id: 12 }] as never);
    expect(await findNovelIdByAnyTitle(" Lord of the Mysteries ")).toBe(12);
    vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never);
    expect(await findNovelIdByAnyTitle("nope")).toBeNull();
    expect(await findNovelIdByAnyTitle("   ")).toBeNull();
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
  });
});
