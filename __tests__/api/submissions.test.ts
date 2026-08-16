import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    novel: { findUnique: vi.fn() },
    novelSubmission: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue(null),
  getIP: vi.fn().mockReturnValue("127.0.0.1"),
}));

import { GET, POST } from "@/app/api/submissions/route";
import { GET as GET_ONE, PATCH, DELETE } from "@/app/api/submissions/[id]/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, modUser, novelFixture } from "../helpers";

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const pending = { id: 3, userId: regularUser.id, title: "Cradle", status: "pending" };

beforeEach(() => vi.clearAllMocks());

describe("GET /api/submissions", () => {
  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    expect((await GET(makeRequest("GET"))).status).toBe(401);
  });

  it("returns only the caller's own submissions by default", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.novelSubmission.findMany).mockResolvedValue([] as never);
    await GET(makeRequest("GET"));
    expect(vi.mocked(prisma.novelSubmission.findMany).mock.calls[0][0]?.where).toEqual({ userId: regularUser.id });
  });

  it("refuses the queue to regular users and serves it to mods", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    expect((await GET(makeRequest("GET", undefined, "http://localhost/api/submissions?scope=queue"))).status).toBe(403);
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novelSubmission.findMany).mockResolvedValue([] as never);
    const res = await GET(makeRequest("GET", undefined, "http://localhost/api/submissions?scope=queue"));
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.novelSubmission.findMany).mock.calls[0][0]?.where).toEqual({ status: "pending" });
  });
});

describe("POST /api/submissions", () => {
  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    expect((await POST(makeRequest("POST", { title: "X" }))).status).toBe(401);
  });

  it("returns 400 on an invalid body", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    expect((await POST(makeRequest("POST", { title: "" }))).status).toBe(400);
  });

  it("caps open submissions per reader", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.novelSubmission.count).mockResolvedValue(10);
    expect((await POST(makeRequest("POST", { title: "Cradle" }))).status).toBe(429);
    expect(prisma.novelSubmission.create).not.toHaveBeenCalled();
  });

  it("creates a pending submission for the caller", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.novelSubmission.count).mockResolvedValue(0);
    vi.mocked(prisma.novelSubmission.create).mockResolvedValue(pending as never);
    const res = await POST(makeRequest("POST", { title: "Cradle", mediaType: "novel", author: "Will Wight" }));
    expect(res.status).toBe(201);
    expect(vi.mocked(prisma.novelSubmission.create).mock.calls[0][0].data).toMatchObject({
      userId: regularUser.id,
      title: "Cradle",
      mediaType: "novel",
      author: "Will Wight",
    });
  });
});

describe("GET /api/submissions/[id]", () => {
  it("lets the owner and mods read it, nobody else", async () => {
    vi.mocked(prisma.novelSubmission.findUnique).mockResolvedValue(pending as never);
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    expect((await GET_ONE(makeRequest("GET"), params("3"))).status).toBe(200);
    vi.mocked(getCurrentUser).mockResolvedValue({ ...regularUser, id: "someone-else" } as never);
    expect((await GET_ONE(makeRequest("GET"), params("3"))).status).toBe(403);
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    expect((await GET_ONE(makeRequest("GET"), params("3"))).status).toBe(200);
  });
});

describe("PATCH /api/submissions/[id]", () => {
  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    expect((await PATCH(makeRequest("PATCH", { action: "reject" }), params("3"))).status).toBe(403);
  });

  it("validates the action and requires a real novel for approve/merge", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    expect((await PATCH(makeRequest("PATCH", { action: "ignore" }), params("3"))).status).toBe(400);
    expect((await PATCH(makeRequest("PATCH", { action: "approve" }), params("3"))).status).toBe(400);
    vi.mocked(prisma.novel.findUnique).mockResolvedValue(null);
    expect((await PATCH(makeRequest("PATCH", { action: "merge", novelId: 99 }), params("3"))).status).toBe(404);
  });

  it("refuses to re-review a resolved submission", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novelSubmission.findUnique).mockResolvedValue({ ...pending, status: "rejected" } as never);
    expect((await PATCH(makeRequest("PATCH", { action: "reject" }), params("3"))).status).toBe(409);
  });

  it("merges into an existing title, recording the reviewer", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novel.findUnique).mockResolvedValue(novelFixture as never);
    vi.mocked(prisma.novelSubmission.findUnique).mockResolvedValue(pending as never);
    vi.mocked(prisma.novelSubmission.update).mockResolvedValue({ ...pending, status: "merged" } as never);
    const res = await PATCH(makeRequest("PATCH", { action: "merge", novelId: 1, note: "same as #1" }), params("3"));
    expect(res.status).toBe(200);
    const data = vi.mocked(prisma.novelSubmission.update).mock.calls[0][0].data;
    expect(data).toMatchObject({ status: "merged", novelId: 1, reviewNote: "same as #1", reviewedById: modUser.id });
  });

  it("rejects with a note and no novel", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.novelSubmission.findUnique).mockResolvedValue(pending as never);
    vi.mocked(prisma.novelSubmission.update).mockResolvedValue({ ...pending, status: "rejected" } as never);
    await PATCH(makeRequest("PATCH", { action: "reject", note: "fan translation only" }), params("3"));
    const data = vi.mocked(prisma.novelSubmission.update).mock.calls[0][0].data;
    expect(data).toMatchObject({ status: "rejected", novelId: null, reviewNote: "fan translation only" });
  });
});

describe("DELETE /api/submissions/[id]", () => {
  it("lets the owner withdraw a pending submission only", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    vi.mocked(prisma.novelSubmission.findUnique).mockResolvedValue(pending as never);
    expect((await DELETE(makeRequest("DELETE"), params("3"))).status).toBe(200);
    expect(prisma.novelSubmission.delete).toHaveBeenCalledWith({ where: { id: 3 } });

    vi.mocked(prisma.novelSubmission.findUnique).mockResolvedValue({ ...pending, status: "approved" } as never);
    expect((await DELETE(makeRequest("DELETE"), params("3"))).status).toBe(409);

    vi.mocked(getCurrentUser).mockResolvedValue({ ...regularUser, id: "someone-else" } as never);
    vi.mocked(prisma.novelSubmission.findUnique).mockResolvedValue(pending as never);
    expect((await DELETE(makeRequest("DELETE"), params("3"))).status).toBe(404);
  });
});
