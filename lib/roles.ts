// lib/roles.ts

export type UserRole = "admin" | "moderator" | "user";

export const ROLES = {
  ADMIN: "admin" as UserRole,
  MODERATOR: "moderator" as UserRole,
  USER: "user" as UserRole,
};

// Check if a role has permission to manage novels (add/edit/delete)
export function canManageNovels(role: string | undefined): boolean {
  return role === ROLES.ADMIN || role === ROLES.MODERATOR;
}

// Check if a role has permission to manage users (change roles, etc.)
export function canManageUsers(role: string | undefined): boolean {
  return role === ROLES.ADMIN;
}

// Get a display-friendly role name
export function getRoleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "👑 Admin";
    case "moderator":
      return "🛡️ Moderator";
    case "user":
      return "👤 User";
    default:
      return role;
  }
}

// Get role badge color classes
export function getRoleColor(role: string): string {
  switch (role) {
    case "admin":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    case "moderator":
      return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    case "user":
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
}