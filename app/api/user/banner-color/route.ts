import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { color } = await request.json();

    if (!ALLOWED_COLORS.includes(color)) {
      return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { bannerColor: color === "default" ? null : color },
    });

    return NextResponse.json({ success: true, color });
  } catch (error) {
    console.error("Failed to update banner color:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}