"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import ImageUpload from "@/components/ImageUpload";
import { MEDIA_TYPES, MEDIA_TYPE_LABELS } from "@/lib/media-types";

const GENRE_OPTIONS = [
  "Xianxia", "Xuanhuan", "Wuxia", "Fantasy", "Sci-Fi", "Romance",
  "Action", "Adventure", "Comedy", "Drama", "Horror", "Mystery",
  "Slice of Life", "Tragedy", "Historical", "Martial Arts",
  "Mecha", "Psychological", "Supernatural", "Kingdom Building",
  "Game", "Sports",
];

/** "novelupdates.com" from a source link — a sensible default for Original Source. */
function hostOf(url: unknown): string {
  if (typeof url !== "string" || !url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function AddNovelPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    nativeTitle: "",
    mediaType: "webnovel",
    author: "",
    description: "",
    coverImageUrl: "",
    totalChapters: "",
    latestChapter: "",
    status: "Ongoing",
    genres: [] as string[],
    tags: "",
    originalSource: "",
    yearPublished: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Approving a reader's submission: ?submission=ID prefills the form and the
  // submission is marked approved once the title exists.
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [submittedBy, setSubmittedBy] = useState<string | null>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("submission");
    const id = raw ? parseInt(raw) : NaN;
    if (!Number.isInteger(id)) return;
    fetch(`/api/submissions/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((sub) => {
        if (!sub || sub.status !== "pending") return;
        setSubmissionId(sub.id);
        setSubmittedBy(sub.user?.username ?? null);
        setForm((prev) => ({
          ...prev,
          title: sub.title ?? "",
          nativeTitle: sub.nativeTitle ?? "",
          mediaType: sub.mediaType ?? prev.mediaType,
          author: sub.author ?? "",
          description: sub.description ?? "",
          originalSource: hostOf(sub.sourceUrl) || prev.originalSource,
        }));
      })
      .catch(() => {});
  }, []);

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
      <FolioSheet statusLeft="webnovelist · curation" footer="ink & gold">
        <div className="px-4 py-14 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-seal-bright">
            access denied
          </p>
          <p className="mx-auto mt-4 max-w-sm font-serif text-[14.5px] leading-relaxed text-muted">
            Only admins and moderators can add titles.
          </p>
          <p className="mt-5 font-mono text-[12px]">
            <Link href="/browse" className="text-gold transition hover:text-gold-bright">
              [browse the catalog]
            </Link>
          </p>
        </div>
        <FolioNav />
      </FolioSheet>
    );
  }

  const toggleGenre = (genre: string) => {
    setForm((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          nativeTitle: form.nativeTitle.trim() || null,
          mediaType: form.mediaType,
          author: form.author.trim() || null,
          description: form.description.trim() || null,
          coverImageUrl: form.coverImageUrl.trim() || null,
          totalChapters: form.totalChapters ? parseInt(form.totalChapters) : null,
          latestChapter: form.latestChapter ? parseInt(form.latestChapter) : null,
          status: form.status,
          genres: form.genres,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          originalSource: form.originalSource.trim() || null,
          yearPublished: form.yearPublished ? parseInt(form.yearPublished) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add novel"); return; }
      if (submissionId !== null) {
        await fetch(`/api/submissions/${submissionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve", novelId: data.id }),
        });
        router.push("/admin/submissions");
        return;
      }
      router.push(`/novel/${data.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FolioSheet statusLeft="webnovelist · curation · new title" footer="ink & gold · admin">
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel
          right={
            <Link
              href="/admin/novels"
              className="normal-case tracking-normal text-gold transition hover:text-gold-bright"
            >
              [back to titles]
            </Link>
          }
        >
          Add a title
        </FolioLabel>
        {submissionId !== null && (
          <p className="mb-4 border-l-2 border-gold-dim pl-3 font-mono text-[11px] text-gold-dim">
            approving submission #{submissionId}
            {submittedBy ? ` from ${submittedBy}` : ""} — saving marks it approved
          </p>
        )}
        {error && (
          <p className="mb-4 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Title (English) <span className="text-seal-bright">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Reverend Insanity"
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none" required />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Title (Native)</label>
            <input type="text" value={form.nativeTitle} onChange={(e) => setForm({ ...form, nativeTitle: e.target.value })}
              placeholder="e.g., 蛊真人"
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 font-cjk text-[13.5px] text-muted focus:border-gold-dim focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Author</label>
            <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="e.g., Er Gen"
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} placeholder="Brief synopsis..."
              className="w-full resize-none rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none" />
          </div>

          <ImageUpload
            currentUrl={form.coverImageUrl}
            onUpload={(url) => setForm({ ...form, coverImageUrl: url })}
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Total Chapters</label>
              <input type="number" min="0" value={form.totalChapters} onChange={(e) => setForm({ ...form, totalChapters: e.target.value })}
                placeholder="e.g., 1394"
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Latest Released</label>
              <input type="number" min="0" value={form.latestChapter} onChange={(e) => setForm({ ...form, latestChapter: e.target.value })}
                placeholder="ongoing only"
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Year Published</label>
              <input type="number" min="1990" max="2030" value={form.yearPublished} onChange={(e) => setForm({ ...form, yearPublished: e.target.value })}
                placeholder="e.g., 2018"
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Media Type</label>
              <select value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none">
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>{MEDIA_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none">
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Original Source</label>
            <input type="text" value={form.originalSource} onChange={(e) => setForm({ ...form, originalSource: e.target.value })}
              placeholder="e.g., Qidian"
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none" />
          </div>

          <div>
            <label className="mb-2 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <button key={genre} type="button" onClick={() => toggleGenre(genre)}
                  className={`rounded-[2px] border px-2.5 py-1 font-mono text-[10.5px] transition ${
                    form.genres.includes(genre)
                      ? "border-gold text-gold"
                      : "border-hairline text-muted hover:border-gold-dim"
                  }`}>
                  {form.genres.includes(genre) && "✓ "}{genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g., Smart MC, Rebirth, Cultivation"
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px] text-paper focus:border-gold-dim focus:outline-none" />
          </div>

          <button type="submit" disabled={loading}
            className="mt-2 w-full rounded-[2px] bg-gold py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ink transition hover:bg-gold-bright disabled:bg-gold/50">
            {loading ? "adding…" : "add title"}
          </button>
        </form>
      </div>
      <FolioNav />
    </FolioSheet>
  );
}
