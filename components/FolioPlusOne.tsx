"use client";

import { useState } from "react";

// The [+1] bracket verb — logs exactly one chapter on the entry. Full editing
// (arbitrary jumps, corrections) lives on the list page's edit modal.
export default function FolioPlusOne({
  entryId,
  currentChapter,
  totalChapters,
  onUpdate,
}: {
  entryId: number;
  currentChapter: number;
  totalChapters: number | null;
  onUpdate: (newChapter: number) => void;
}) {
  const [saving, setSaving] = useState(false);
  const finished = totalChapters !== null && currentChapter >= totalChapters;

  const bump = async () => {
    if (saving || finished) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/list/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentChapter: currentChapter + 1 }),
      });
      if (res.ok) onUpdate(currentChapter + 1);
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={bump}
      disabled={saving || finished}
      title="Log one chapter"
      className="font-mono text-[11px] text-gold transition hover:text-gold-bright disabled:cursor-default disabled:text-faint"
    >
      [+1]
    </button>
  );
}
