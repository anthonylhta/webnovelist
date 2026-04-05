// app/api/novels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";

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

    const novel = await prisma.novel.create({
      data: {
        title: body.title,
        titleChinese: body.titleChinese || null,
        author: body.author || null,
        description: body.description || null,
        coverImageUrl: body.coverImageUrl || null,
        totalChapters: body.totalChapters || null,
        status: body.status || null,
        genres: body.genres || [],
        tags: body.tags || [],
        originalSource: body.originalSource || null,
        yearPublished: body.yearPublished || null,
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