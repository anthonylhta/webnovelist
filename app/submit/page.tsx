// app/submit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/time";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import { MEDIA_TYPES, MEDIA_TYPE_LABELS, isMediaType, mediaTypeLabel } from "@/lib/media-types";
import { SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/submissions";

type Submission = {
  id: number;
  title: string;
  nativeTitle: string | null;
  mediaType: string;
  status: SubmissionStatus;
  reviewNote: string | null;
  createdAt: string;
  novel: { id: number; title: string } | null;
};

type Candidate = { id: number; title: string; nativeTitle: string | null; mediaType: string };

const INPUT =
  "w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none";
const LABEL = "mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted";

const STATUS_COLORS: Record<SubmissionStatus, string> = {
  pending: "text-gold-dim",
  approved: "text-jade",
  merged: "text-jade",
  rejected: "text-seal-bright",
};

const EMPTY = { title: "", nativeTitle: "", mediaType: "webnovel", author: "", sourceUrl: "", description: "", note: "" };

export default function SubmitPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
    if (isLoaded && isSignedIn) fetchSubmissions();
  }, [isLoaded, isSignedIn, router]);

  // Arriving from an importer's "not in the catalog" list: ?title=…&type=…
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title");
    const type = params.get("type");
    if (!title && !type) return;
    setForm((prev) => ({
      ...prev,
      title: title ? title.slice(0, 500) : prev.title,
      mediaType: type && isMediaType(type) ? type : prev.mediaType,
    }));
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (Array.isArray(data)) setSubmissions(data);
    } finally {
      setLoading(false);
    }
  };

  // "Already in the catalog?" — look the title up as they type.
  useEffect(() => {
    const q = form.title.trim();
    if (q.length < 3) {
      setCandidates([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/novels?search=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((data: Candidate[]) => setCandidates(Array.isArray(data) ? data.slice(0, 5) : []))
        .catch(() => setCandidates([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [form.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSent(false);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setForm(EMPTY);
      setSent(true);
      fetchSubmissions();
    } catch {
      setError("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (id: number) => {
    const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    if (res.ok) setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const shortDate = (iso: string) => formatDate(iso, { month: "short", day: "numeric" }).toLowerCase();

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="font-mono text-xs text-muted">opening the request desk…</div>
      </div>
    );
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <FolioSheet
      statusLeft="webnovelist · suggest a title"
      statusRight={pendingCount ? `${pendingCount} awaiting review` : undefined}
      footer="ink & gold · the request desk"
    >
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel
          right={
            <Link href="/browse" className="normal-case tracking-normal text-gold transition hover:text-gold-bright">
              [back to catalog]
            </Link>
          }
        >
          Suggest a title
        </FolioLabel>
        <p className="mb-4 font-serif text-[14px] leading-relaxed text-muted">
          Can&apos;t find something? Tell us what it is and where it&apos;s read. A moderator
          checks it and adds it to the catalog — you&apos;ll see the outcome below.
        </p>

        {error && (
          <p className="mb-4 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">{error}</p>
        )}
        {sent && !error && (
          <p className="mb-4 border-l-2 border-jade pl-3 font-mono text-[11px] text-jade">
            sent — it&apos;s in the queue.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL}>
              Title <span className="text-seal-bright">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={INPUT}
              placeholder="as it's usually known in English"
              required
              maxLength={500}
            />
            {candidates.length > 0 && (
              <div className="mt-2 border border-hairline">
                <p className="border-b border-hairline px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gold-dim">
                  Already in the catalog?
                </p>
                <div className="divide-y divide-hairline">
                  {candidates.map((c) => (
                    <Link
                      key={c.id}
                      href={`/novel/${c.id}`}
                      className="flex items-baseline gap-3 px-3 py-1.5 transition hover:bg-elevated"
                    >
                      <span className="min-w-0 flex-1 truncate font-serif text-[14px] text-paper">
                        {c.title}
                        {c.nativeTitle && <span className="ml-2 font-cjk text-[11px] text-faint">{c.nativeTitle}</span>}
                      </span>
                      <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                        {mediaTypeLabel(c.mediaType).toLowerCase()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Native title</label>
              <input
                type="text"
                value={form.nativeTitle}
                onChange={(e) => setForm({ ...form, nativeTitle: e.target.value })}
                className={`${INPUT} font-cjk`}
                placeholder="诡秘之主 · 전지적 독자 시점 · …"
                maxLength={500}
              />
            </div>
            <div>
              <label className={LABEL}>Media type</label>
              <select
                value={form.mediaType}
                onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                className={INPUT}
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>{MEDIA_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className={INPUT}
                maxLength={200}
              />
            </div>
            <div>
              <label className={LABEL}>Where it&apos;s read</label>
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                className={INPUT}
                placeholder="https://… (helps us verify it)"
                maxLength={2000}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Synopsis</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={`${INPUT} resize-none`}
              placeholder="optional — a few lines"
              maxLength={5000}
            />
          </div>

          <div>
            <label className={LABEL}>Note to the moderators</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={INPUT}
              placeholder="optional — anything that helps"
              maxLength={1000}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-[2px] bg-gold py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ink transition hover:bg-gold-bright disabled:bg-gold/50"
          >
            {busy ? "Sending..." : "Send to the desk"}
          </button>
        </form>
      </div>

      {/* Your submissions */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel right={submissions.length ? String(submissions.length) : undefined}>Your requests</FolioLabel>
        {submissions.length === 0 ? (
          <p className="font-serif text-[14px] text-muted">Nothing sent yet.</p>
        ) : (
          <div className="divide-y divide-hairline">
            {submissions.map((s) => (
              <div key={s.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <span className="min-w-0 flex-1 truncate font-serif text-[15px] text-paper">
                    {s.novel ? (
                      <Link href={`/novel/${s.novel.id}`} className="transition hover:text-gold">
                        {s.novel.title}
                      </Link>
                    ) : (
                      s.title
                    )}
                    {s.nativeTitle && <span className="ml-2 font-cjk text-[11px] text-faint">{s.nativeTitle}</span>}
                  </span>
                  <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                    {mediaTypeLabel(s.mediaType).toLowerCase()}
                  </span>
                  <span className={`shrink-0 font-mono text-[10.5px] ${STATUS_COLORS[s.status] ?? "text-muted"}`}>
                    {SUBMISSION_STATUS_LABELS[s.status] ?? s.status}
                  </span>
                  <span className="hidden shrink-0 font-mono text-[9.5px] text-faint tabular-nums sm:block">
                    {shortDate(s.createdAt)}
                  </span>
                  {s.status === "pending" && (
                    <button
                      onClick={() => withdraw(s.id)}
                      className="shrink-0 font-mono text-[11px] text-muted transition hover:text-seal-bright"
                    >
                      [withdraw]
                    </button>
                  )}
                </div>
                {s.reviewNote && (
                  <p className="mt-1 border-l-2 border-hairline pl-3 font-serif text-[13px] text-muted">
                    {s.reviewNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
