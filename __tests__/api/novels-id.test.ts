import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { novel: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() } },
}));

import { GET, PUT, DELETE } from "@/app/api/novels/[id]/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, modUser, adminUser, novelFixture } from "../helpers";

const params = Promise.resolve({ id: "1" });

describe("GET /api/novels/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a novel without auth", async () => {
    vi.mocked(prisma.novel.findUnique).mockResolvedValue(novelFixture as never);
    const res = await GET(makeRequest("GET"), { params });
    expect(res.status).toBe(200);
  });

  it("returns 404 when the novel does not exist", async () => {
    vi.mocked(prisma.novel.findUnique).mockResolvedValue(null);
    const res = await GET(makeRequest("GET"), { params });
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/novels/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT", { title: "Updated" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await PUT(makeRequest("PUT", { title: "Updated" }), { params });
    expect(res.status).toBe(403);
  });

  it("allows admin to update a novel", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.novel.update).mockResolvedValue(novelFixture as never);
    const res = await PUT(makeRequest("PUT", { title: "Updated" }), { params });
    expect(res.status).toBe(200);
  });

  it("allows moderator to update a novel", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novel.update).mockResolvedValue(novelFixture as never);
    const res = await PUT(makeRequest("PUT", { title: "Updated" }), { params });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/novels/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(403);
  });

  it("returns 403 for moderators — only admin can delete novels", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(403);
  });

  it("allows admin to delete a novel", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.novel.delete).mockResolvedValue(novelFixture as never);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(200);
  });
});
