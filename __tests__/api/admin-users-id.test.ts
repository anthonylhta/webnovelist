import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/current-user", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: vi.fn(), findUnique: vi.fn(), delete: vi.fn() } },
}));
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn().mockResolvedValue({
    users: { deleteUser: vi.fn().mockResolvedValue(undefined) },
  }),
}));

import { PUT, DELETE } from "@/app/api/admin/users/[id]/route";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { makeRequest, regularUser, modUser, adminUser } from "../helpers";

const targetUser = { id: "user-1", clerkId: "clerk-target", username: "target", role: "user" };
const targetAdmin = { id: "admin-2", clerkId: "clerk-admin-2", username: "otheradmin", role: "admin" };
const params = Promise.resolve({ id: "user-1" });

describe("PUT /api/admin/users/[id] — role change", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const res = await PUT(makeRequest("PUT", { role: "moderator" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 403 for moderators — only admin can change roles", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    const res = await PUT(makeRequest("PUT", { role: "user" }), { params });
    expect(res.status).toBe(403);
  });

  it("returns 403 for regular users", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(regularUser as never);
    const res = await PUT(makeRequest("PUT", { role: "admin" }), { params });
    expect(res.status).toBe(403);
  });

  it("returns 400 when admin tries to change their own role", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    const selfParams = Promise.resolve({ id: adminUser.id });
    const res = await PUT(makeRequest("PUT", { role: "user" }), { params: selfParams });
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid role value", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    const res = await PUT(makeRequest("PUT", { role: "superuser" }), { params });
    expect(res.status).toBe(400);
  });

  it("allows admin to change a user's role", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...targetUser, role: "moderator" } as never);
    const res = await PUT(makeRequest("PUT", { role: "moderator" }), { params });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/admin/users/[id]", () => {
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

  it("returns 400 when deleting self", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    const selfParams = Promise.resolve({ id: adminUser.id });
    const res = await DELETE(makeRequest("DELETE"), { params: selfParams });
    expect(res.status).toBe(400);
  });

  it("returns 404 when target user does not exist", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(404);
  });

  it("returns 403 when moderator tries to delete an admin", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    const adminParams = Promise.resolve({ id: "admin-2" });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(targetAdmin as never);
    const res = await DELETE(makeRequest("DELETE"), { params: adminParams });
    expect(res.status).toBe(403);
  });

  it("allows admin to delete any user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(targetUser as never);
    vi.mocked(prisma.user.delete).mockResolvedValue(targetUser as never);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(200);
  });

  it("allows moderator to delete a regular user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(modUser as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(targetUser as never);
    vi.mocked(prisma.user.delete).mockResolvedValue(targetUser as never);
    const res = await DELETE(makeRequest("DELETE"), { params });
    expect(res.status).toBe(200);
  });
});
