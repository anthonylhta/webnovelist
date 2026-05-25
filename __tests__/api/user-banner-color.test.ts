import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: vi.fn() } },
}));

import { PUT } from "@/app/api/user/banner-color/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser } from "../helpers";

describe("PUT /api/user/banner-color", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT", { color: "blue" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for an unrecognised color", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await PUT(makeRequest("PUT", { color: "magenta" }));
    expect(res.status).toBe(400);
  });

  it("allows setting a valid color", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ id: "user-1", bannerColor: "blue" } as never);
    const res = await PUT(makeRequest("PUT", { color: "blue" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.color).toBe("blue");
  });

  it("allows resetting to the default color", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ id: "user-1", bannerColor: null } as never);
    const res = await PUT(makeRequest("PUT", { color: "default" }));
    expect(res.status).toBe(200);
  });
});
