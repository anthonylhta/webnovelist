// components/NovelAdminActions.tsx
"use client";

import { useState } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
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
      <div className="flex gap-2">
        {/* Edit Button */}
        <Link
          href={`/novel/${novelId}/edit`}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 
                     text-gray-300 font-semibold py-2.5 rounded-lg transition text-sm"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Link>

        {/* Delete Button — Admin Only */}
        {canDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30
                       text-red-400 font-semibold py-2.5 px-4 rounded-lg transition text-sm
                       border border-red-600/30"
          >
            <Trash2 className="w-4 h-4" />
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