"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { X, Check, Upload, AlertCircle } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

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
        <div className="font-mono text-xs text-muted">opening the author files…</div>
      </div>
    );
  }

  return (
    <FolioSheet
      wide
      statusLeft="webnovelist · curation · authors"
      statusRight={`${authors.length} author${authors.length !== 1 ? "s" : ""}`}
      footer="ink & gold · admin"
    >
      {/* Sections */}
      <div className="flex flex-wrap items-center gap-4 border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
        <Link href="/admin" className="text-faint transition hover:text-muted">
          users
        </Link>
        <Link href="/admin/novels" className="text-faint transition hover:text-muted">
          titles
        </Link>
        <span className="text-gold">authors</span>
        <Link href="/admin/submissions" className="text-faint transition hover:text-muted">
          submissions
        </Link>
        <span className="flex-1" />
        <button onClick={openCreate} className="text-gold transition hover:text-gold-bright">
          [+ new author]
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-2.5">
        <span aria-hidden className="font-mono text-[11px] text-gold-dim">
          /
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="filter authors…"
          className="w-full bg-transparent font-mono text-[12px] text-paper placeholder-faint focus:outline-none"
        />
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <p className="font-serif text-[14.5px] text-muted">
            {authors.length === 0
              ? "No authors on file yet."
              : "Nothing matches the filter."}
          </p>
        </div>
      ) : (
        <div className="border-b border-hairline px-4 pt-3 pb-1.5">
          <FolioLabel right={String(filtered.length)}>Authors</FolioLabel>
          <div className="divide-y divide-hairline">
            {filtered.map((author) => (
              <div key={author.id} className="flex items-center gap-3 py-2.5">
                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-hairline bg-elevated">
                  <Image
                    fill
                    sizes="36px"
                    src={author.imageUrl || AVATAR_PLACEHOLDER}
                    alt={author.name}
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/author/${author.id}`}
                    className="block min-w-0 truncate font-serif text-[14.5px] text-paper transition hover:text-gold"
                  >
                    {author.name}
                  </Link>
                  {author.bio && (
                    <p className="truncate font-mono text-[10px] text-faint">{author.bio}</p>
                  )}
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-[10.5px] text-body tabular-nums">
                  {author._count.novels} title{author._count.novels !== 1 ? "s" : ""}
                </span>
                <div className="flex w-[88px] shrink-0 items-center justify-end gap-2 font-mono text-[11px]">
                  <button
                    onClick={() => openEdit(author)}
                    className="text-muted transition hover:text-gold"
                    title="Edit"
                  >
                    [edit]
                  </button>
                  <button
                    onClick={() => setDeletingAuthor(author)}
                    className="text-muted transition hover:text-seal-bright"
                    title="Delete"
                  >
                    [rm]
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FolioNav />

      {/* Create / Edit form modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-surface border border-hairline rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-hairline">
              <h2 className="text-lg font-semibold font-serif text-paper">
                {editingId ? "Edit Author" : "New Author"}
              </h2>
              <button onClick={closeForm} className="text-faint hover:text-paper transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 bg-seal/10 border border-seal/40 text-seal-bright rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Image */}
              <div>
                <label className="block text-sm text-muted mb-2">Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-hairline bg-elevated shrink-0">
                    <Image
                      fill
                      sizes="64px"
                      src={form.imageUrl || AVATAR_PLACEHOLDER}
                      alt="Preview"
                      className="object-cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-xs text-paper">...</div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 bg-elevated hover:bg-hairline border border-hairline rounded-lg px-3 py-1.5 text-sm text-body transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload image
                    </button>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="Or paste image URL"
                      className="w-full bg-surface border border-hairline rounded-lg px-3 py-1.5 text-sm text-paper placeholder-faint focus:outline-none focus:border-gold-dim"
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
                <label className="block text-sm text-muted mb-1.5">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Er Gen"
                  className="w-full bg-surface border border-hairline rounded-lg px-3 py-2 text-paper text-sm focus:outline-none focus:border-gold-dim"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm text-muted mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="A short biography…"
                  rows={3}
                  className="w-full bg-surface border border-hairline rounded-lg px-3 py-2 text-paper text-sm focus:outline-none focus:border-gold-dim resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-hairline">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm text-muted hover:text-paper transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex items-center gap-2 bg-gold text-ink hover:bg-gold-bright px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
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
    </FolioSheet>
  );
}
