"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface FavoriteCharacterButtonProps {
  characterId: number;
  initialFavorited: boolean;
}

export default function FavoriteCharacterButton({
  characterId,
  initialFavorited,
}: FavoriteCharacterButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/favorite-characters", {
        method: favorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId }),
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
              ? "bg-seal/20 hover:bg-seal/30 text-seal border-seal/40"
              : "bg-elevated hover:bg-hairline text-muted hover:text-gold border-hairline"
          }
          ${loading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Heart className={`w-4 h-4 ${favorited ? "fill-seal" : ""}`} />
        {favorited ? "Favourited" : "Add to Favourites"}
      </button>
      {error && <p className="text-seal-bright text-xs mt-1">{error}</p>}
    </div>
  );
}
