import { apiError } from "@/lib/api-error";
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
      return apiError("Not logged in", 401);
    }

    if (me.role !== "admin") {
      return apiError("Admin only", 403);
    }

    const { id } = await params;
    const body = await request.json();

    // Prevent admin from changing their own role
    if (id === me.id) {
      return apiError("Cannot change your own role", 400);
    }

    // Validate role
    const validRoles = ["user", "moderator", "admin"];
    if (!validRoles.includes(body.role)) {
      return apiError("Invalid role", 400);
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
    return apiError("Failed to update role", 500);
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
      return apiError("Not logged in", 401);
    }

    const currentRole = me.role;
    const currentUserId = me.id;

    // Only admins and moderators can delete users
    if (currentRole !== "admin" && currentRole !== "moderator") {
      return apiError("You don't have permission to delete users", 403);
    }

    const { id } = await params;

    // Can't delete yourself
    if (id === currentUserId) {
      return apiError("You cannot delete your own account", 400);
    }

    // Fetch the target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, clerkId: true },
    });

    if (!targetUser) {
      return apiError("User not found", 404);
    }

    // Permission checks based on role hierarchy
    if (currentRole === "moderator" && targetUser.role === "admin") {
      return apiError("Moderators cannot delete admins", 403);
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
    return apiError("Failed to delete user", 500);
  }
}