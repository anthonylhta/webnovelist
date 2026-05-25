import { apiError } from "@/lib/api-error";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const ALLOWED_COLORS = [
  "default",
  "blue",
  "purple",
  "emerald",
  "rose",
  "orange",
  "cyan",
  "red",
  "pink",
  "slate",
];

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return apiError("Not logged in", 401);
    }

    const userId = user.id;
    const { color } = await request.json();

    if (!ALLOWED_COLORS.includes(color)) {
      return apiError("Invalid color", 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { bannerColor: color === "default" ? null : color },
    });

    return NextResponse.json({ success: true, color });
  } catch (error) {
    console.error("Failed to update banner color:", error);
    return apiError("Failed to update", 500);
  }
}