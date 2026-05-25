import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userNovelList: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));
vi.mock("@/lib/activity", () => ({ logActivity: vi.fn() }));

import { PUT, DELETE } from "@/app/api/list/[id]/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, novelFixture } from "../helpers";

const params = Promise.resolve({ id: "10" });

const ownedEntry = {
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

const otherUserEntry = { ...ownedEntry, userId: "other-user" };

describe("PUT /api/list/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT", { status: "completed" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the entry does not exist", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT", { status: "completed" }), { params });
    expect(res.status).toBe(404);
  });

  it("returns 404 when the entry belongs to a different user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(otherUserEntry as never);
    const res = await PUT(makeRequest("PUT", { status: "completed" }), { params });
    expect(res.status).toBe(404);
  });

  it("allows owner to update their entry", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(ownedEntry as never);
    vi.mocked(prisma.userNovelList.update).mockResolvedValue({ ...ownedEntry, status: "completed" } as never);
    const res = await PUT(makeRequest("PUT", { status: "completed" }), { params });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/list/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the entry belongs to a different user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(otherUserEntry as never);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(404);
  });

  it("allows owner to delete their entry", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(ownedEntry as never);
    vi.mocked(prisma.userNovelList.delete).mockResolvedValue(ownedEntry as never);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(200);
  });
});
