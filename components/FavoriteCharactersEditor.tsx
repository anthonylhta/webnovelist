"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import Link from "next/link";

interface Character {
  id: number;
  name: string;
  role: string | null;
  imageUrl: string | null;
  novel: { id: number; title: string };
}

interface FavoriteCharactersEditorProps {
  initialFavorites: Character[];
  availableCharacters: Character[];
  isOwner: boolean;
}

export default function FavoriteCharactersEditor({
  initialFavorites,
  availableCharacters,
  isOwner,
}: FavoriteCharactersEditorProps) {
  const [favorites, setFavorites] = useState<Character[]>(initialFavorites);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const remaining = availableCharacters.filter(
    (c) => !favorites.some((f) => f.id === c.id)
  );

  const filtered = remaining.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.novel.title.toLowerCase().includes(search.toLowerCase())
  );

  const addCharacter = async (character: Character) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorite-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: character.id }),
      });
      if (res.ok) {
        setFavorites([...favorites, character]);
        setShowPicker(false);
        setSearch("");
      }
    } catch (error) {
      console.error("Failed to add character:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeCharacter = async (characterId: number) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorite-characters", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId }),
      });
      if (res.ok) {
        setFavorites(favorites.filter((f) => f.id !== characterId));
      }
    } catch (error) {
      console.error("Failed to remove character:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPicker = () => {
    setShowPicker(true);
    setSearch("");
  };

  return (
    <div className="border-b border-hairline px-4 py-4">
      {/* Header */}
      <div className="mb-2.5 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        <span className="shrink-0">Favourite characters</span>
        <span aria-hidden className="h-px flex-1 bg-hairline" />
        {isOwner && favorites.length < 5 && !showPicker && (
          <button
            onClick={openPicker}
            disabled={loading || remaining.length === 0}
            className="shrink-0 normal-case tracking-normal text-[11px] text-gold transition hover:text-gold-bright disabled:opacity-40"
          >
            [+ add]
          </button>
        )}
      </div>

      {/* Empty state */}
      {favorites.length === 0 && !isOwner && (
        <p className="text-faint text-sm">No favorite characters yet.</p>
      )}

      {/* Character links — flowing mono text, matching the Circle module */}
      {favorites.length > 0 && (
        <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
          {favorites.map((char) => (
            <span key={char.id} className="inline-flex items-baseline gap-1.5">
              <Link
                href={`/character/${char.id}`}
                className="text-body transition hover:text-gold"
              >
                {char.name} <span className="text-faint">· {char.novel.title}</span>
              </Link>
              {isOwner && (
                <button
                  onClick={() => removeCharacter(char.id)}
                  disabled={loading}
                  aria-label={`Remove ${char.name}`}
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
              placeholder="Search characters or novels..."
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
            {filtered.length === 0 ? (
              <p className="text-faint text-sm p-4 text-center">No characters found.</p>
            ) : (
              filtered.map((char) => (
                <button
                  key={char.id}
                  onClick={() => addCharacter(char)}
                  disabled={loading}
                  className="w-full text-left px-3 py-2.5 hover:bg-hairline transition flex items-center gap-3
                             border-b border-hairline/50 last:border-0 disabled:opacity-50"
                >
                  <div className="relative w-9 h-9 bg-surface rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-hairline">
                    <Image
                      fill
                      sizes="36px"
                      src={char.imageUrl || "/default-avatar.svg"}
                      alt={char.name}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-body truncate">{char.name}</p>
                    <p className="text-xs text-faint truncate">{char.novel.title}</p>
                  </div>
                  {char.role && (
                    <span className="text-[10px] text-faint shrink-0">{char.role}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {isOwner && remaining.length === 0 && favorites.length < 5 && !showPicker && (
        <p className="text-faint text-xs mt-2">No more characters available.</p>
      )}
    </div>
  );
}
