import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activity: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";

describe("logActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an activity record when no recent duplicate exists", async () => {
    vi.mocked(prisma.activity.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.activity.create).mockResolvedValue({} as never);

    await logActivity("user-1", "add", 42, "Started reading");

    expect(prisma.activity.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        type: "add",
        novelId: 42,
        detail: "Started reading",
      },
    });
  });

  it("skips creation when a recent duplicate exists", async () => {
    vi.mocked(prisma.activity.findFirst).mockResolvedValue({ id: 1 } as never);

    await logActivity("user-1", "add", 42, "Started reading");

    expect(prisma.activity.create).not.toHaveBeenCalled();
  });

  it("stores null detail when none is provided", async () => {
    vi.mocked(prisma.activity.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.activity.create).mockResolvedValue({} as never);

    await logActivity("user-1", "remove", 5);

    expect(prisma.activity.create).toHaveBeenCalledWith({
      data: { userId: "user-1", type: "remove", novelId: 5, detail: null },
    });
  });

  it("handles null novelId", async () => {
    vi.mocked(prisma.activity.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.activity.create).mockResolvedValue({} as never);

    await logActivity("user-1", "rating", null, "Rated 9.0");

    expect(prisma.activity.create).toHaveBeenCalledWith({
      data: { userId: "user-1", type: "rating", novelId: null, detail: "Rated 9.0" },
    });
  });

  it("swallows database errors silently", async () => {
    vi.mocked(prisma.activity.findFirst).mockRejectedValue(new Error("DB down"));
    await expect(logActivity("user-1", "rating", 1)).resolves.toBeUndefined();
  });
});
