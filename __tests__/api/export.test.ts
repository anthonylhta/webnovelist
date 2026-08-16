import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { userNovelList: { findMany: vi.fn() } },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { GET } from "@/app/api/export/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser } from "../helpers";

const entry = {
  status: "reading",
  currentChapter: 341,
  rating: 9.5,
  dateStarted: new Date(Date.UTC(2026, 0, 2)),
  dateFinished: null,
  rereadCount: 0,
  readingUrl: null,
  notes: null,
  novel: { id: 2, title: "Lord of the Mysteries", nativeTitle: "诡秘之主", mediaType: "webnovel", totalChapters: 1430, malId: null, anilistId: 86 },
};

beforeEach(() => vi.clearAllMocks());

describe("GET /api/export", () => {
  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    expect((await GET(makeRequest("GET"))).status).toBe(401);
  });

  it("rejects unknown formats", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    expect((await GET(makeRequest("GET", undefined, "http://localhost/api/export?format=xlsx"))).status).toBe(400);
  });

  it("serves the caller's list as a JSON download", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findMany).mockResolvedValue([entry] as never);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toMatch(/attachment; filename="webnovelist-regularuser-\d{4}-\d{2}-\d{2}\.json"/);
    const body = await res.json();
    expect(body.entries[0]).toMatchObject({ title: "Lord of the Mysteries", date_started: "2026-01-02", anilist_id: 86, novel_id: 2 });
    expect(vi.mocked(prisma.userNovelList.findMany).mock.calls[0][0]?.where).toEqual({ userId: regularUser.id });
  });

  it("serves CSV with a header row", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findMany).mockResolvedValue([entry] as never);
    const res = await GET(makeRequest("GET", undefined, "http://localhost/api/export?format=csv"));
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    const text = await res.text();
    expect(text).toContain("title,native_title,media_type");
    expect(text).toContain("Lord of the Mysteries,诡秘之主,webnovel,reading,341,1430,9.5,2026-01-02");
  });
});
