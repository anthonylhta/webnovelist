import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn(), update: vi.fn() } },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { GET, PUT } from "@/app/api/user/settings/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, adminUser } from "../helpers";

const dbUser = {
  id: "user-1",
  username: "oldname",
  email: "user@test.com",
  role: "user",
  usernameChangedAt: null,
  createdAt: new Date("2026-01-01"),
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

describe("GET /api/user/settings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns settings with cooldown metadata when authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(dbUser as never);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("daysUntilChange");
    expect(data).toHaveProperty("cooldownDays", 30);
  });
});

describe("PUT /api/user/settings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT", { username: "newname" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when username is missing", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await PUT(makeRequest("PUT", {}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when username is too short (< 3 chars)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await PUT(makeRequest("PUT", { username: "ab" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when username contains invalid characters", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await PUT(makeRequest("PUT", { username: "bad name!" }));
    expect(res.status).toBe(400);
  });

  it("returns 429 when user is within the 30-day cooldown", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...dbUser,
      usernameChangedAt: daysAgo(10),
    } as never);
    const res = await PUT(makeRequest("PUT", { username: "newname" }));
    expect(res.status).toBe(429);
  });

  it("admin bypasses the username cooldown", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ ...dbUser, role: "admin", usernameChangedAt: daysAgo(10) } as never)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...dbUser, username: "newname" } as never);
    const res = await PUT(makeRequest("PUT", { username: "newname" }));
    expect(res.status).toBe(200);
  });

  it("returns 400 when the username is already taken by another user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ ...dbUser, usernameChangedAt: null } as never)
      .mockResolvedValueOnce({ id: "other-user", username: "newname" } as never);
    const res = await PUT(makeRequest("PUT", { username: "newname" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/taken/i);
  });

  it("updates the username successfully", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ ...dbUser, usernameChangedAt: null } as never)
      .mockResolvedValueOnce(null);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...dbUser, username: "newname" } as never);
    const res = await PUT(makeRequest("PUT", { username: "newname" }));
    expect(res.status).toBe(200);
  });
});
