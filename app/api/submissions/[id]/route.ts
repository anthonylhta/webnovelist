import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { canManageNovels } from "@/lib/roles";
import { containsSuspiciousContent, sanitizeString } from "@/lib/sanitize";

// GET — one submission: its owner or a mod (the add-title editor prefills from it)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);

    const { id } = await params;
    const submissionId = parseInt(id);
    if (isNaN(submissionId)) return apiError("Invalid ID", 400);

    const submission = await prisma.novelSubmission.findUnique({
      where: { id: submissionId },
      include: { user: { select: { username: true } }, novel: { select: { id: true, title: true } } },
    });
    if (!submission) return apiError("Submission not found", 404);
    if (submission.userId !== user.id && !canManageNovels(user.role)) return apiError("Forbidden", 403);

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Failed to fetch submission:", error);
    return apiError("Failed to fetch submission", 500);
  }
}

// PATCH — resolve a pending submission (mods): { action: "approve" | "merge", novelId } | { action: "reject", note? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);
    if (!canManageNovels(user.role)) return apiError("Forbidden", 403);

    const { id } = await params;
    const submissionId = parseInt(id);
    if (isNaN(submissionId)) return apiError("Invalid ID", 400);

    const body = await request.json();
    const action = body.action;
    if (action !== "approve" && action !== "merge" && action !== "reject") {
      return apiError("Invalid action", 400);
    }

    let note: string | null = null;
    if (body.note != null && body.note !== "") {
      if (typeof body.note !== "string" || body.note.length > 1000) return apiError("Note is too long", 400);
      if (containsSuspiciousContent(body.note)) return apiError("Input contains invalid characters", 400);
      note = sanitizeString(body.note);
    }

    let novelId: number | null = null;
    if (action === "approve" || action === "merge") {
      novelId = Number(body.novelId);
      if (!Number.isInteger(novelId) || novelId <= 0) return apiError("novelId is required", 400);
      const novel = await prisma.novel.findUnique({ where: { id: novelId }, select: { id: true } });
      if (!novel) return apiError("Novel not found", 404);
    }

    const submission = await prisma.novelSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) return apiError("Submission not found", 404);
    if (submission.status !== "pending") return apiError("Submission was already reviewed", 409);

    const status = action === "approve" ? "approved" : action === "merge" ? "merged" : "rejected";
    const updated = await prisma.novelSubmission.update({
      where: { id: submissionId },
      data: { status, novelId, reviewNote: note, reviewedById: user.id, reviewedAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to review submission:", error);
    return apiError("Failed to review submission", 500);
  }
}

// DELETE — withdraw your own pending submission
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return apiError("Not logged in", 401);

    const { id } = await params;
    const submissionId = parseInt(id);
    if (isNaN(submissionId)) return apiError("Invalid ID", 400);

    const submission = await prisma.novelSubmission.findUnique({ where: { id: submissionId } });
    if (!submission || submission.userId !== user.id) return apiError("Submission not found", 404);
    if (submission.status !== "pending") return apiError("Only pending submissions can be withdrawn", 409);

    await prisma.novelSubmission.delete({ where: { id: submissionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to withdraw submission:", error);
    return apiError("Failed to withdraw submission", 500);
  }
}
