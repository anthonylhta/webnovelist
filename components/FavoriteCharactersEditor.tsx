"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, X, Users } from "lucide-react";
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          Favorite Characters
        </h2>
        {isOwner && favorites.length < 5 && !showPicker && (
          <button
            onClick={openPicker}
            disabled={loading || remaining.length === 0}
            className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300
                       disabled:opacity-40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>

      {/* Empty state */}
      {favorites.length === 0 && !isOwner && (
        <p className="text-gray-500 text-sm">No favorite characters yet.</p>
      )}

      {/* Character avatars */}
      {favorites.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-1">
          {favorites.map((char) => (
            <div key={char.id} className="relative group">
              <Link href={`/character/${char.id}`} className="block text-center w-16">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-gray-800 rounded-full border border-gray-700
                                flex items-center justify-center overflow-hidden hover:border-purple-500/60 transition">
                  {char.imageUrl ? (
                    <Image
                      fill
                      sizes="64px"
                      src={char.imageUrl}
                      alt={char.name}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">
                      {char.name[0]}
                    </span>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 truncate hover:text-purple-400 transition">
                  {char.name}
                </p>
                <p className="text-[9px] text-gray-600 truncate">
                  {char.novel.title}
                </p>
              </Link>

              {isOwner && (
                <button
                  onClick={() => removeCharacter(char.id)}
                  disabled={loading}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full
                             flex items-center justify-center opacity-0 group-hover:opacity-100 transition
                             disabled:opacity-50"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Picker */}
      {showPicker && (
        <div className="mt-3 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-2 border-b border-gray-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters or novels..."
              className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-sm
                         text-gray-200 focus:outline-none focus:border-purple-500"
              autoFocus
            />
            <button
              onClick={() => { setShowPicker(false); setSearch(""); }}
              className="p-1.5 text-gray-500 hover:text-gray-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-64">
            {filtered.length === 0 ? (
              <p className="text-gray-500 text-sm p-4 text-center">No characters found.</p>
            ) : (
              filtered.map((char) => (
                <button
                  key={char.id}
                  onClick={() => addCharacter(char)}
                  disabled={loading}
                  className="w-full text-left px-3 py-2.5 hover:bg-gray-700 transition flex items-center gap-3
                             border-b border-gray-700/50 last:border-0 disabled:opacity-50"
                >
                  <div className="relative w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-gray-600">
                    {char.imageUrl ? (
                      <Image
                        fill
                        sizes="36px"
                        src={char.imageUrl}
                        alt={char.name}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-500">
                        {char.name[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{char.name}</p>
                    <p className="text-xs text-gray-500 truncate">{char.novel.title}</p>
                  </div>
                  {char.role && (
                    <span className="text-[10px] text-gray-600 shrink-0">{char.role}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {isOwner && remaining.length === 0 && favorites.length < 5 && !showPicker && (
        <p className="text-gray-600 text-xs mt-2">No more characters available.</p>
      )}
    </div>
  );
}
