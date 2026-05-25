"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User, Plus, Edit2, Trash2, BookOpen, X, Check, Upload,
  ChevronLeft, AlertCircle,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

interface AuthorData {
  id: number;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  _count: { novels: number; favorites: number };
}

interface AuthorFormState {
  name: string;
  bio: string;
  imageUrl: string;
}

const EMPTY_FORM: AuthorFormState = { name: "", bio: "", imageUrl: "" };
const AVATAR_PLACEHOLDER = "/default-avatar.svg";

export default function AdminAuthorsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();

  const [authors, setAuthors] = useState<AuthorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form state (create / edit)
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AuthorFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Image upload
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deletingAuthor, setDeletingAuthor] = useState<AuthorData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentRole = currentUser?.role;

  useEffect(() => {
    if (isLoaded && !isSignedIn) { router.push("/sign-in"); return; }
    if (isLoaded && isSignedIn) {
      if (currentRole !== "admin" && currentRole !== "moderator") { router.push("/"); return; }
      fetchAuthors();
    }
  }, [isLoaded, isSignedIn, currentRole, router]);

  const fetchAuthors = async () => {
    try {
      const res = await fetch("/api/authors");
      const data = await res.json();
      if (Array.isArray(data)) setAuthors(data);
    } catch (error) {
      console.error("Failed to fetch authors:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (author: AuthorData) => {
    setEditingId(author.id);
    setForm({ name: author.name, bio: author.bio || "", imageUrl: author.imageUrl || "" });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { setFormError("Please upload an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { setFormError("Image must be under 5MB"); return; }

    setUploading(true);
    setFormError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Name is required"); return; }
    setSaving(true);
    setFormError("");

    try {
      const url = editingId ? `/api/authors/${editingId}` : "/api/authors";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          bio: form.bio.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to save"); return; }

      await fetchAuthors();
      closeForm();
    } catch {
      setFormError("Failed to save author");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAuthor) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/authors/${deletingAuthor.id}`, { method: "DELETE" });
      if (res.ok) {
        setAuthors((prev) => prev.filter((a) => a.id !== deletingAuthor.id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeleteLoading(false);
      setDeletingAuthor(null);
    }
  };

  const filtered = authors.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Admin Panel
        </Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-orange-500" />
          Authors
        </h1>
      </div>

      {/* Stats + action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
            <div className="text-lg font-bold">{authors.length}</div>
            <div className="text-xs text-gray-500">Total Authors</div>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search authors…"
            className="flex-1 sm:w-64 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Author
          </button>
        </div>
      </div>

      {/* Author grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {authors.length === 0 ? "No authors yet. Create one to get started." : "No authors match your search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((author) => (
            <div
              key={author.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-4"
            >
              {/* Avatar */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-700 shrink-0 bg-gray-800">
                <Image
                  fill
                  sizes="56px"
                  src={author.imageUrl || AVATAR_PLACEHOLDER}
                  alt={author.name}
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/author/${author.id}`}
                  className="font-semibold text-white hover:text-orange-400 transition truncate block"
                >
                  {author.name}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {author._count.novels} novel{author._count.novels !== 1 ? "s" : ""}
                  </span>
                </div>
                {author.bio && (
                  <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-snug">
                    {author.bio}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => openEdit(author)}
                  className="p-1.5 text-gray-500 hover:text-blue-400 transition"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingAuthor(author)}
                  className="p-1.5 text-gray-500 hover:text-red-400 transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit form modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Author" : "New Author"}
              </h2>
              <button onClick={closeForm} className="text-gray-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Image */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-700 bg-gray-800 shrink-0">
                    <Image
                      fill
                      sizes="64px"
                      src={form.imageUrl || AVATAR_PLACEHOLDER}
                      alt="Preview"
                      className="object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-xs text-white">...</div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload image
                    </button>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="Or paste image URL"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Er Gen"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="A short biography…"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-800">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving…" : editingId ? "Save Changes" : "Create Author"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deletingAuthor && (
        <ConfirmModal
          title="Delete Author"
          message={`Delete "${deletingAuthor.name}"? This will unlink their novels and remove all user favourites. This cannot be undone.`}
          confirmText="Delete Author"
          cancelText="Cancel"
          danger
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeletingAuthor(null)}
        />
      )}
    </div>
  );
}
