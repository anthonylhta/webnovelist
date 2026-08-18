import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: vi.fn() } }));

import { GET } from "@/app/api/health/route";
import { prisma } from "@/lib/prisma";

describe("GET /api/health", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is 200 with db ok when SELECT 1 answers", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }] as never);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.db).toBe("ok");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("is 503 with db error when the query throws", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("connection refused") as never);
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).db).toBe("error");
  });

  it("is 503 with db timeout when the query hangs", async () => {
    vi.useFakeTimers();
    vi.mocked(prisma.$queryRaw).mockReturnValue(new Promise(() => {}) as never);
    const pending = GET();
    await vi.advanceTimersByTimeAsync(1600);
    const res = await pending;
    vi.useRealTimers();
    expect(res.status).toBe(503);
    expect((await res.json()).db).toBe("timeout");
  });
});
