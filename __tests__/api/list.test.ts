import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userNovelList: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    novel: { findUnique: vi.fn() },
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));
vi.mock("@/lib/activity", () => ({ logActivity: vi.fn() }));

import { GET, POST } from "@/app/api/list/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, novelFixture } from "../helpers";

const listEntry = {
  id: 10,
  userId: "user-1",
  novelId: 1,
  status: "reading",
  rating: null,
  currentChapter: 5,
  isFavorite: false,
  dateStarted: null,
  dateFinished: null,
  notes: null,
  readingUrl: null,
  rereadCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  novel: novelFixture,
};

describe("GET /api/list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns the authenticated user's list", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findMany).mockResolvedValue([listEntry] as never);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });
});

describe("POST /api/list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { novelId: 1 }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for a non-numeric novelId", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await POST(makeRequest("POST", { novelId: "abc", status: "reading" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid status", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await POST(makeRequest("POST", { novelId: 1, status: "watching" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when rating is out of range", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await POST(makeRequest("POST", { novelId: 1, status: "reading", rating: 11 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when the novel is already in the user's list", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(listEntry as never);
    const res = await POST(makeRequest("POST", { novelId: 1, status: "reading" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/already/i);
  });

  it("returns 404 when the novel does not exist", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.novel.findUnique).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { novelId: 999, status: "reading" }));
    expect(res.status).toBe(404);
  });

  it("returns 201 when the entry is added successfully", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.novel.findUnique).mockResolvedValue(novelFixture as never);
    vi.mocked(prisma.userNovelList.create).mockResolvedValue(listEntry as never);
    const res = await POST(makeRequest("POST", { novelId: 1, status: "reading" }));
    expect(res.status).toBe(201);
  });
});
