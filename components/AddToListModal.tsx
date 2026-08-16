// components/AddToListModal.tsx
"use client";

import { useState } from "react";
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-hairline bg-surface">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold-dim">
                {isEditing ? "Edit entry" : "Add to library"}
              </p>
              <h2 className="mt-1 truncate font-serif text-[17px] text-paper">{novelTitle}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 font-mono text-[11px] text-muted transition hover:text-gold"
            >
              [close]
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
            {error && (
              <p className="border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">
                {error}
              </p>
            )}

            {/* Status */}
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none"
              >
                <option value="reading">Reading</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="dropped">Dropped</option>
                <option value="plan_to_read">Plan to Read</option>
              </select>
            </div>

            {/* Rating and Chapter on same row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
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
                  className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
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
                  className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none"
                />
              </div>
            </div>

            {/* Reading URL */}
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                Reading Link
              </label>
              <input
                type="url"
                value={form.readingUrl}
                onChange={(e) => setForm({ ...form, readingUrl: e.target.value })}
                placeholder="https://www.novelupdates.com/..."
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none"
              />
            </div>

            {/* Dates on same row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                  Date Started
                </label>
                <input
                  type="date"
                  value={form.dateStarted}
                  onChange={(e) => setForm({ ...form, dateStarted: e.target.value })}
                  className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                  Date Finished
                </label>
                <input
                  type="date"
                  value={form.dateFinished}
                  onChange={(e) => setForm({ ...form, dateFinished: e.target.value })}
                  className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none"
                />
              </div>
            </div>

            {/* Reread Count */}
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                Times Re-read
              </label>
              <input
                type="number"
                min="0"
                value={form.rereadCount}
                onChange={(e) =>
                  setForm({ ...form, rereadCount: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Personal notes..."
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-[2px] bg-gold py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ink transition hover:bg-gold-bright disabled:bg-gold/50"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Add to List"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={loading}
                  className="rounded-[2px] border border-seal/50 px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-seal-bright transition hover:bg-seal/10 disabled:opacity-50"
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