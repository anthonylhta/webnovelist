"use client";

import { useState } from "react";
import { Plus, X, BookMarked } from "lucide-react";

interface FavoriteAuthorsEditorProps {
  initialFavorites: string[];
  availableAuthors: string[];
  isOwner: boolean;
}

export default function FavoriteAuthorsEditor({
  initialFavorites,
  availableAuthors,
  isOwner,
}: FavoriteAuthorsEditorProps) {
  const [favorites, setFavorites] = useState<string[]>(initialFavorites);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const remaining = availableAuthors.filter((a) => !favorites.includes(a));

  const addAuthor = async (authorName: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorite-authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName }),
      });

      if (res.ok) {
        setFavorites([...favorites, authorName]);
      }
    } catch (error) {
      console.error("Failed to add author:", error);
    } finally {
      setLoading(false);
      setShowPicker(false);
    }
  };

  const removeAuthor = async (authorName: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorite-authors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName }),
      });

      if (res.ok) {
        setFavorites(favorites.filter((a) => a !== authorName));
      }
    } catch (error) {
      console.error("Failed to remove author:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
      <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
        <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
        Favorite Authors
      </h2>

      {favorites.length === 0 && !isOwner ? (
        <p className="text-gray-500 text-sm">No favorite authors yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {favorites.map((author) => (
            <div
              key={author}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-gray-300">{author}</span>
              {isOwner && (
                <button
                  onClick={() => removeAuthor(author)}
                  disabled={loading}
                  className="text-gray-500 hover:text-red-400 transition disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
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
                className="flex items-center gap-1 bg-gray-800 border border-gray-700 border-dashed 
                           rounded-lg px-3 py-2 text-gray-500 hover:text-gray-300 hover:border-gray-600 
                           transition disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-sm">Add</span>
              </button>

              {showPicker && remaining.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg 
                                shadow-xl z-50 max-h-48 overflow-y-auto min-w-[180px]">
                  {remaining.map((author) => (
                    <button
                      key={author}
                      onClick={() => addAuthor(author)}
                      disabled={loading}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 
                                 transition first:rounded-t-lg last:rounded-b-lg"
                    >
                      {author}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isOwner && remaining.length === 0 && favorites.length < 5 && (
        <p className="text-gray-600 text-xs mt-2">
          Add novels to your list to see authors here.
        </p>
      )}
    </div>
  );
}