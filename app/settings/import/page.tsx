// app/settings/import/page.tsx
"use client";

import { useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import type { MalImportSummary } from "@/app/api/import/mal/route";

interface AniListSummary {
  total: number;
  novelsCreated: number;
  entriesAdded: number;
  entriesSkipped: number;
  failures: string[];
}

/** MAL hands out .xml.gz; browsers can inflate it without a library. */
async function readExport(file: File): Promise<string> {
  const gz = file.name.endsWith(".gz") || file.type === "application/gzip" || file.type === "application/x-gzip";
  if (!gz) return file.text();
  if (typeof DecompressionStream === "undefined") {
    throw new Error("This browser can't unzip the file — unzip it first and upload the .xml");
  }
  const stream = file.stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

export default function ImportPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();

  // MyAnimeList (everyone)
  const fileRef = useRef<HTMLInputElement>(null);
  const [malFile, setMalFile] = useState<File | null>(null);
  const [malImporting, setMalImporting] = useState(false);
  const [malError, setMalError] = useState("");
  const [malSummary, setMalSummary] = useState<MalImportSummary | null>(null);

  // AniList (admins/mods — it creates catalog rows)
  const [username, setUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<AniListSummary | null>(null);

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
  const canRunAniList = userRole === "admin" || userRole === "moderator";

  const handleMalImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setMalError("");
    setMalSummary(null);
    if (!malFile) {
      setMalError("Choose your MyAnimeList export first");
      return;
    }
    setMalImporting(true);
    try {
      const xml = await readExport(malFile);
      const res = await fetch("/api/import/mal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xml }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMalError(data.error || "Import failed");
        return;
      }
      setMalSummary(data);
      setMalFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setMalError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setMalImporting(false);
    }
  };

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

  const suggestHref = (title: string) => `/submit?title=${encodeURIComponent(title)}&type=manga`;

  return (
    <FolioSheet
      statusLeft="webnovelist · settings · import"
      statusRight={currentUser?.username}
      footer="ink & gold"
    >
      {/* MyAnimeList — link-only, open to everyone */}
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
          Import from MyAnimeList
        </FolioLabel>
        <p className="font-serif text-[14px] leading-relaxed text-muted">
          Export your manga list from MyAnimeList (Profile → Export → Manga; the file
          is <span className="font-mono text-[12px]">.xml.gz</span>, which is fine as
          is) and drop it here. Entries whose titles are in the catalog join your
          library with status, chapter progress, score, dates and comments. Titles we
          don&apos;t have are listed afterwards so you can suggest them. Entries already
          on your list are left untouched.
        </p>

        {malError && (
          <p className="mt-4 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">
            {malError}
          </p>
        )}

        <form onSubmit={handleMalImport} className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xml,.gz,application/xml,text/xml,application/gzip"
            onChange={(e) => setMalFile(e.target.files?.[0] ?? null)}
            className="max-w-full font-mono text-[11.5px] text-muted file:mr-3 file:rounded-[2px] file:border file:border-hairline file:bg-transparent file:px-3 file:py-1.5 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-gold hover:file:border-gold-dim"
          />
          <button
            type="submit"
            disabled={malImporting || !malFile}
            className="shrink-0 font-mono text-[12px] text-gold transition hover:text-gold-bright disabled:cursor-default disabled:text-faint"
          >
            {malImporting ? "[importing…]" : "[import]"}
          </button>
        </form>
      </div>

      {malSummary && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel right={`${malSummary.entriesAdded} / ${malSummary.total}`}>
            Import complete
          </FolioLabel>
          <div className="space-y-1 font-mono text-[11.5px] tabular-nums">
            <p className="text-jade">{malSummary.entriesAdded} added to your library</p>
            <p className="text-muted">{malSummary.entriesSkipped} skipped (already on your list)</p>
            <p className={malSummary.unmatched.length ? "text-gold-dim" : "text-muted"}>
              {malSummary.unmatched.length} not in the catalog yet
            </p>
          </div>
          {malSummary.unmatched.length > 0 && (
            <div className="mt-3 divide-y divide-hairline border border-hairline">
              {malSummary.unmatched.map((u) => (
                <div key={u.malId} className="flex items-baseline gap-3 px-3 py-1.5">
                  <span className="min-w-0 flex-1 truncate font-serif text-[14px] text-paper">{u.title}</span>
                  {u.chapters !== null && (
                    <span className="shrink-0 font-mono text-[9.5px] text-faint tabular-nums">{u.chapters} ch</span>
                  )}
                  <a
                    href={`https://myanimelist.net/manga/${u.malId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-mono text-[10.5px] text-muted transition hover:text-gold"
                  >
                    [mal]
                  </a>
                  <Link href={suggestHref(u.title)} className="shrink-0 font-mono text-[10.5px] text-gold transition hover:text-gold-bright">
                    [suggest]
                  </Link>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 font-mono text-[12px]">
            <Link href="/list" className="text-gold transition hover:text-gold-bright">
              [view your library →]
            </Link>
          </p>
        </div>
      )}

      {/* AniList — creates catalog rows, so mods only */}
      {canRunAniList && (
        <>
          <div className="border-b border-hairline px-4 py-4">
            <FolioLabel right="admins · mods">Import from AniList</FolioLabel>
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
        </>
      )}

      <FolioNav />
    </FolioSheet>
  );
}
