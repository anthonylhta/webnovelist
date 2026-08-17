import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
    novel: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    userNovelList: { findUnique: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { POST } from "@/app/api/import/mal/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, modUser, novelFixture } from "../helpers";

const XML = `<myanimelist>
<manga><manga_mangadb_id>121496</manga_mangadb_id><manga_title><![CDATA[Solo Leveling]]></manga_title>
<manga_chapters>200</manga_chapters><my_read_chapters>179</my_read_chapters><my_score>9</my_score>
<my_status>Reading</my_status><my_start_date>2021-03-05</my_start_date><my_finish_date>0000-00-00</my_finish_date>
<my_times_read>0</my_times_read><my_comments><![CDATA[]]></my_comments></manga>
<manga><manga_mangadb_id>555</manga_mangadb_id><manga_title><![CDATA[Nowhere To Be Found]]></manga_title>
<manga_chapters>12</manga_chapters><my_read_chapters>3</my_read_chapters><my_score>0</my_score><my_status>On-Hold</my_status></manga>
</myanimelist>`;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.$queryRaw).mockResolvedValue([] as never);
});

describe("POST /api/import/mal", () => {
  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    expect((await POST(makeRequest("POST", { xml: XML }))).status).toBe(401);
  });

  it("rejects an empty or non-MAL payload", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    expect((await POST(makeRequest("POST", {}))).status).toBe(400);
    expect((await POST(makeRequest("POST", { xml: "<html/>" }))).status).toBe(400);
  });

  it("links matched titles to the caller's list and reports the rest as unmatched", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.novel.findFirst)
      .mockResolvedValueOnce({ id: 1, malId: 121496 } as never)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userNovelList.create).mockResolvedValue({} as never);

    const res = await POST(makeRequest("POST", { xml: XML }));
    expect(res.status).toBe(200);
    const summary = await res.json();
    expect(summary).toMatchObject({ total: 2, entriesAdded: 1, entriesSkipped: 0 });
    expect(summary.unmatched).toEqual([{ malId: 555, title: "Nowhere To Be Found", chapters: 12 }]);

    expect(vi.mocked(prisma.novel.findFirst).mock.calls[0][0]?.where).toEqual({ malId: 121496 });
    expect(vi.mocked(prisma.userNovelList.create).mock.calls[0][0].data).toMatchObject({
      userId: regularUser.id,
      novelId: 1,
      status: "reading",
      rating: 9,
      currentChapter: 179,
      dateStarted: new Date(2021, 2, 5),
      dateFinished: null,
    });
    // Regular readers never touch the catalog.
    expect(prisma.novel.update).not.toHaveBeenCalled();
  });

  it("falls back to a title / alternative-title lookup when the MAL id is unknown", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.novel.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ id: 7 }] as never).mockResolvedValueOnce([] as never);
    vi.mocked(prisma.novel.findUnique).mockResolvedValue({ id: 7, malId: null } as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userNovelList.create).mockResolvedValue({} as never);
    const summary = await (await POST(makeRequest("POST", { xml: XML }))).json();
    expect(summary).toMatchObject({ entriesAdded: 1 });
    expect(summary.unmatched.map((u: { malId: number }) => u.malId)).toEqual([555]);
    expect(vi.mocked(prisma.userNovelList.create).mock.calls[0][0].data).toMatchObject({ novelId: 7 });
  });

  it("skips entries already on the list", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.novel.findFirst).mockResolvedValue({ id: 1, malId: 121496 } as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue({ id: 9 } as never);
    const summary = await (await POST(makeRequest("POST", { xml: XML }))).json();
    expect(summary).toMatchObject({ entriesAdded: 0, entriesSkipped: 2 });
    expect(prisma.userNovelList.create).not.toHaveBeenCalled();
  });

  it("back-fills the MAL id on title matches for moderators only", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novel.findFirst).mockResolvedValue({ ...novelFixture, id: 1, malId: null } as never);
    vi.mocked(prisma.novel.update).mockResolvedValue({} as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue({ id: 9 } as never);
    await POST(makeRequest("POST", { xml: XML }));
    expect(prisma.novel.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { malId: 121496 } });
  });
});
