// app/api/novels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { sanitizeString, isValidUrl, containsSuspiciousContent } from "@/lib/sanitize";

// GET all novels — anyone can browse
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";

    const novels = await prisma.novel.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: "insensitive" } },
                  { titleChinese: { contains: search, mode: "insensitive" } },
                  { author: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          genre ? { genres: { has: genre } } : {},
        ],
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json(novels);
  } catch (error) {
    console.error("Failed to fetch novels:", error);
    return NextResponse.json(
      { error: "Failed to fetch novels" },
      { status: 500 }
    );
  }
}

// POST — only admins and moderators can add novels
export async function POST(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    if (!canManageNovels(session.user.role)) {
      return NextResponse.json(
        { error: "You don't have permission to add novels" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (body.title.length > 500) {
      return NextResponse.json({ error: "Title is too long" }, { status: 400 });
    }

    // Check for suspicious content
    const fieldsToCheck = [
      body.title, body.titleChinese, body.author,
      body.description, body.originalSource
    ].filter(Boolean);

    for (const field of fieldsToCheck) {
      if (containsSuspiciousContent(field)) {
        return NextResponse.json(
          { error: "Input contains invalid characters" },
          { status: 400 }
        );
      }
    }

    // Validate URL if provided
    if (body.coverImageUrl && !isValidUrl(body.coverImageUrl)) {
      return NextResponse.json({ error: "Invalid cover image URL" }, { status: 400 });
    }

    // Sanitize all string inputs
    const novel = await prisma.novel.create({
      data: {
        title: sanitizeString(body.title),
        titleChinese: body.titleChinese ? sanitizeString(body.titleChinese) : null,
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
    return NextResponse.json(
      { error: "Failed to create novel" },
      { status: 500 }
    );
  }
}