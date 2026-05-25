"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface FavoriteAuthorButtonProps {
  authorId: number;
  initialFavorited: boolean;
}

export default function FavoriteAuthorButton({
  authorId,
  initialFavorited,
}: FavoriteAuthorButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/favorite-authors", {
        method: favorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }

      setFavorited(!favorited);
    } catch {
      setError("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition border
          ${
            favorited
              ? "bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border-pink-600/50"
              : "bg-gray-800 hover:bg-gray-700 text-gray-400 border-gray-700"
          }
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Heart className={`w-4 h-4 ${favorited ? "fill-pink-400" : ""}`} />
        {favorited ? "Favourited" : "Add to Favourites"}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
