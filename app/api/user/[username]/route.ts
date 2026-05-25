import { apiError } from "@/lib/api-error";
// app/api/user/[username]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        novelList: {
          include: {
            novel: true,
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return apiError("Failed to fetch profile", 500);
  }
}