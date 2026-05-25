import { describe, it, expect } from "vitest";
import {
  canManageNovels,
  canManageUsers,
  canDeleteUser,
  getRoleLabel,
  getRoleColor,
} from "@/lib/roles";

describe("canManageNovels", () => {
  it("allows admin", () => expect(canManageNovels("admin")).toBe(true));
  it("allows moderator", () => expect(canManageNovels("moderator")).toBe(true));
  it("denies user", () => expect(canManageNovels("user")).toBe(false));
  it("denies undefined", () => expect(canManageNovels(undefined)).toBe(false));
});

describe("canManageUsers", () => {
  it("allows admin", () => expect(canManageUsers("admin")).toBe(true));
  it("denies moderator", () => expect(canManageUsers("moderator")).toBe(false));
  it("denies user", () => expect(canManageUsers("user")).toBe(false));
  it("denies undefined", () => expect(canManageUsers(undefined)).toBe(false));
});

describe("canDeleteUser", () => {
  it("admin can delete any role", () => {
    expect(canDeleteUser("admin", "admin")).toBe(true);
    expect(canDeleteUser("admin", "moderator")).toBe(true);
    expect(canDeleteUser("admin", "user")).toBe(true);
  });

  it("moderator can delete non-admins", () => {
    expect(canDeleteUser("moderator", "user")).toBe(true);
    expect(canDeleteUser("moderator", "moderator")).toBe(true);
  });

  it("moderator cannot delete admin", () => {
    expect(canDeleteUser("moderator", "admin")).toBe(false);
  });

  it("user cannot delete anyone", () => {
    expect(canDeleteUser("user", "user")).toBe(false);
    expect(canDeleteUser("user", "moderator")).toBe(false);
  });

  it("undefined actor cannot delete anyone", () => {
    expect(canDeleteUser(undefined, "user")).toBe(false);
  });
});

describe("getRoleLabel", () => {
  it("returns labelled roles", () => {
    expect(getRoleLabel("admin")).toBe("👑 Admin");
    expect(getRoleLabel("moderator")).toBe("🛡️ Moderator");
    expect(getRoleLabel("user")).toBe("👤 User");
  });

  it("returns unknown roles as-is", () => {
    expect(getRoleLabel("superuser")).toBe("superuser");
  });
});

describe("getRoleColor", () => {
  it("returns red variant for admin", () => {
    expect(getRoleColor("admin")).toContain("red");
  });

  it("returns blue variant for moderator", () => {
    expect(getRoleColor("moderator")).toContain("blue");
  });

  it("returns gray variant for user", () => {
    expect(getRoleColor("user")).toContain("gray");
  });

  it("returns gray for unknown roles", () => {
    expect(getRoleColor("unknown")).toContain("gray");
  });
});
