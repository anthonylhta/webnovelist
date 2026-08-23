"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

interface AuthorItem {
  id: number;
  name: string;
  imageUrl: string | null;
}

interface FavoriteAuthorsEditorProps {
  initialFavorites: AuthorItem[];
  availableAuthors: AuthorItem[];
  isOwner: boolean;
}

export default function FavoriteAuthorsEditor({
  initialFavorites,
  availableAuthors,
  isOwner,
}: FavoriteAuthorsEditorProps) {
  const [favorites, setFavorites] = useState<AuthorItem[]>(initialFavorites);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const favIds = new Set(favorites.map((f) => f.id));
  const remaining = availableAuthors.filter(
    (a) => !favIds.has(a.id) && a.name.toLowerCase().includes(search.toLowerCase())
  );

  const addAuthor = async (author: AuthorItem) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorite-authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: author.id }),
      });
      if (res.ok) {
        setFavorites((prev) => [...prev, author]);
        setShowPicker(false);
        setSearch("");
      }
    } catch (error) {
      console.error("Failed to add author:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeAuthor = async (authorId: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorite-authors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId }),
      });
      if (res.ok) setFavorites((prev) => prev.filter((a) => a.id !== authorId));
    } catch (error) {
      console.error("Failed to remove author:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-hairline px-4 py-4">
      {/* Header */}
      <div className="mb-2.5 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        <span className="shrink-0">Favourite authors</span>
        <span aria-hidden className="h-px flex-1 bg-hairline" />
        {isOwner && favorites.length < 5 && !showPicker && (
          <button
            onClick={() => { setShowPicker(true); setSearch(""); }}
            disabled={loading || availableAuthors.length === 0}
            className="shrink-0 normal-case tracking-normal text-[11px] text-gold transition hover:text-gold-bright disabled:opacity-40"
          >
            [+ add]
          </button>
        )}
      </div>

      {/* Empty state (non-owner) */}
      {favorites.length === 0 && !isOwner && (
        <p className="text-faint text-sm">No favourite authors yet.</p>
      )}

      {/* Author links — flowing mono text, matching the Circle module */}
      {favorites.length > 0 && (
        <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
          {favorites.map((author) => (
            <span key={author.id} className="inline-flex items-baseline gap-1.5">
              <Link
                href={`/author/${author.id}`}
                className="text-body transition hover:text-gold"
              >
                {author.name}
              </Link>
              {isOwner && (
                <button
                  onClick={() => removeAuthor(author.id)}
                  disabled={loading}
                  aria-label={`Remove ${author.name}`}
                  className="text-faint transition hover:text-seal-bright disabled:opacity-50"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </p>
      )}

      {/* Picker */}
      {showPicker && (
        <div className="mt-3 bg-elevated border border-hairline rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-2 border-b border-hairline">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search authors..."
              className="flex-1 bg-surface border border-hairline rounded-lg px-3 py-1.5 text-sm
                         text-body focus:outline-none focus:border-gold-dim"
              autoFocus
            />
            <button
              onClick={() => { setShowPicker(false); setSearch(""); }}
              className="p-1.5 text-faint hover:text-body transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-64">
            {remaining.length === 0 ? (
              <p className="text-faint text-sm p-4 text-center">
                {search ? "No results." : "All authors added."}
              </p>
            ) : (
              remaining.map((author) => (
                <button
                  key={author.id}
                  onClick={() => addAuthor(author)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-hairline transition text-left
                             border-b border-hairline/50 last:border-0 disabled:opacity-50"
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-hairline shrink-0 bg-elevated">
                    <Image
                      fill
                      sizes="36px"
                      src={author.imageUrl || "/default-avatar.svg"}
                      alt={author.name}
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm text-body truncate">{author.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {isOwner && availableAuthors.length === 0 && favorites.length === 0 && !showPicker && (
        <p className="text-faint text-xs mt-2">No authors have been added to the database yet.</p>
      )}
    </div>
  );
}
