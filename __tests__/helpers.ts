import { NextRequest } from "next/server";

export function makeRequest(method: string, body?: unknown, url = "http://localhost/") {
  return new NextRequest(url, {
    method,
    ...(body != null && {
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
  });
}

export const regularUser = {
  id: "user-1",
  clerkId: "clerk-user-1",
  username: "regularuser",
  email: "user@test.com",
  role: "user",
  avatarUrl: null,
  bannerColor: null,
  usernameChangedAt: null,
  createdAt: new Date("2026-01-01"),
};

export const modUser = {
  id: "mod-1",
  clerkId: "clerk-mod-1",
  username: "moduser",
  email: "mod@test.com",
  role: "moderator",
  avatarUrl: null,
  bannerColor: null,
  usernameChangedAt: null,
  createdAt: new Date("2026-01-01"),
};

export const adminUser = {
  id: "admin-1",
  clerkId: "clerk-admin-1",
  username: "adminuser",
  email: "admin@test.com",
  role: "admin",
  avatarUrl: null,
  bannerColor: null,
  usernameChangedAt: null,
  createdAt: new Date("2026-01-01"),
};

export const novelFixture = {
  id: 1,
  title: "Test Novel",
  altTitles: [] as string[],
  nativeTitle: null,
  mediaType: "webnovel",
  author: "Test Author",
  description: "A great story",
  coverImageUrl: null,
  totalChapters: 200,
  status: "completed",
  genres: ["Fantasy"],
  tags: ["cultivation"],
  originalSource: null,
  yearPublished: 2020,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};
