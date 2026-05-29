"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { safeImageSrc } from "@/lib/image-hosts";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen, Plus, Pencil, Trash2, ChevronLeft,
  CheckCircle, Clock, PauseCircle,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

interface NovelData {
  id: number;
  title: string;
  titleChinese: string | null;
  author: string | null;
  coverImageUrl: string | null;
  status: string | null;
  totalChapters: number | null;
  genres: string[];
}

const STATUS_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  Ongoing:   { label: "Ongoing",   className: "text-green-400 bg-green-600/10 border-green-600/30",  icon: <Clock className="w-3 h-3" /> },
  Completed: { label: "Completed", className: "text-blue-400 bg-blue-600/10 border-blue-600/30",    icon: <CheckCircle className="w-3 h-3" /> },
  Hiatus:    { label: "Hiatus",    className: "text-yellow-400 bg-yellow-600/10 border-yellow-600/30", icon: <PauseCircle className="w-3 h-3" /> },
};

export default function AdminNovelsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useCurrentUser();
  const router = useRouter();

  const [novels, setNovels] = useState<NovelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingNovel, setDeletingNovel] = useState<NovelData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentRole = currentUser?.role;

  useEffect(() => {
    if (isLoaded && !isSignedIn) { router.push("/sign-in"); return; }
    if (isLoaded && isSignedIn) {
      if (currentRole !== "admin" && currentRole !== "moderator") { router.push("/"); return; }
      fetchNovels();
    }
  }, [isLoaded, isSignedIn, currentRole, router]);

  const fetchNovels = async () => {
    try {
      const res = await fetch("/api/novels");
      const data = await res.json();
      if (Array.isArray(data)) setNovels(data);
    } catch (error) {
      console.error("Failed to fetch novels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingNovel) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/novels/${deletingNovel.id}`, { method: "DELETE" });
      if (res.ok) {
        setNovels((prev) => prev.filter((n) => n.id !== deletingNovel.id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setDeleteLoading(false);
      setDeletingNovel(null);
    }
  };

  const filtered = novels.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.author?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const statusCounts = novels.reduce<Record<string, number>>((acc, n) => {
    const s = n.status || "Unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm">
          <ChevronLeft className="w-4 h-4" />
          Admin Panel
        </Link>
        <span className="text-gray-700">/</span>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Novels
        </h1>
      </div>

      {/* Stats + action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
            <div className="text-lg font-bold">{novels.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          {Object.entries(statusCounts).map(([status, count]) => {
            const s = STATUS_STYLES[status];
            return (
              <div key={status} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-center">
                <div className="text-lg font-bold">{count}</div>
                <div className={`text-xs ${s?.className.split(" ")[0] ?? "text-gray-500"}`}>{status}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search novels or authors…"
            className="flex-1 sm:w-72 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <Link
            href="/admin/novels/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Novel
          </Link>
        </div>
      </div>

      {/* Novel list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {novels.length === 0 ? "No novels yet." : "No novels match your search."}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {filtered.map((novel, i) => {
            const status = STATUS_STYLES[novel.status ?? ""] ?? STATUS_STYLES.Ongoing;
            return (
              <div
                key={novel.id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-800/40 transition ${
                  i !== filtered.length - 1 ? "border-b border-gray-800/60" : ""
                }`}
              >
                {/* Cover */}
                <div className="relative w-9 h-12 rounded overflow-hidden shrink-0 border border-gray-700 bg-gray-800">
                  <Image
                    fill
                    sizes="36px"
                    src={safeImageSrc(novel.coverImageUrl, "/default-cover.svg")}
                    alt={novel.title}
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/novel/${novel.id}`} className="font-medium text-gray-100 hover:text-blue-400 transition truncate block text-sm">
                    {novel.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {novel.author && (
                      <span className="text-xs text-gray-500 truncate">{novel.author}</span>
                    )}
                    {novel.totalChapters && (
                      <span className="text-xs text-gray-600">{novel.totalChapters.toLocaleString()} ch</span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <span className={`hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${status.className}`}>
                  {status.icon}
                  {novel.status}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/novel/${novel.id}/edit`}
                    className="p-1.5 text-gray-500 hover:text-blue-400 transition"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeletingNovel(novel)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deletingNovel && (
        <ConfirmModal
          title="Delete Novel"
          message={`Delete "${deletingNovel.title}"? This will remove it from all user lists and cannot be undone.`}
          confirmText="Delete Novel"
          cancelText="Cancel"
          danger
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeletingNovel(null)}
        />
      )}
    </div>
  );
}
