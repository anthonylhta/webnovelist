// app/novel/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter, useParams } from "next/navigation";
import { MEDIA_TYPES, MEDIA_TYPE_LABELS } from "@/lib/media-types";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import NovelCharactersManager from "@/components/NovelCharactersManager";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";


const GENRE_OPTIONS = [
  "Xianxia", "Xuanhuan", "Wuxia", "Fantasy", "Sci-Fi", "Romance",
  "Action", "Adventure", "Comedy", "Drama", "Horror", "Mystery",
  "Slice of Life", "Tragedy", "Historical", "Martial Arts",
  "Mecha", "Psychological", "Supernatural", "Kingdom Building",
  "Game", "Sports",
];

export default function EditNovelPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const novelId = params.id as string;

  const [form, setForm] = useState({
    title: "",
    nativeTitle: "",
    mediaType: "webnovel",
    author: "",
    authorId: null as number | null,
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [allAuthors, setAllAuthors] = useState<{ id: number; name: string }[]>([]);

  // Fetch the novel data and author list
  useEffect(() => {
    Promise.all([
      fetch(`/api/novels/${novelId}`).then((r) => r.json()),
      fetch("/api/authors").then((r) => r.json()),
    ])
      .then(([novel, authors]) => {
        setForm({
          title: novel.title || "",
          nativeTitle: novel.nativeTitle || "",
          mediaType: novel.mediaType || "webnovel",
          author: novel.author || "",
          authorId: novel.authorId ?? null,
          description: novel.description || "",
          coverImageUrl: novel.coverImageUrl || "",
          totalChapters: novel.totalChapters?.toString() || "",
          latestChapter: novel.latestChapter?.toString() || "",
          status: novel.status || "Ongoing",
          genres: novel.genres || [],
          tags: novel.tags?.join(", ") || "",
          originalSource: novel.originalSource || "",
          yearPublished: novel.yearPublished?.toString() || "",
        });
        if (Array.isArray(authors)) setAllAuthors(authors);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load novel");
        setLoading(false);
      });
  }, [novelId]);

  if (!isLoaded || loading) {
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
            Only admins and moderators can edit titles.
          </p>
          <p className="mt-5 font-mono text-[12px]">
            <Link href={`/novel/${novelId}`} className="text-gold transition hover:text-gold-bright">
              [back to the title]
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

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/novels/${novelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          nativeTitle: form.nativeTitle.trim() || null,
          mediaType: form.mediaType,
          author: form.author.trim() || null,
          authorId: form.authorId,
          description: form.description.trim() || null,
          coverImageUrl: form.coverImageUrl.trim() || null,
          totalChapters: form.totalChapters ? parseInt(form.totalChapters) : null,
          latestChapter: form.latestChapter ? parseInt(form.latestChapter) : null,
          status: form.status,
          genres: form.genres,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          originalSource: form.originalSource.trim() || null,
          yearPublished: form.yearPublished ? parseInt(form.yearPublished) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update novel");
        return;
      }

      router.push(`/novel/${novelId}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FolioSheet statusLeft="webnovelist · curation · edit title" footer="ink & gold · admin">
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel
          right={
            <Link
              href={`/novel/${novelId}`}
              className="normal-case tracking-normal text-gold transition hover:text-gold-bright"
            >
              [view title]
            </Link>
          }
        >
          Edit title
        </FolioLabel>
        {error && (
          <p className="mb-4 border-l-2 border-seal pl-3 font-mono text-[11px] text-seal-bright">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
              Title (English) <span className="text-seal-bright">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                         text-paper focus:outline-none focus:border-gold-dim"
              required
            />
          </div>

          {/* Native Title */}
          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Title (Native)</label>
            <input
              type="text"
              value={form.nativeTitle}
              onChange={(e) => setForm({ ...form, nativeTitle: e.target.value })}
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                         text-muted font-cjk focus:outline-none focus:border-gold-dim"
            />
          </div>

          {/* Author */}
          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Author (display name)</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                         text-paper focus:outline-none focus:border-gold-dim"
            />
          </div>

          {/* Link to Author entity */}
          {allAuthors.length > 0 && (
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
                Link to Author page
                <span className="text-faint ml-1">(optional)</span>
              </label>
              <select
                value={form.authorId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, authorId: e.target.value ? parseInt(e.target.value) : null })
                }
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                           text-paper focus:outline-none focus:border-gold-dim"
              >
                <option value="">— None —</option>
                {allAuthors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                         text-paper focus:outline-none focus:border-gold-dim resize-none"
            />
          </div>

          {/* Cover Image URL */}
            {/* Cover Image */}
            <ImageUpload
            currentUrl={form.coverImageUrl}
            onUpload={(url) => setForm({ ...form, coverImageUrl: url })}
            />

          {/* Three columns */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Total Chapters</label>
              <input
                type="number"
                min="0"
                value={form.totalChapters}
                onChange={(e) => setForm({ ...form, totalChapters: e.target.value })}
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                           text-paper focus:outline-none focus:border-gold-dim"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Latest Released</label>
              <input
                type="number"
                min="0"
                value={form.latestChapter}
                onChange={(e) => setForm({ ...form, latestChapter: e.target.value })}
                placeholder="ongoing only"
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                           text-paper focus:outline-none focus:border-gold-dim"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Year Published</label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={form.yearPublished}
                onChange={(e) => setForm({ ...form, yearPublished: e.target.value })}
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                           text-paper focus:outline-none focus:border-gold-dim"
              />
            </div>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Media Type</label>
              <select
                value={form.mediaType}
                onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                           text-paper focus:outline-none focus:border-gold-dim"
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>{MEDIA_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Novel Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                           text-paper focus:outline-none focus:border-gold-dim"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Original Source</label>
            <input
              type="text"
              value={form.originalSource}
              onChange={(e) => setForm({ ...form, originalSource: e.target.value })}
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                         text-paper focus:outline-none focus:border-gold-dim"
            />
          </div>

          {/* Genres */}
          <div>
            <label className="mb-2 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`rounded-[2px] border px-2.5 py-1 font-mono text-[10.5px] transition ${
                    form.genres.includes(genre)
                      ? "border-gold text-gold"
                      : "border-hairline text-muted hover:border-gold-dim"
                  }`}
                >
                  {form.genres.includes(genre) && "✓ "}
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full rounded-[2px] border border-hairline bg-transparent px-3 py-2 text-[13.5px]
                         text-paper focus:outline-none focus:border-gold-dim"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-[2px] bg-gold py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ink transition hover:bg-gold-bright disabled:bg-gold/50"
            >
              {saving ? "saving…" : "save changes"}
            </button>
            <Link
              href={`/novel/${novelId}`}
              className="rounded-[2px] border border-hairline px-6 py-2.5 text-center font-mono text-[12px] uppercase tracking-[0.14em] text-muted transition hover:border-gold-dim hover:text-gold"
            >
              cancel
            </Link>
          </div>
        </form>
      </div>
      <div className="border-b border-hairline px-4 py-4">
        <NovelCharactersManager novelId={novelId} />
      </div>
      <FolioNav />
    </FolioSheet>
  );
}