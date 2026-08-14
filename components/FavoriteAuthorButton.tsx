"use client";

import { useState } from "react";

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
        title={favorited ? "Remove from favourites" : "Add to favourites"}
        className={`font-mono text-[11px] transition disabled:opacity-50 ${
          favorited ? "text-seal hover:text-seal-bright" : "text-muted hover:text-seal-bright"
        }`}
      >
        {favorited ? "[♥ favourited]" : "[♡ favourite]"}
      </button>
      {error && <p className="mt-1 font-mono text-[10px] text-seal-bright">{error}</p>}
    </div>
  );
}
