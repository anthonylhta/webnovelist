// app/admin/submissions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/time";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { FolioSheet } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import AdminSections from "@/components/AdminSections";
import { mediaTypeLabel } from "@/lib/media-types";
import { SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/submissions";

type Submission = {
  id: number;
  title: string;
  nativeTitle: string | null;
  mediaType: string;
  author: string | null;
  sourceUrl: string | null;
  description: string | null;
  note: string | null;
  status: SubmissionStatus;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: { username: string };
  novel: { id: number; title: string } | null;
};

type Candidate = { id: number; title: string; nativeTitle: string | null; mediaType: string };

const INPUT =
  "w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none";
const VERB = "font-mono text-[11px] transition";

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: "text-gold-dim",
  approved: "text-jade",
  merged: "text-jade",
  rejected: "text-seal-bright",
};

export default function AdminSubmissionsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "resolved">("pending");
  const [rows, setRows] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // One inline action open at a time: which row, and which action.
  const [open, setOpen] = useState<{ id: number; action: "merge" | "reject" } | null>(null);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [busy, setBusy] = useState(false);

  const currentRole = currentUser?.role;

  useEffect(() => {
    if (isLoaded && !isSignedIn) { router.push("/sign-in"); return; }
    if (isLoaded && isSignedIn) {
      if (currentRole !== "admin" && currentRole !== "moderator") { router.push("/"); return; }
      fetchRows(tab);
    }
  }, [isLoaded, isSignedIn, currentRole, router, tab]);

  const fetchRows = async (which: "pending" | "resolved") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/submissions?scope=queue&status=${which}`);
      const data = await res.json();
      if (Array.isArray(data)) setRows(data);
    } catch {
      setError("Failed to load the queue");
    } finally {
      setLoading(false);
    }
  };

  // Catalog lookup for "merge into…"
  useEffect(() => {
    if (!open || open.action !== "merge" || query.trim().length < 2) {
      setCandidates([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/novels?search=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data: Candidate[]) => setCandidates(Array.isArray(data) ? data.slice(0, 6) : []))
        .catch(() => setCandidates([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open]);

  const startAction = (row: Submission, action: "merge" | "reject") => {
    setOpen({ id: row.id, action });
    setNote("");
    setQuery(action === "merge" ? row.title : "");
    setError("");
  };

  const resolve = async (id: number, body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
      setOpen(null);
    } catch {
      setError("Failed");
    } finally {
      setBusy(false);
    }
  };

  const shortDate = (iso: string) => formatDate(iso, { month: "short", day: "numeric" }).toLowerCase();

  if (!isLoaded || (loading && rows.length === 0 && !error)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="font-mono text-xs text-muted">opening the request desk…</div>
      </div>
    );
  }

  return (
    <FolioSheet
      wide
      statusLeft="webnovelist · curation · submissions"
      statusRight={tab === "pending" ? `${rows.length} waiting` : `${rows.length} resolved`}
      footer="ink & gold · admin"
    >
      <AdminSections active="submissions" />

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-hairline px-4 py-2 font-mono text-[11px]">
        {(["pending", "resolved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setOpen(null); }}
            className={`transition ${tab === t ? "text-gold" : "text-faint hover:text-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <p className="border-b border-hairline px-4 py-2 font-mono text-[11px] text-seal-bright">{error}</p>
      )}

      {rows.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <p className="font-serif text-[15px] text-muted">
            {tab === "pending" ? "The desk is clear." : "Nothing reviewed yet."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-hairline">
          {rows.map((s) => (
            <div key={s.id} className="px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="min-w-0 flex-1 truncate font-serif text-[15.5px] text-paper">
                  {s.title}
                  {s.nativeTitle && <span className="ml-2 font-cjk text-[11px] text-faint">{s.nativeTitle}</span>}
                </span>
                <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                  {mediaTypeLabel(s.mediaType).toLowerCase()}
                </span>
                <span className="shrink-0 font-mono text-[9.5px] text-faint tabular-nums">
                  by {s.user.username} · {shortDate(s.createdAt)}
                </span>
                {tab === "resolved" && (
                  <span className={`shrink-0 font-mono text-[10.5px] ${STATUS_COLORS[s.status]}`}>
                    {SUBMISSION_STATUS_LABELS[s.status]}
                    {s.novel && (
                      <>
                        {" → "}
                        <Link href={`/novel/${s.novel.id}`} className="text-gold transition hover:text-gold-bright">
                          {s.novel.title}
                        </Link>
                      </>
                    )}
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted">
                {s.author && <span>{s.author}</span>}
                {s.author && s.sourceUrl && " · "}
                {s.sourceUrl && (
                  <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gold-dim transition hover:text-gold">
                    {s.sourceUrl.replace(/^https?:\/\//, "").slice(0, 60)}
                  </a>
                )}
              </p>
              {s.description && (
                <p className="mt-1 line-clamp-2 font-serif text-[13px] text-body">{s.description}</p>
              )}
              {s.note && (
                <p className="mt-1 border-l-2 border-hairline pl-3 font-serif text-[13px] italic text-muted">{s.note}</p>
              )}
              {s.reviewNote && (
                <p className="mt-1 border-l-2 border-gold-dim/50 pl-3 font-serif text-[13px] text-muted">{s.reviewNote}</p>
              )}

              {tab === "pending" && (
                <div className="mt-2 flex flex-wrap items-center gap-4 font-mono text-[11px]">
                  <Link
                    href={`/admin/novels/new?submission=${s.id}`}
                    className="text-gold transition hover:text-gold-bright"
                  >
                    [approve → editor]
                  </Link>
                  <button onClick={() => startAction(s, "merge")} className={`${VERB} text-muted hover:text-gold`}>
                    [merge into…]
                  </button>
                  <button onClick={() => startAction(s, "reject")} className={`${VERB} text-muted hover:text-seal-bright`}>
                    [reject]
                  </button>
                </div>
              )}

              {open?.id === s.id && open.action === "merge" && (
                <div className="mt-3 space-y-2 border border-gold-dim/40 p-3">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold-dim">Merge into an existing title</p>
                  <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className={INPUT} placeholder="search the catalog…" autoFocus />
                  {candidates.length > 0 && (
                    <div className="divide-y divide-hairline border border-hairline">
                      {candidates.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          disabled={busy}
                          onClick={() => resolve(s.id, { action: "merge", novelId: c.id, note: note || undefined })}
                          className="flex w-full items-baseline gap-3 px-3 py-1.5 text-left transition hover:bg-elevated disabled:opacity-50"
                        >
                          <span className="min-w-0 flex-1 truncate font-serif text-[14px] text-paper">
                            {c.title}
                            {c.nativeTitle && <span className="ml-2 font-cjk text-[11px] text-faint">{c.nativeTitle}</span>}
                          </span>
                          <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                            {mediaTypeLabel(c.mediaType).toLowerCase()}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-gold">[merge]</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={INPUT} placeholder="note to the reader (optional)" maxLength={1000} />
                  <button type="button" onClick={() => setOpen(null)} className={`${VERB} text-muted hover:text-paper`}>[cancel]</button>
                </div>
              )}

              {open?.id === s.id && open.action === "reject" && (
                <div className="mt-3 space-y-2 border border-seal/40 p-3">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-seal-bright">Reject</p>
                  <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={INPUT} placeholder="why? — the reader sees this (optional)" maxLength={1000} autoFocus />
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => resolve(s.id, { action: "reject", note: note || undefined })}
                      className="rounded-[2px] bg-seal px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-paper transition hover:bg-seal-bright disabled:bg-seal/50"
                    >
                      {busy ? "Rejecting..." : "Reject"}
                    </button>
                    <button type="button" onClick={() => setOpen(null)} className={`${VERB} text-muted hover:text-paper`}>[cancel]</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <FolioNav />
    </FolioSheet>
  );
}
