"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, X, BookMarked, Search } from "lucide-react";

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

const AVATAR_PLACEHOLDER = "https://placehold.co/200x200/1a1a2e/ffffff?text=?";

export default function FavoriteAuthorsEditor({
  initialFavorites,
  availableAuthors,
  isOwner,
}: FavoriteAuthorsEditorProps) {
  const [favorites, setFavorites] = useState<AuthorItem[]>(initialFavorites);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
      if (res.ok) setFavorites((prev) => [...prev, author]);
    } catch (error) {
      console.error("Failed to add author:", error);
    } finally {
      setLoading(false);
      setShowPicker(false);
      setSearch("");
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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
      <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
        <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
        Favourite Authors
      </h2>

      {favorites.length === 0 && !isOwner ? (
        <p className="text-gray-500 text-sm">No favourite authors yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {favorites.map((author) => (
            <div key={author.id} className="flex flex-col items-center gap-1.5 group">
              <div className="relative">
                <Link href={`/author/${author.id}`}>
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-orange-500/60 transition bg-gray-800">
                    <Image
                      fill
                      sizes="56px"
                      src={author.imageUrl || AVATAR_PLACEHOLDER}
                      alt={author.name}
                      className="object-cover"
                    />
                  </div>
                </Link>
                {isOwner && (
                  <button
                    onClick={() => removeAuthor(author.id)}
                    disabled={loading}
                    className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-500/50 transition disabled:opacity-50 opacity-0 group-hover:opacity-100"
                    style={{ width: 18, height: 18 }}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <Link
                href={`/author/${author.id}`}
                className="text-xs text-gray-400 hover:text-orange-400 transition text-center max-w-[64px] truncate"
              >
                {author.name}
              </Link>
            </div>
          ))}

          {/* Add button */}
          {isOwner && favorites.length < 5 && (
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowPicker(!showPicker)}
                disabled={loading || availableAuthors.length === 0}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-700 hover:border-gray-500 flex items-center justify-center transition disabled:opacity-30">
                  <Plus className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-xs text-gray-600">Add</span>
              </button>

              {showPicker && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 w-56">
                  {availableAuthors.length > 6 && (
                    <div className="p-2 border-b border-gray-700">
                      <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-2.5 py-1.5">
                        <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search…"
                          className="bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none w-full"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
                  <div className="max-h-52 overflow-y-auto">
                    {remaining.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4 px-3">
                        {search ? "No results" : "All authors added"}
                      </p>
                    ) : (
                      remaining.map((author) => (
                        <button
                          key={author.id}
                          onClick={() => addAuthor(author)}
                          disabled={loading}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700 transition text-left first:rounded-t-xl last:rounded-b-xl"
                        >
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-600 shrink-0 bg-gray-800">
                            <Image
                              fill
                              sizes="32px"
                              src={author.imageUrl || AVATAR_PLACEHOLDER}
                              alt={author.name}
                              className="object-cover"
                            />
                          </div>
                          <span className="text-sm text-gray-300 truncate">{author.name}</span>
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

      {isOwner && availableAuthors.length === 0 && favorites.length === 0 && (
        <p className="text-gray-600 text-xs mt-2">
          No authors have been added to the database yet.
        </p>
      )}
    </div>
  );
}
