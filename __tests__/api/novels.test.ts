import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { novel: { findMany: vi.fn(), create: vi.fn() } },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { GET, POST } from "@/app/api/novels/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, modUser, adminUser, novelFixture } from "../helpers";

describe("GET /api/novels", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns novels without auth", async () => {
    vi.mocked(prisma.novel.findMany).mockResolvedValue([novelFixture] as never);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

describe("POST /api/novels", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { title: "Test" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await POST(makeRequest("POST", { title: "Test" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 when title is missing", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    const res = await POST(makeRequest("POST", {}));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/title/i);
  });

  it("returns 400 when title exceeds 500 characters", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    const res = await POST(makeRequest("POST", { title: "a".repeat(501) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when a field contains XSS", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    const res = await POST(makeRequest("POST", { title: "<script>alert(1)</script>" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when cover image URL is invalid", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    const res = await POST(makeRequest("POST", { title: "Valid", coverImageUrl: "not-a-url" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when media type is not in the allowed list", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    const res = await POST(makeRequest("POST", { title: "Valid", mediaType: "comic" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/media type/i);
  });

  it("passes a valid media type through to the create", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.novel.create).mockResolvedValue(novelFixture as never);
    const res = await POST(makeRequest("POST", { title: "Valid Novel", mediaType: "manhwa", genres: [], tags: [] }));
    expect(res.status).toBe(201);
    expect(vi.mocked(prisma.novel.create).mock.calls[0][0].data.mediaType).toBe("manhwa");
  });

  it("stores the latest released chapter, and nulls it when blank", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.novel.create).mockResolvedValue(novelFixture as never);
    await POST(makeRequest("POST", { title: "Ongoing", latestChapter: 353, genres: [], tags: [] }));
    expect(vi.mocked(prisma.novel.create).mock.calls[0][0].data.latestChapter).toBe(353);
    await POST(makeRequest("POST", { title: "Finished", latestChapter: "", genres: [], tags: [] }));
    expect(vi.mocked(prisma.novel.create).mock.calls[1][0].data.latestChapter).toBeNull();
  });

  it("allows admin to create a novel", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.novel.create).mockResolvedValue(novelFixture as never);
    const res = await POST(makeRequest("POST", { title: "Valid Novel", genres: [], tags: [] }));
    expect(res.status).toBe(201);
  });

  it("allows moderator to create a novel", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novel.create).mockResolvedValue(novelFixture as never);
    const res = await POST(makeRequest("POST", { title: "Valid Novel", genres: [], tags: [] }));
    expect(res.status).toBe(201);
  });
});
