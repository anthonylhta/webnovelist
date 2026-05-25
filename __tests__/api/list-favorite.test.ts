import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userNovelList: { findUnique: vi.fn(), count: vi.fn(), update: vi.fn() },
  },
}));

import { PUT } from "@/app/api/list/[id]/favorite/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, novelFixture } from "../helpers";

const params = Promise.resolve({ id: "10" });

const ownedEntry = { id: 10, userId: "user-1", novelId: 1, isFavorite: false };
const ownedFavorited = { ...ownedEntry, isFavorite: true };
const otherUserEntry = { ...ownedEntry, userId: "other-user" };

describe("PUT /api/list/[id]/favorite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when entry belongs to a different user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(otherUserEntry as never);
    const res = await PUT(makeRequest("PUT"), { params });
    expect(res.status).toBe(404);
  });

  it("returns 400 when toggling on but 5 favorites already exist", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(ownedEntry as never);
    vi.mocked(prisma.userNovelList.count).mockResolvedValue(5);
    const res = await PUT(makeRequest("PUT"), { params });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/5/i);
  });

  it("allows toggling on when below the 5-favorite limit", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(ownedEntry as never);
    vi.mocked(prisma.userNovelList.count).mockResolvedValue(2);
    vi.mocked(prisma.userNovelList.update).mockResolvedValue({ ...ownedFavorited, novel: novelFixture } as never);
    const res = await PUT(makeRequest("PUT"), { params });
    expect(res.status).toBe(200);
  });

  it("allows toggling off without checking the count", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.userNovelList.findUnique).mockResolvedValue(ownedFavorited as never);
    vi.mocked(prisma.userNovelList.update).mockResolvedValue({ ...ownedEntry, novel: novelFixture } as never);
    const res = await PUT(makeRequest("PUT"), { params });
    expect(res.status).toBe(200);
    expect(prisma.userNovelList.count).not.toHaveBeenCalled();
  });
});
