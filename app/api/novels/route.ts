import { apiError } from "@/lib/api-error";
// app/api/novels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { sanitizeString, isValidUrl, containsSuspiciousContent } from "@/lib/sanitize";
import { isMediaType } from "@/lib/media-types";

// GET all novels — anyone can browse
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const recent = searchParams.get("recent") === "true";

    const novels = await prisma.novel.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { nativeTitle: { contains: search, mode: "insensitive" } },
                  { author: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          genre ? { genres: { has: genre } } : {},
        ],
      },
      orderBy: recent ? { createdAt: "desc" } : { title: "asc" },
      take: recent ? 10 : undefined,
    });

    return NextResponse.json(novels);
  } catch (error) {
    console.error("Failed to fetch novels:", error);
    return apiError("Failed to fetch novels", 500);
  }
}

// POST — only admins and moderators can add novels
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return apiError("Not logged in", 401);
    }

    if (!canManageNovels(user.role)) {
      return apiError("You don't have permission to add novels", 403);
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return apiError("Title is required", 400);
    }

    if (body.title.length > 500) {
      return apiError("Title is too long", 400);
    }

    // Check for suspicious content
    const fieldsToCheck = [
      body.title, body.nativeTitle, body.author,
      body.description, body.originalSource
    ].filter(Boolean);

    for (const field of fieldsToCheck) {
      if (containsSuspiciousContent(field)) {
        return apiError("Input contains invalid characters", 400);
      }
    }

    // Validate URL if provided
    if (body.coverImageUrl && !isValidUrl(body.coverImageUrl)) {
      return apiError("Invalid cover image URL", 400);
    }

    if (body.mediaType !== undefined && !isMediaType(body.mediaType)) {
      return apiError("Invalid media type", 400);
    }

    // Sanitize all string inputs
    const novel = await prisma.novel.create({
      data: {
        title: sanitizeString(body.title),
        nativeTitle: body.nativeTitle ? sanitizeString(body.nativeTitle) : null,
        mediaType: body.mediaType,
        author: body.author ? sanitizeString(body.author) : null,
        description: body.description ? sanitizeString(body.description) : null,
        coverImageUrl: body.coverImageUrl || null,
        totalChapters: body.totalChapters ? parseInt(body.totalChapters) : null,
        status: body.status ? sanitizeString(body.status) : null,
        genres: Array.isArray(body.genres) ? body.genres.map(sanitizeString) : [],
        tags: Array.isArray(body.tags) ? body.tags.map(sanitizeString) : [],
        originalSource: body.originalSource ? sanitizeString(body.originalSource) : null,
        yearPublished: body.yearPublished ? parseInt(body.yearPublished) : null,
      },
    });

    return NextResponse.json(novel, { status: 201 });
  } catch (error) {
    console.error("Failed to create novel:", error);
    return apiError("Failed to create novel", 500);
  }
}