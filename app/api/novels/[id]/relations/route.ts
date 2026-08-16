import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { INVERSE_KIND, isRelationKind, listRelations } from "@/lib/relations";

// GET — every title related to this one, from either side (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const novelId = parseInt(id);
    if (isNaN(novelId)) return apiError("Invalid novel ID", 400);

    return NextResponse.json(await listRelations(novelId));
  } catch (error) {
    console.error("Failed to fetch relations:", error);
    return apiError("Failed to fetch relations", 500);
  }
}

// POST — link this title to another (admin/mod only). Body: { toId, kind }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const fromId = parseInt(id);
    if (isNaN(fromId)) return apiError("Invalid novel ID", 400);

    const body = await request.json();
    const toId = Number(body.toId);
    if (!Number.isInteger(toId) || toId <= 0) return apiError("toId is required", 400);
    if (toId === fromId) return apiError("A title can't be related to itself", 400);
    const kind: unknown = body.kind;
    if (!isRelationKind(kind)) return apiError("Invalid relation kind", 400);

    const [from, to] = await Promise.all([
      prisma.novel.findUnique({ where: { id: fromId }, select: { id: true } }),
      prisma.novel.findUnique({ where: { id: toId }, select: { id: true } }),
    ]);
    if (!from || !to) return apiError("Novel not found", 404);

    // The same fact may already be stored from either side.
    const existing = await prisma.novelRelation.findFirst({
      where: {
        OR: [
          { fromId, toId, kind },
          { fromId: toId, toId: fromId, kind: INVERSE_KIND[kind] },
        ],
      },
    });
    if (existing) return apiError("These titles are already linked that way", 409);

    const relation = await prisma.novelRelation.create({
      data: { fromId, toId, kind },
    });
    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    console.error("Failed to create relation:", error);
    return apiError("Failed to create relation", 500);
  }
}
