// components/AddToListModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface AddToListModalProps {
  novelId: number;
  novelTitle: string;
  totalChapters: number | null;
  onClose: () => void;
  onSuccess: () => void;
  existingEntry?: {
    id: number;
    status: string;
    rating: number | null;
    currentChapter: number;
    dateStarted: string | null;
    dateFinished: string | null;
    notes: string | null;
    readingUrl?: string | null;
    rereadCount?: number;
  };
}

export default function AddToListModal({
  novelId,
  novelTitle,
  totalChapters,
  onClose,
  onSuccess,
  existingEntry,
}: AddToListModalProps) {
  const [form, setForm] = useState({
    status: existingEntry?.status || "plan_to_read",
    rating: existingEntry?.rating ?? "",
    currentChapter: existingEntry?.currentChapter || 0,
    dateStarted: existingEntry?.dateStarted?.split("T")[0] || "",
    dateFinished: existingEntry?.dateFinished?.split("T")[0] || "",
    notes: existingEntry?.notes || "",
    readingUrl: existingEntry?.readingUrl || "",
    rereadCount: existingEntry?.rereadCount || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isEditing = !!existingEntry;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isEditing ? `/api/list/${existingEntry.id}` : "/api/list";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId,
          status: form.status,
          rating: form.rating === "" ? null : parseFloat(form.rating as string),
          currentChapter: parseInt(String(form.currentChapter)) || 0,
          dateStarted: form.dateStarted || null,
          dateFinished: form.dateFinished || null,
          notes: form.notes || null,
          readingUrl: form.readingUrl || null,
          rereadCount: parseInt(String(form.rereadCount)) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      onSuccess();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingEntry) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/list/${existingEntry.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onSuccess();
      }
    } catch {
      setError("Failed to remove");
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold truncate pr-4">
              {isEditing ? "Edit" : "Add"}: {novelTitle}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                           text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="reading">📖 Reading</option>
                <option value="completed">✅ Completed</option>
                <option value="on_hold">⏸️ On Hold</option>
                <option value="dropped">❌ Dropped</option>
                <option value="plan_to_read">📋 Plan to Read</option>
              </select>
            </div>

            {/* Rating and Chapter on same row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Rating (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  placeholder="—"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                             text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Chapter{totalChapters ? ` (of ${totalChapters})` : ""}
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalChapters || undefined}
                  value={form.currentChapter}
                  onChange={(e) =>
                    setForm({ ...form, currentChapter: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                             text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Reading URL */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Reading Link
              </label>
              <input
                type="url"
                value={form.readingUrl}
                onChange={(e) => setForm({ ...form, readingUrl: e.target.value })}
                placeholder="https://www.novelupdates.com/..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                           text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Dates on same row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Date Started
                </label>
                <input
                  type="date"
                  value={form.dateStarted}
                  onChange={(e) => setForm({ ...form, dateStarted: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                             text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Date Finished
                </label>
                <input
                  type="date"
                  value={form.dateFinished}
                  onChange={(e) => setForm({ ...form, dateFinished: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                             text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Reread Count */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Times Re-read
              </label>
              <input
                type="number"
                min="0"
                value={form.rereadCount}
                onChange={(e) =>
                  setForm({ ...form, rereadCount: parseInt(e.target.value) || 0 })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                           text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Personal notes..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                           text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50
                           text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Add to List"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={loading}
                  className="px-4 bg-red-600/20 hover:bg-red-600/40 text-red-400
                             font-semibold py-3 rounded-lg transition"
                >
                  Remove
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {showConfirmDelete && (
        <ConfirmModal
          title="Remove Novel"
          message={`Are you sure you want to remove "${novelTitle}" from your list? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Keep it"
          danger={true}
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </>
  );
}