// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser();

    if (!me) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    if (me.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Prevent admin from changing their own role
    if (id === me.id) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["user", "moderator", "admin"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: body.role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

// DELETE — admins can delete anyone, mods can delete mods + users
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser();

    if (!me) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const currentRole = me.role;
    const currentUserId = me.id;

    // Only admins and moderators can delete users
    if (currentRole !== "admin" && currentRole !== "moderator") {
      return NextResponse.json(
        { error: "You don't have permission to delete users" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Can't delete yourself
    if (id === currentUserId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Fetch the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, clerkId: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Permission checks based on role hierarchy
    if (currentRole === "moderator" && targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Moderators cannot delete admins" },
        { status: 403 }
      );
    }

    // Remove from Clerk first so they can't sign back in, then from our DB
    // (cascades clean up their list, activities, and favorites).
    if (targetUser.clerkId) {
      const client = await clerkClient();
      await client.users.deleteUser(targetUser.clerkId);
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: `User "${targetUser.username}" has been deleted`,
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}