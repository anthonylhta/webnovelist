// app/settings/import/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download, ShieldX, CheckCircle, AlertCircle } from "lucide-react";

interface ImportSummary {
  total: number;
  novelsCreated: number;
  entriesAdded: number;
  entriesSkipped: number;
  failures: string[];
}

export default function AniListImportPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  const userRole = currentUser?.role;
  if (userRole !== "admin" && userRole !== "moderator") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <ShieldX className="w-16 h-16 text-seal-bright mb-4" />
        <h1 className="text-2xl font-bold mb-2 font-serif text-paper">Access Denied</h1>
        <p className="text-muted mb-6">
          Importing creates catalog entries, so only admins and moderators can run it.
        </p>
        <Link href="/settings" className="bg-gold text-ink hover:bg-gold-bright px-6 py-3 rounded-lg font-semibold transition">
          Back to Settings
        </Link>
      </div>
    );
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSummary(null);
    if (!username.trim()) {
      setError("Enter your AniList username");
      return;
    }
    setImporting(true);
    try {
      const res = await fetch("/api/import/anilist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import failed");
        return;
      }
      setSummary(data);
    } catch {
      setError("Something went wrong");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings" className="flex items-center gap-1.5 text-muted hover:text-paper transition text-sm">
          <ChevronLeft className="w-4 h-4" />
          Settings
        </Link>
        <span className="text-faint">/</span>
        <h1 className="text-2xl font-bold flex items-center gap-2 font-serif text-paper">
          <Download className="w-6 h-6 text-gold" />
          Import from AniList
        </h1>
      </div>

      <div className="bg-surface border border-hairline rounded-xl p-6">
        <p className="text-sm text-muted mb-6">
          Pulls your public AniList manga list — manga, manhwa, manhua, and light novels —
          into your reading list, with statuses, chapter progress, scores, and dates.
          Titles missing from the catalog are added automatically. Entries already on your
          list are left untouched.
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-seal/10 border border-seal/40 text-seal-bright rounded-lg p-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleImport} className="flex gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="AniList username"
            className="flex-1 bg-surface border border-hairline rounded-lg px-4 py-3 text-paper
                       placeholder-faint focus:outline-none focus:border-gold-dim"
          />
          <button
            type="submit"
            disabled={importing}
            className="bg-gold text-ink hover:bg-gold-bright disabled:bg-gold/50 font-semibold px-6 py-3 rounded-lg transition"
          >
            {importing ? "Importing…" : "Import"}
          </button>
        </form>

        {summary && (
          <div className="mt-6 border border-hairline rounded-lg p-4">
            <div className="flex items-center gap-2 text-jade mb-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-paper">
                Imported {summary.entriesAdded} of {summary.total} entries
              </span>
            </div>
            <ul className="text-sm text-muted space-y-1">
              <li>{summary.entriesAdded} added to your reading list</li>
              <li>{summary.entriesSkipped} skipped (already on your list)</li>
              <li>{summary.novelsCreated} new titles added to the catalog</li>
              {summary.failures.length > 0 && (
                <li className="text-seal-bright">
                  {summary.failures.length} failed: {summary.failures.join(", ")}
                </li>
              )}
            </ul>
            <Link href="/list" className="inline-block mt-4 text-gold hover:text-gold-bright transition text-sm font-medium">
              View your list →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
