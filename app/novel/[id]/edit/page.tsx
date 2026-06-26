// app/novel/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter, useParams } from "next/navigation";
import { Pencil, ShieldX } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import NovelCharactersManager from "@/components/NovelCharactersManager";


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
    titleChinese: "",
    author: "",
    authorId: null as number | null,
    description: "",
    coverImageUrl: "",
    totalChapters: "",
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
          titleChinese: novel.titleChinese || "",
          author: novel.author || "",
          authorId: novel.authorId ?? null,
          description: novel.description || "",
          coverImageUrl: novel.coverImageUrl || "",
          totalChapters: novel.totalChapters?.toString() || "",
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
          Only admins and moderators can edit novels.
        </p>
        <Link
          href={`/novel/${novelId}`}
          className="bg-gold text-ink hover:bg-gold-bright px-6 py-3 rounded-lg font-semibold transition"
        >
          Back to Novel
        </Link>
      </div>
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
          titleChinese: form.titleChinese.trim() || null,
          author: form.author.trim() || null,
          authorId: form.authorId,
          description: form.description.trim() || null,
          coverImageUrl: form.coverImageUrl.trim() || null,
          totalChapters: form.totalChapters ? parseInt(form.totalChapters) : null,
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 font-serif text-paper">
        <Pencil className="w-8 h-8 text-gold" />
        Edit Novel
      </h1>

      <div className="bg-surface border border-hairline rounded-xl p-6">
        {error && (
          <div className="bg-seal/10 border border-seal/40 text-seal-bright rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm text-muted mb-1">
              Title (English) <span className="text-seal-bright">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                         text-paper focus:outline-none focus:border-gold-dim"
              required
            />
          </div>

          {/* Chinese Title */}
          <div>
            <label className="block text-sm text-muted mb-1">Title (Chinese)</label>
            <input
              type="text"
              value={form.titleChinese}
              onChange={(e) => setForm({ ...form, titleChinese: e.target.value })}
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                         text-muted font-cjk focus:outline-none focus:border-gold-dim"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm text-muted mb-1">Author (display name)</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                         text-paper focus:outline-none focus:border-gold-dim"
            />
          </div>

          {/* Link to Author entity */}
          {allAuthors.length > 0 && (
            <div>
              <label className="block text-sm text-muted mb-1">
                Link to Author page
                <span className="text-faint ml-1">(optional)</span>
              </label>
              <select
                value={form.authorId ?? ""}
                onChange={(e) =>
                  setForm({ ...form, authorId: e.target.value ? parseInt(e.target.value) : null })
                }
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
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
            <label className="block text-sm text-muted mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                         text-paper focus:outline-none focus:border-gold-dim resize-none"
            />
          </div>

          {/* Cover Image URL */}
            {/* Cover Image */}
            <ImageUpload
            currentUrl={form.coverImageUrl}
            onUpload={(url) => setForm({ ...form, coverImageUrl: url })}
            />

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Total Chapters</label>
              <input
                type="number"
                min="0"
                value={form.totalChapters}
                onChange={(e) => setForm({ ...form, totalChapters: e.target.value })}
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                           text-paper focus:outline-none focus:border-gold-dim"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Year Published</label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={form.yearPublished}
                onChange={(e) => setForm({ ...form, yearPublished: e.target.value })}
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                           text-paper focus:outline-none focus:border-gold-dim"
              />
            </div>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Novel Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                           text-paper focus:outline-none focus:border-gold-dim"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Original Source</label>
              <input
                type="text"
                value={form.originalSource}
                onChange={(e) => setForm({ ...form, originalSource: e.target.value })}
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                           text-paper focus:outline-none focus:border-gold-dim"
              />
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm text-muted mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    form.genres.includes(genre)
                      ? "bg-gold text-ink"
                      : "bg-elevated text-muted hover:bg-hairline"
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
            <label className="block text-sm text-muted mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3
                         text-paper focus:outline-none focus:border-gold-dim"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gold text-ink hover:bg-gold-bright disabled:bg-gold/50
                         font-semibold py-3 rounded-lg transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/novel/${novelId}`}
              className="px-6 bg-elevated hover:bg-hairline text-body
                         font-semibold py-3 rounded-lg transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
      <NovelCharactersManager novelId={novelId} />
    </div>
  );
}