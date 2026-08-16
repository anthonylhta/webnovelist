import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";

// DELETE — unlink (admin/mod only). The row must touch this novel from either side.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; relationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const { id, relationId } = await params;
    const novelId = parseInt(id);
    const relId = parseInt(relationId);
    if (isNaN(novelId) || isNaN(relId)) return apiError("Invalid ID", 400);

    const relation = await prisma.novelRelation.findUnique({ where: { id: relId } });
    if (!relation || (relation.fromId !== novelId && relation.toId !== novelId)) {
      return apiError("Relation not found", 404);
    }

    await prisma.novelRelation.delete({ where: { id: relId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete relation:", error);
    return apiError("Failed to delete relation", 500);
  }
}
