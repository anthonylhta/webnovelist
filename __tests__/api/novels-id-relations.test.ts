import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    novel: { findUnique: vi.fn() },
    novelRelation: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn() },
  },
}));

import { GET, POST } from "@/app/api/novels/[id]/relations/route";
import { DELETE } from "@/app/api/novels/[id]/relations/[relationId]/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, modUser, novelFixture } from "../helpers";

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const relParams = (id: string, relationId: string) => ({ params: Promise.resolve({ id, relationId }) });

beforeEach(() => vi.clearAllMocks());

describe("GET /api/novels/[id]/relations", () => {
  it("is public and returns the merged list", async () => {
    vi.mocked(prisma.novelRelation.findMany).mockResolvedValue([] as never);
    const res = await GET(makeRequest("GET"), params("1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("rejects a non-numeric id", async () => {
    const res = await GET(makeRequest("GET"), params("abc"));
    expect(res.status).toBe(400);
  });
});

describe("POST /api/novels/[id]/relations", () => {
  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { toId: 2, kind: "sequel" }), params("1"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await POST(makeRequest("POST", { toId: 2, kind: "sequel" }), params("1"));
    expect(res.status).toBe(403);
  });

  it("validates the target, self-links and the kind", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    expect((await POST(makeRequest("POST", { kind: "sequel" }), params("1"))).status).toBe(400);
    expect((await POST(makeRequest("POST", { toId: 1, kind: "sequel" }), params("1"))).status).toBe(400);
    expect((await POST(makeRequest("POST", { toId: 2, kind: "remake" }), params("1"))).status).toBe(400);
  });

  it("returns 404 when either title is missing", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novel.findUnique).mockResolvedValueOnce(novelFixture as never).mockResolvedValueOnce(null);
    const res = await POST(makeRequest("POST", { toId: 2, kind: "sequel" }), params("1"));
    expect(res.status).toBe(404);
  });

  it("returns 409 when the same fact exists from the other side", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novel.findUnique).mockResolvedValue(novelFixture as never);
    vi.mocked(prisma.novelRelation.findFirst).mockResolvedValue({ id: 5 } as never);
    const res = await POST(makeRequest("POST", { toId: 2, kind: "sequel" }), params("1"));
    expect(res.status).toBe(409);
    const where = vi.mocked(prisma.novelRelation.findFirst).mock.calls[0][0]?.where as { OR: unknown[] };
    expect(where.OR).toContainEqual({ fromId: 2, toId: 1, kind: "prequel" });
  });

  it("creates the link for a moderator", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novel.findUnique).mockResolvedValue(novelFixture as never);
    vi.mocked(prisma.novelRelation.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.novelRelation.create).mockResolvedValue({ id: 9, fromId: 1, toId: 2, kind: "adaptation" } as never);
    const res = await POST(makeRequest("POST", { toId: "2", kind: "adaptation" }), params("1"));
    expect(res.status).toBe(201);
    expect(vi.mocked(prisma.novelRelation.create).mock.calls[0][0].data).toEqual({ fromId: 1, toId: 2, kind: "adaptation" });
  });
});

describe("DELETE /api/novels/[id]/relations/[relationId]", () => {
  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await DELETE(makeRequest("DELETE"), relParams("1", "9"));
    expect(res.status).toBe(403);
  });

  it("returns 404 when the row does not touch this novel", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novelRelation.findUnique).mockResolvedValue({ id: 9, fromId: 5, toId: 6 } as never);
    const res = await DELETE(makeRequest("DELETE"), relParams("1", "9"));
    expect(res.status).toBe(404);
    expect(prisma.novelRelation.delete).not.toHaveBeenCalled();
  });

  it("deletes a row from either side", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novelRelation.findUnique).mockResolvedValue({ id: 9, fromId: 5, toId: 1 } as never);
    const res = await DELETE(makeRequest("DELETE"), relParams("1", "9"));
    expect(res.status).toBe(200);
    expect(prisma.novelRelation.delete).toHaveBeenCalledWith({ where: { id: 9 } });
  });
});
