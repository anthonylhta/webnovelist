// components/QuickChapterUpdate.tsx
"use client";

import { useState, useRef } from "react";
import { Minus, Plus } from "lucide-react";

interface QuickChapterUpdateProps {
  entryId: number;
  currentChapter: number;
  totalChapters: number | null;
  onUpdate: (newChapter: number) => void;
}

export default function QuickChapterUpdate({
  entryId,
  currentChapter,
  totalChapters,
  onUpdate,
}: QuickChapterUpdateProps) {
  const [chapter, setChapter] = useState(currentChapter);
  const [saving, setSaving] = useState(false);
  const justSubmitted = useRef(false);

  const updateChapter = async (newChapter: number) => {
    if (saving) return;
    if (newChapter < 0) return;
    if (totalChapters && newChapter > totalChapters) return;
    if (newChapter === currentChapter) return;

    setChapter(newChapter);
    setSaving(true);

    try {
      await fetch(`/api/list/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentChapter: newChapter }),
      });
      onUpdate(newChapter);
    } catch (error) {
      console.error("Failed to update:", error);
      setChapter(currentChapter);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => updateChapter(chapter - 1)}
        disabled={saving || chapter <= 0}
        className="p-1 text-faint hover:text-paper disabled:opacity-30 transition"
      >
        <Minus className="w-3 h-3" />
      </button>

      <input
        type="number"
        value={chapter}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 0;
          setChapter(val);
        }}
        onBlur={() => {
          if (justSubmitted.current) {
            justSubmitted.current = false;
            return;
          }
          if (chapter !== currentChapter) {
            updateChapter(chapter);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            justSubmitted.current = true;
            updateChapter(chapter);
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-14 bg-transparent border border-hairline rounded px-1 py-0.5
                   text-center text-sm focus:outline-none focus:border-gold-dim"
      />

      <span className="text-faint text-sm">
        {totalChapters ? `/ ${totalChapters}` : ""}
      </span>

      <button
        onClick={() => updateChapter(chapter + 1)}
        disabled={saving || (totalChapters !== null && chapter >= totalChapters)}
        className="p-1 text-faint hover:text-paper disabled:opacity-30 transition"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}