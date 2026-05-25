// app/novel/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter, useParams } from "next/navigation";
import { Pencil, ShieldX } from "lucide-react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";


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

  // Fetch the novel data
  useEffect(() => {
    fetch(`/api/novels/${novelId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Novel not found");
        return res.json();
      })
      .then((novel) => {
        setForm({
          title: novel.title || "",
          titleChinese: novel.titleChinese || "",
          author: novel.author || "",
          description: novel.description || "",
          coverImageUrl: novel.coverImageUrl || "",
          totalChapters: novel.totalChapters?.toString() || "",
          status: novel.status || "Ongoing",
          genres: novel.genres || [],
          tags: novel.tags?.join(", ") || "",
          originalSource: novel.originalSource || "",
          yearPublished: novel.yearPublished?.toString() || "",
        });
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
        <div className="text-gray-400">Loading...</div>
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
        <ShieldX className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6">
          Only admins and moderators can edit novels.
        </p>
        <Link
          href={`/novel/${novelId}`}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
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
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Pencil className="w-8 h-8 text-blue-500" />
        Edit Novel
      </h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Title (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                         text-gray-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Chinese Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title (Chinese)</label>
            <input
              type="text"
              value={form.titleChinese}
              onChange={(e) => setForm({ ...form, titleChinese: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                         text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Author</label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                         text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                         text-gray-100 focus:outline-none focus:border-blue-500 resize-none"
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
              <label className="block text-sm text-gray-400 mb-1">Total Chapters</label>
              <input
                type="number"
                min="0"
                value={form.totalChapters}
                onChange={(e) => setForm({ ...form, totalChapters: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                           text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Year Published</label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={form.yearPublished}
                onChange={(e) => setForm({ ...form, yearPublished: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                           text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Novel Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                           text-gray-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Original Source</label>
              <input
                type="text"
                value={form.originalSource}
                onChange={(e) => setForm({ ...form, originalSource: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                           text-gray-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    form.genres.includes(genre)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
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
            <label className="block text-sm text-gray-400 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3
                         text-gray-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50
                         text-white font-semibold py-3 rounded-lg transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/novel/${novelId}`}
              className="px-6 bg-gray-800 hover:bg-gray-700 text-gray-300
                         font-semibold py-3 rounded-lg transition text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}