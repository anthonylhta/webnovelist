import { apiError } from "@/lib/api-error";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { sanitizeString, isValidUrl, containsSuspiciousContent } from "@/lib/sanitize";

// GET — list all authors (public)
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search") || "";

    const authors = await prisma.author.findMany({
      where: search
        ? { name: { contains: search, mode: "insensitive" } }
        : {},
      orderBy: { name: "asc" },
      include: { _count: { select: { novels: true, favorites: true } } },
    });

    return NextResponse.json(authors);
  } catch (error) {
    console.error("Failed to fetch authors:", error);
    return apiError("Failed to fetch authors", 500);
  }
}

// POST — create author (admin/mod only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const body = await request.json();

    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return apiError("Name is required", 400);
    }
    if (body.name.length > 200) return apiError("Name is too long", 400);

    const fieldsToCheck = [body.name, body.bio].filter(Boolean);
    for (const field of fieldsToCheck) {
      if (containsSuspiciousContent(field)) return apiError("Input contains invalid characters", 400);
    }

    if (body.imageUrl && !isValidUrl(body.imageUrl)) {
      return apiError("Invalid image URL", 400);
    }

    const existing = await prisma.author.findUnique({
      where: { name: body.name.trim() },
    });
    if (existing) return apiError("An author with that name already exists", 409);

    const author = await prisma.author.create({
      data: {
        name: sanitizeString(body.name),
        bio: body.bio ? sanitizeString(body.bio) : null,
        imageUrl: body.imageUrl || null,
      },
    });

    return NextResponse.json(author, { status: 201 });
  } catch (error) {
    console.error("Failed to create author:", error);
    return apiError("Failed to create author", 500);
  }
}
