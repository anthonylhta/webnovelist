import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    follow: { findUnique: vi.fn(), count: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { GET, POST, DELETE } from "@/app/api/user/[username]/follow/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, modUser } from "../helpers";

const params = Promise.resolve({ username: "moduser" });

describe("/api/user/[username]/follow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.follow.count).mockResolvedValue(3);
  });

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await POST(makeRequest("POST"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 for an unknown reader", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = await POST(makeRequest("POST"), { params });
    expect(res.status).toBe(404);
  });

  it("refuses to follow yourself", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: regularUser.id } as never);
    const res = await POST(makeRequest("POST"), { params });
    expect(res.status).toBe(400);
    expect(prisma.follow.upsert).not.toHaveBeenCalled();
  });

  it("follows idempotently and returns the new state", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: modUser.id } as never);
    vi.mocked(prisma.follow.findUnique).mockResolvedValue({ id: 1 } as never);
    const res = await POST(makeRequest("POST"), { params });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ following: true, followers: 3 });
    expect(prisma.follow.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { followerId_followingId: { followerId: regularUser.id, followingId: modUser.id } },
        create: { followerId: regularUser.id, followingId: modUser.id },
      })
    );
  });

  it("unfollows and returns the new state", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: modUser.id } as never);
    vi.mocked(prisma.follow.findUnique).mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ following: false, followers: 3 });
    expect(prisma.follow.deleteMany).toHaveBeenCalledWith({
      where: { followerId: regularUser.id, followingId: modUser.id },
    });
  });

  it("reads the follow state without writing", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: modUser.id } as never);
    vi.mocked(prisma.follow.findUnique).mockResolvedValue(null);
    const res = await GET(makeRequest("GET"), { params });
    expect(await res.json()).toEqual({ following: false, followers: 3 });
    expect(prisma.follow.upsert).not.toHaveBeenCalled();
    expect(prisma.follow.deleteMany).not.toHaveBeenCalled();
  });
});
