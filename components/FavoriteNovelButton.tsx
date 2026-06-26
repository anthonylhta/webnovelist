"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { Heart } from "lucide-react";

interface FavoriteNovelButtonProps {
  novelId: number;
}

export default function FavoriteNovelButton({ novelId }: FavoriteNovelButtonProps) {
  const currentUser = useCurrentUser();
  const [entryId, setEntryId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    fetch("/api/list")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const entry = data.find((e: { novelId: number }) => e.novelId === novelId);
          if (entry) {
            setEntryId(entry.id);
            setIsFavorite(entry.isFavorite || false);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser, novelId]);

  const toggleFavorite = async () => {
    if (!entryId || toggling) return;
    setToggling(true);
    setError("");

    try {
      const res = await fetch(`/api/list/${entryId}/favorite`, {
        method: "PUT",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }

      const data = await res.json();
      setIsFavorite(data.isFavorite);
    } catch {
      setError("Failed to update");
    } finally {
      setToggling(false);
    }
  };

  if (loading || !currentUser || entryId === null) return null;

  return (
    <div>
      <button
        onClick={toggleFavorite}
        disabled={toggling}
        className={`w-full font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 border
          ${
            isFavorite
              ? "bg-seal/20 hover:bg-seal/30 text-seal border-seal/40"
              : "bg-elevated hover:bg-hairline text-muted hover:text-gold border-hairline"
          }
          ${toggling ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-seal" : ""}`} />
        {isFavorite ? "Favorited" : "Add to Favorites"}
      </button>
      {error && <p className="text-seal-bright text-xs mt-1 text-center">{error}</p>}
    </div>
  );
}