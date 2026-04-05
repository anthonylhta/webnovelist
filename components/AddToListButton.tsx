// components/AddToListButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Edit } from "lucide-react";
import AddToListModal from "./AddToListModal";

interface AddToListButtonProps {
  novelId: number;
  novelTitle: string;
  totalChapters: number | null;
}

export default function AddToListButton({
  novelId,
  novelTitle,
  totalChapters,
}: AddToListButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [existingEntry, setExistingEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if novel is already in user's list
  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    fetch("/api/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const entry = data.find((e: any) => e.novelId === novelId);
          setExistingEntry(entry || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session, novelId]);

  const handleClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    // Refresh the page to update the button state
    window.location.reload();
  };

  const statusLabels: Record<string, string> = {
    reading: "📖 Reading",
    completed: "✅ Completed",
    on_hold: "⏸️ On Hold",
    dropped: "❌ Dropped",
    plan_to_read: "📋 Plan to Read",
  };

  if (loading) {
    return (
      <div className="w-full mt-4 bg-gray-800 py-3 rounded-lg animate-pulse h-12" />
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full mt-4 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2
          ${
            existingEntry
              ? "bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/50"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
      >
        {existingEntry ? (
          <>
            <Edit className="w-4 h-4" />
            {statusLabels[existingEntry.status] || existingEntry.status}
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add to List
          </>
        )}
      </button>

      {showModal && (
        <AddToListModal
          novelId={novelId}
          novelTitle={novelTitle}
          totalChapters={totalChapters}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          existingEntry={
            existingEntry
              ? {
                  id: existingEntry.id,
                  status: existingEntry.status,
                  rating: existingEntry.rating,
                  currentChapter: existingEntry.currentChapter,
                  dateStarted: existingEntry.dateStarted,
                  dateFinished: existingEntry.dateFinished,
                  notes: existingEntry.notes,
                }
              : undefined
          }
        />
      )}
    </>
  );
}