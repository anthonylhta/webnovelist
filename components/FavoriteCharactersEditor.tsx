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
      }
    } catch (error) {
      console.error("Failed to add character:", error);
    } finally {
      setLoading(false);
      setShowPicker(false);
      setSearch("");
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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
      <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
        Favorite Characters
      </h2>

      {favorites.length === 0 && !isOwner ? (
        <p className="text-gray-500 text-sm">No favorite characters yet.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {favorites.map((char) => (
            <div key={char.id} className="shrink-0 text-center relative group">
              <Link href={`/character/${char.id}`} className="block">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 rounded-full border border-gray-700
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
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 max-w-[60px] sm:max-w-[70px] truncate hover:text-purple-400 transition">
                  {char.name}
                </p>
                <p className="text-[9px] text-gray-600 truncate max-w-[60px] sm:max-w-[70px]">
                  {char.novel.title}
                </p>
              </Link>

              {isOwner && (
                <button
                  onClick={() => removeCharacter(char.id)}
                  disabled={loading}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-700 rounded-full 
                             flex items-center justify-center opacity-0 group-hover:opacity-100 transition
                             disabled:opacity-50"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              )}
            </div>
          ))}

          {/* Add button */}
          {isOwner && favorites.length < 5 && (
            <div className="relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                disabled={loading || remaining.length === 0}
                className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gray-800 rounded-full border border-gray-700 
                           border-dashed flex items-center justify-center text-gray-500 hover:text-gray-300 
                           hover:border-gray-600 transition disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>

              {showPicker && remaining.length > 0 && (
                <div className="absolute left-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-xl 
                                shadow-xl z-50 w-64 max-h-72 overflow-hidden">
                  <div className="p-2 border-b border-gray-700">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search characters or novels..."
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-1.5 text-sm 
                                 text-gray-200 focus:outline-none focus:border-purple-500"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-56">
                    {filtered.length === 0 ? (
                      <p className="text-gray-500 text-sm p-3 text-center">No characters found.</p>
                    ) : (
                      filtered.map((char) => (
                        <button
                          key={char.id}
                          onClick={() => addCharacter(char)}
                          disabled={loading}
                          className="w-full text-left px-3 py-2 hover:bg-gray-700 transition flex items-center gap-3"
                        >
                          <div className="relative w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                            {char.imageUrl ? (
                              <Image
                                fill
                                sizes="32px"
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
                          <div className="min-w-0">
                            <p className="text-sm text-gray-200 truncate">{char.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{char.novel.title}</p>
                          </div>
                          <span className="text-[10px] text-gray-600 ml-auto shrink-0">
                            {char.role}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isOwner && remaining.length === 0 && favorites.length < 5 && (
        <p className="text-gray-600 text-xs mt-2">
          No more characters available.
        </p>
      )}
    </div>
  );
}