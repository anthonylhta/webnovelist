"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import { Plus, ShieldX, ChevronLeft } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";

const GENRE_OPTIONS = [
  "Xianxia", "Xuanhuan", "Wuxia", "Fantasy", "Sci-Fi", "Romance",
  "Action", "Adventure", "Comedy", "Drama", "Horror", "Mystery",
  "Slice of Life", "Tragedy", "Historical", "Martial Arts",
  "Mecha", "Psychological", "Supernatural", "Kingdom Building",
  "Game", "Sports",
];

export default function AddNovelPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    nativeTitle: "",
    author: "",
    description: "",
    coverImageUrl: "",
    totalChapters: "",
    status: "Ongoing",
    genres: [] as string[],
    tags: "",
    originalSource: "",
    yearPublished: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        <p className="text-muted mb-6">Only admins and moderators can add novels.</p>
        <Link href="/browse" className="bg-gold text-ink hover:bg-gold-bright px-6 py-3 rounded-lg font-semibold transition">
          Browse Novels
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
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/novels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          nativeTitle: form.nativeTitle.trim() || null,
          author: form.author.trim() || null,
          description: form.description.trim() || null,
          coverImageUrl: form.coverImageUrl.trim() || null,
          totalChapters: form.totalChapters ? parseInt(form.totalChapters) : null,
          status: form.status,
          genres: form.genres,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          originalSource: form.originalSource.trim() || null,
          yearPublished: form.yearPublished ? parseInt(form.yearPublished) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add novel"); return; }
      router.push(`/novel/${data.id}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/novels" className="flex items-center gap-1.5 text-muted hover:text-paper transition text-sm">
          <ChevronLeft className="w-4 h-4" />
          Manage Novels
        </Link>
        <span className="text-faint">/</span>
        <h1 className="text-2xl font-bold flex items-center gap-2 font-serif text-paper">
          <Plus className="w-6 h-6 text-gold" />
          Add Novel
        </h1>
      </div>

      <div className="bg-surface border border-hairline rounded-xl p-6">
        {error && (
          <div className="bg-seal/10 border border-seal/40 text-seal-bright rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-muted mb-1">Title (English) <span className="text-seal-bright">*</span></label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Reverend Insanity"
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-gold-dim" required />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Title (Native)</label>
            <input type="text" value={form.nativeTitle} onChange={(e) => setForm({ ...form, nativeTitle: e.target.value })}
              placeholder="e.g., 蛊真人"
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-muted font-cjk focus:outline-none focus:border-gold-dim" />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Author</label>
            <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="e.g., Er Gen"
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-gold-dim" />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4} placeholder="Brief synopsis..."
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-gold-dim resize-none" />
          </div>

          <ImageUpload
            currentUrl={form.coverImageUrl}
            onUpload={(url) => setForm({ ...form, coverImageUrl: url })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Total Chapters</label>
              <input type="number" min="0" value={form.totalChapters} onChange={(e) => setForm({ ...form, totalChapters: e.target.value })}
                placeholder="e.g., 1394"
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-gold-dim" />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Year Published</label>
              <input type="number" min="1990" max="2030" value={form.yearPublished} onChange={(e) => setForm({ ...form, yearPublished: e.target.value })}
                placeholder="e.g., 2018"
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-gold-dim" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-gold-dim">
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Original Source</label>
              <input type="text" value={form.originalSource} onChange={(e) => setForm({ ...form, originalSource: e.target.value })}
                placeholder="e.g., Qidian"
                className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-gold-dim" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <button key={genre} type="button" onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    form.genres.includes(genre) ? "bg-gold text-ink" : "bg-elevated text-muted hover:bg-hairline"
                  }`}>
                  {form.genres.includes(genre) && "✓ "}{genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Tags (comma separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g., Smart MC, Rebirth, Cultivation"
              className="w-full bg-surface border border-hairline rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-gold-dim" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-gold text-ink hover:bg-gold-bright disabled:bg-gold/50 font-semibold py-3 rounded-lg transition mt-2">
            {loading ? "Adding..." : "Add Novel"}
          </button>
        </form>
      </div>
    </div>
  );
}
