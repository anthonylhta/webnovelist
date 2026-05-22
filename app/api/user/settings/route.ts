// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { rateLimit, getIP } from "@/lib/rate-limit";
import { containsSuspiciousContent } from "@/lib/sanitize";

const USERNAME_COOLDOWN_DAYS = 30;

export async function GET() {
  try {
    const me = await getCurrentUser();

    if (!me) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = me.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        usernameChangedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate days until next change allowed
    let daysUntilChange = 0;
    if (user.usernameChangedAt) {
      const cooldownEnd = new Date(user.usernameChangedAt);
      cooldownEnd.setDate(cooldownEnd.getDate() + USERNAME_COOLDOWN_DAYS);
      const now = new Date();
      if (cooldownEnd > now) {
        daysUntilChange = Math.ceil(
          (cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    return NextResponse.json({
      ...user,
      daysUntilChange,
      cooldownDays: USERNAME_COOLDOWN_DAYS,
    });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const rateLimitResponse = await rateLimit(getIP(request), "general");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const me = await getCurrentUser();

    if (!me) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const userId = me.id;
    const userRole = me.role;
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const trimmed = username.trim();

    // Validation
    if (trimmed.length < 3 || trimmed.length > 30) {
      return NextResponse.json(
        { error: "Username must be 3-30 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, hyphens, and underscores" },
        { status: 400 }
      );
    }

    if (containsSuspiciousContent(trimmed)) {
      return NextResponse.json(
        { error: "Username contains invalid characters" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, usernameChangedAt: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If username hasn't changed, just return success
    if (currentUser.username === trimmed) {
      return NextResponse.json({ message: "No changes made" });
    }

    // Check cooldown (admins bypass)
    if (userRole !== "admin" && currentUser.usernameChangedAt) {
      const cooldownEnd = new Date(currentUser.usernameChangedAt);
      cooldownEnd.setDate(cooldownEnd.getDate() + USERNAME_COOLDOWN_DAYS);

      if (new Date() < cooldownEnd) {
        const daysLeft = Math.ceil(
          (cooldownEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return NextResponse.json(
          {
            error: `You can change your username again in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
          },
          { status: 429 }
        );
      }
    }

    // Check if username is taken
    const existing = await prisma.user.findUnique({
      where: { username: trimmed },
    });

    if (existing && existing.id !== userId) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Update username
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        username: trimmed,
        usernameChangedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        usernameChangedAt: true,
      },
    });

    return NextResponse.json({
      message: "Username updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("Failed to update username:", error);
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 }
    );
  }
}