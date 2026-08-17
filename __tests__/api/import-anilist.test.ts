import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
    novel: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    userNovelList: { findUnique: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));
vi.mock("@/lib/anilist", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/anilist")>()),
  fetchAniListEntries: vi.fn(),
}));

import { POST } from "@/app/api/import/anilist/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { fetchAniListEntries, AniListUserNotFoundError } from "@/lib/anilist";
import { makeRequest, regularUser, adminUser, novelFixture } from "../helpers";

const aniListEntry = {
  status: "CURRENT" as const,
  progress: 42,
  score: 8.5,
  repeat: 1,
  startedAt: { year: 2025, month: 2, day: 10 },
  completedAt: { year: null, month: null, day: null },
  media: {
    id: 119257,
    idMal: 121496,
    format: "MANGA",
    countryOfOrigin: "KR",
    chapters: null,
    status: "RELEASING",
    genres: ["Action", "Fantasy"],
    description: "An <i>epic</i> tale.<br>Second line.",
    coverImage: { large: "https://s4.anilist.co/file/x.jpg" },
    title: { english: "Omniscient Reader", romaji: "Jeonjijeok Dokja Sijeom", native: "전지적 독자 시점" },
    staff: { edges: [{ role: "Original Story", node: { name: { full: "Singsyong" } } }] },
  },
};

describe("POST /api/import/anilist", () => {
  beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never);
});

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { username: "mmando" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await POST(makeRequest("POST", { username: "mmando" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 for an invalid username", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    for (const bad of ["", "a", "has space", "semi;colon", 42]) {
      const res = await POST(makeRequest("POST", { username: bad }));
      expect(res.status).toBe(400);
    }
    expect(fetchAniListEntries).not.toHaveBeenCalled();
  });

  it("returns 404 when the AniList user does not exist", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(fetchAniListEntries).mockRejectedValue(new AniListUserNotFoundError("ghost"));
    const res = await POST(makeRequest("POST", { username: "ghost" }));
    expect(res.status).toBe(404);
  });

  it("returns 502 when AniList is unreachable", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(fetchAniListEntries).mockRejectedValue(new Error("boom"));
    const res = await POST(makeRequest("POST", { username: "mmando" }));
    expect(res.status).toBe(502);
  });

  it("creates the novel and list entry with mapped fields", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(fetchAniListEntries).mockResolvedValue([aniListEntry]);
    vi.mocked(prisma.novel.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.novel.create).mockResolvedValue({ ...novelFixture, id: 7 } as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userNovelList.create).mockResolvedValue({} as never);

    const res = await POST(makeRequest("POST", { username: "mmando" }));
    expect(res.status).toBe(200);

    const novelData = vi.mocked(prisma.novel.create).mock.calls[0][0].data;
    expect(novelData.mediaType).toBe("manhwa");
    expect(novelData.anilistId).toBe(119257);
    expect(novelData.author).toBe("Singsyong");
    expect(novelData.status).toBe("Ongoing");
    expect(novelData.description).not.toContain("<i>");
    expect(novelData.altTitles).toEqual(["Jeonjijeok Dokja Sijeom"]);

    const entryData = vi.mocked(prisma.userNovelList.create).mock.calls[0][0].data;
    expect(entryData.status).toBe("reading");
    expect(entryData.currentChapter).toBe(42);
    expect(entryData.rating).toBe(8.5);
    expect(entryData.rereadCount).toBe(1);
    expect(entryData.dateStarted).toEqual(new Date(Date.UTC(2025, 1, 10)));
    expect(entryData.dateFinished).toBeNull();

    const summary = await res.json();
    expect(summary).toMatchObject({ total: 1, novelsCreated: 1, entriesAdded: 1, entriesSkipped: 0 });
  });

  it("links an existing catalog novel instead of duplicating it", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(fetchAniListEntries).mockResolvedValue([aniListEntry]);
    vi.mocked(prisma.novel.findFirst).mockResolvedValue({ ...novelFixture, anilistId: null, altTitles: ["ORV"] } as never);
    vi.mocked(prisma.novel.update).mockResolvedValue({ ...novelFixture, anilistId: 119257 } as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userNovelList.create).mockResolvedValue({} as never);

    const res = await POST(makeRequest("POST", { username: "mmando" }));
    const summary = await res.json();

    expect(prisma.novel.create).not.toHaveBeenCalled();
    const data = vi.mocked(prisma.novel.update).mock.calls[0][0].data;
    expect(data.anilistId).toBe(119257);
    expect(data.altTitles).toEqual(["ORV", "Jeonjijeok Dokja Sijeom"]);
    expect(summary.novelsCreated).toBe(0);
    expect(summary.entriesAdded).toBe(1);
  });

  it("links by title or alternative title when neither id is known", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(fetchAniListEntries).mockResolvedValue([aniListEntry]);
    vi.mocked(prisma.novel.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ id: 3 }] as never);
    vi.mocked(prisma.novel.findUnique).mockResolvedValue({ ...novelFixture, id: 3, anilistId: 119257, malId: 121496, altTitles: ["Jeonjijeok Dokja Sijeom"] } as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userNovelList.create).mockResolvedValue({} as never);

    const summary = await (await POST(makeRequest("POST", { username: "mmando" }))).json();
    expect(prisma.novel.create).not.toHaveBeenCalled();
    expect(prisma.novel.update).not.toHaveBeenCalled();
    expect(summary).toMatchObject({ novelsCreated: 0, entriesAdded: 1 });
    expect(vi.mocked(prisma.userNovelList.create).mock.calls[0][0].data).toMatchObject({ novelId: 3 });
  });

  it("skips entries already on the reading list", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(fetchAniListEntries).mockResolvedValue([aniListEntry]);
    vi.mocked(prisma.novel.findFirst).mockResolvedValue({ ...novelFixture, anilistId: 119257 } as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue({ id: 1 } as never);

    const res = await POST(makeRequest("POST", { username: "mmando" }));
    const summary = await res.json();

    expect(prisma.userNovelList.create).not.toHaveBeenCalled();
    expect(summary.entriesSkipped).toBe(1);
    expect(summary.entriesAdded).toBe(0);
  });
});
