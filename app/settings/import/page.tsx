// app/settings/import/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

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
        <div className="font-mono text-xs text-muted">loading…</div>
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
      <FolioSheet statusLeft="webnovelist · import" footer="ink & gold">
        <div className="px-4 py-14 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-seal-bright">
            access denied
          </p>
          <p className="mx-auto mt-4 max-w-sm font-serif text-[14.5px] leading-relaxed text-muted">
            Importing creates catalog entries, so only admins and moderators can
            run it.
          </p>
          <p className="mt-5 font-mono text-[12px]">
            <Link href="/settings" className="text-gold transition hover:text-gold-bright">
              [back to settings]
            </Link>
          </p>
        </div>
        <FolioNav />
      </FolioSheet>
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
    <FolioSheet
      statusLeft="webnovelist · settings · import"
      statusRight={currentUser?.username}
      footer="ink & gold"
    >
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel
          right={
            <Link
              href="/settings"
              className="normal-case tracking-normal text-gold transition hover:text-gold-bright"
            >
              [back]
            </Link>
          }
        >
          Import from AniList
        </FolioLabel>
        <p className="font-serif text-[14px] leading-relaxed text-muted">
          Pulls your public AniList manga list — manga, manhwa, manhua, and
          light novels — into your library, with statuses, chapter progress,
          scores, and dates. Titles missing from the catalog are added
          automatically. Entries already on your list are left untouched.
        </p>

        {error && (
          <p className="mt-4 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">
            {error}
          </p>
        )}

        <form onSubmit={handleImport} className="mt-4 flex items-center gap-3">
          <span aria-hidden className="font-mono text-[11px] text-gold-dim">
            /
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="anilist username"
            className="flex-1 border-b border-hairline bg-transparent px-1 py-1.5 font-mono
                       text-[12.5px] text-paper placeholder-faint focus:border-gold-dim focus:outline-none"
          />
          <button
            type="submit"
            disabled={importing}
            className="shrink-0 font-mono text-[12px] text-gold transition hover:text-gold-bright
                       disabled:cursor-default disabled:text-faint"
          >
            {importing ? "[importing…]" : "[import]"}
          </button>
        </form>
      </div>

      {summary && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel right={`${summary.entriesAdded} / ${summary.total}`}>
            Import complete
          </FolioLabel>
          <div className="space-y-1 font-mono text-[11.5px] tabular-nums">
            <p className="text-jade">{summary.entriesAdded} added to your library</p>
            <p className="text-muted">{summary.entriesSkipped} skipped (already on your list)</p>
            <p className="text-muted">{summary.novelsCreated} new titles added to the catalog</p>
            {summary.failures.length > 0 && (
              <p className="text-seal-bright">
                {summary.failures.length} failed: {summary.failures.join(", ")}
              </p>
            )}
          </div>
          <p className="mt-3 font-mono text-[12px]">
            <Link href="/list" className="text-gold transition hover:text-gold-bright">
              [view your library →]
            </Link>
          </p>
        </div>
      )}

      <FolioNav />
    </FolioSheet>
  );
}
