// components/NovelAdminActions.tsx
"use client";

import { useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfirmModal from "./ConfirmModal";

interface NovelAdminActionsProps {
  novelId: number;
  novelTitle: string;
}

export default function NovelAdminActions({
  novelId,
  novelTitle,
}: NovelAdminActionsProps) {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userRole = currentUser?.role;
  const canEdit = userRole === "admin" || userRole === "moderator";
  const canDelete = userRole === "admin";

  // Don't render anything for regular users
  if (!canEdit) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/novels/${novelId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/browse");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete novel");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
        <span className="text-[9.5px] uppercase tracking-[0.2em] text-faint">
          curation
        </span>
        <Link
          href={`/novel/${novelId}/edit`}
          className="text-muted transition hover:text-gold"
        >
          [edit entry]
        </Link>
        {canDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-muted transition hover:text-seal-bright"
          >
            [delete]
          </button>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Novel"
          message={`Are you sure you want to delete "${novelTitle}"? This will also remove it from all users' lists. This action cannot be undone.`}
          confirmText="Delete Forever"
          cancelText="Cancel"
          danger={true}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}