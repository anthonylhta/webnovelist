// components/AddToListButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
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
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [existingEntry, setExistingEntry] = useState<{
    id: number;
    novelId: number;
    isFavorite: boolean;
    status: string;
    rating: number | null;
    currentChapter: number;
    dateStarted: string | null;
    dateFinished: string | null;
    notes: string | null;
    readingUrl: string | null;
    rereadCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    fetch("/api/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const entry = data.find((e: { novelId: number }) => e.novelId === novelId);
          setExistingEntry(entry || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser, novelId]);

  const handleClick = () => {
    if (!currentUser) {
      router.push("/sign-in");
      return;
    }
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
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
      <div className="w-full bg-gray-800 py-3 rounded-lg animate-pulse h-12" />
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`w-full font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2
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
                  readingUrl: existingEntry.readingUrl,
                  rereadCount: existingEntry.rereadCount,
                }
              : undefined
          }
        />
      )}
    </>
  );
}