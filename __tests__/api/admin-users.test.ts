import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findMany: vi.fn() } },
}));

import { GET } from "@/app/api/admin/users/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { regularUser, modUser, adminUser } from "../helpers";

describe("GET /api/admin/users", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("allows admin to list users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("allows moderator to list users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);
    const res = await GET();
    expect(res.status).toBe(200);
  });
});
