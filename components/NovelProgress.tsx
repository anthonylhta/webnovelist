"use client";

import { useState } from "react";
import Link from "next/link";
import AddToListModal from "@/components/AddToListModal";
import FolioPlusOne from "@/components/FolioPlusOne";
import { StatusSeal } from "@/components/FolioKit";

// The novel page's "your reading" module — the chapter number is the hero.
// The entry comes from the server (no client /api/list roundtrip); the modal
// still owns full editing and reloads on success so the server data refreshes.

export type ProgressEntry = {
  id: number;
  status: string;
  rating: number | null;
  currentChapter: number;
  isFavorite: boolean;
  dateStarted: string | null;
  dateFinished: string | null;
  notes: string | null;
  readingUrl: string | null;
  rereadCount: number;
};

export default function NovelProgress({
  novelId,
  novelTitle,
  totalChapters,
  signedIn,
  entry,
}: {
  novelId: number;
  novelTitle: string;
  totalChapters: number | null;
  signedIn: boolean;
  entry: ProgressEntry | null;
}) {
  const [showModal, setShowModal] = useState(false);
  const [chapter, setChapter] = useState(entry?.currentChapter ?? 0);
  const [isFavorite, setIsFavorite] = useState(entry?.isFavorite ?? false);
  const [toggling, setToggling] = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    window.location.reload();
  };

  const toggleFavorite = async () => {
    if (!entry || toggling) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/list/${entry.id}/favorite`, { method: "PUT" });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch {
      // leave the heart as it was
    } finally {
      setToggling(false);
    }
  };

  if (!signedIn) {
    return (
      <p className="font-mono text-[11.5px] text-muted">
        keep your place in this one —{" "}
        <Link href="/sign-in" className="text-gold transition hover:text-gold-bright">
          [sign-in]
        </Link>
      </p>
    );
  }

  if (!entry) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="font-mono text-[12px] text-gold transition hover:text-gold-bright"
        >
          [+ add to library]
        </button>
        {showModal && (
          <AddToListModal
            novelId={novelId}
            novelTitle={novelTitle}
            totalChapters={totalChapters}
            onClose={() => setShowModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </>
    );
  }

  const pct = totalChapters
    ? Math.min(Math.round((chapter / totalChapters) * 100), 100)
    : null;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-gold-dim">
            You are on chapter
          </p>
          <p className="mt-1 flex items-baseline gap-2.5">
            <span className="font-serif text-5xl font-semibold leading-none text-paper tabular-nums">
              {chapter}
            </span>
            <span className="font-mono text-[11.5px] text-muted tabular-nums">
              {totalChapters ? `/ ${totalChapters.toLocaleString()}` : ""}
              {pct !== null ? ` · ${pct}%` : ""}
            </span>
          </p>
          {entry.rating != null && (
            <p className="mt-2 font-mono text-[11px] text-body tabular-nums">
              <span className="text-gold">★</span> {entry.rating} — your rating
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pb-1">
          <StatusSeal status={entry.status} />
          <FolioPlusOne
            entryId={entry.id}
            currentChapter={chapter}
            totalChapters={totalChapters}
            onUpdate={setChapter}
          />
          <button
            onClick={() => setShowModal(true)}
            className="font-mono text-[11px] text-muted transition hover:text-gold"
            title="Edit entry"
          >
            [edit]
          </button>
          <button
            onClick={toggleFavorite}
            disabled={toggling}
            title={isFavorite ? "Remove from favourites" : "Add to favourites"}
            className={`font-mono text-[11px] transition ${
              isFavorite ? "text-seal hover:text-seal-bright" : "text-muted hover:text-seal-bright"
            }`}
          >
            {isFavorite ? "[♥ fav]" : "[♡ fav]"}
          </button>
        </div>
      </div>

      {showModal && (
        <AddToListModal
          novelId={novelId}
          novelTitle={novelTitle}
          totalChapters={totalChapters}
          existingEntry={{
            id: entry.id,
            status: entry.status,
            rating: entry.rating,
            currentChapter: chapter,
            dateStarted: entry.dateStarted,
            dateFinished: entry.dateFinished,
            notes: entry.notes,
            readingUrl: entry.readingUrl,
            rereadCount: entry.rereadCount,
          }}
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
