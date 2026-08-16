"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/components/CurrentUserProvider";
import { safeImageSrc } from "@/lib/image-hosts";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import AdminSections from "@/components/AdminSections";

interface NovelData {
  id: number;
  title: string;
  nativeTitle: string | null;
  author: string | null;
  coverImageUrl: string | null;
  status: string | null;
  totalChapters: number | null;
  genres: string[];
}

const STATUS_COLORS: Record<string, string> = {
  Ongoing: "text-gold",
  Completed: "text-jade",
  Hiatus: "text-muted",
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
        <div className="font-mono text-xs text-muted">opening the catalog…</div>
      </div>
    );
  }

  const statusCounts = novels.reduce<Record<string, number>>((acc, n) => {
    const s = n.status || "Unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <FolioSheet
      wide
      statusLeft="webnovelist · curation · titles"
      statusRight={`${novels.length} title${novels.length !== 1 ? "s" : ""}`}
      footer="ink & gold · admin"
    >
      <AdminSections active="titles" />

      {/* Counts + search */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-hairline px-4 py-2 font-mono text-[10px] tabular-nums">
        <span className="text-muted">total · {novels.length}</span>
        {Object.entries(statusCounts).map(([status, count]) => (
          <span key={status} className={STATUS_COLORS[status] ?? "text-faint"}>
            {status.toLowerCase()} · {count}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-2.5">
        <span aria-hidden className="font-mono text-[11px] text-gold-dim">
          /
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="filter by title or author…"
          className="w-full bg-transparent font-mono text-[12px] text-paper placeholder-faint focus:outline-none"
        />
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <p className="font-serif text-[14.5px] text-muted">
            {novels.length === 0 ? "The catalog is empty." : "Nothing matches the filter."}
          </p>
        </div>
      ) : (
        <div className="border-b border-hairline px-4 pt-3 pb-1.5">
          <FolioLabel right={String(filtered.length)}>Titles</FolioLabel>
          <div className="divide-y divide-hairline">
            {filtered.map((novel) => (
              <div key={novel.id} className="flex items-center gap-3 py-2.5">
                <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-[2px] border border-hairline bg-elevated">
                  <Image
                    fill
                    sizes="36px"
                    src={safeImageSrc(novel.coverImageUrl, "/default-cover.svg")}
                    alt={novel.title}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/novel/${novel.id}`}
                    className="block min-w-0 truncate font-serif text-[14.5px] text-paper transition hover:text-gold"
                  >
                    {novel.title}
                  </Link>
                  <p className="truncate font-mono text-[10px] text-faint">
                    {novel.author ?? ""}
                    {novel.author && novel.totalChapters ? " · " : ""}
                    {novel.totalChapters ? `${novel.totalChapters.toLocaleString()} ch` : ""}
                  </p>
                </div>
                <span
                  className={`hidden w-20 shrink-0 text-right font-mono text-[9.5px] uppercase tracking-[0.12em] sm:block ${
                    STATUS_COLORS[novel.status ?? ""] ?? "text-faint"
                  }`}
                >
                  {novel.status?.toLowerCase() ?? ""}
                </span>
                <div className="flex w-[88px] shrink-0 items-center justify-end gap-2 font-mono text-[11px]">
                  <Link
                    href={`/novel/${novel.id}/edit`}
                    className="text-muted transition hover:text-gold"
                    title="Edit"
                  >
                    [edit]
                  </Link>
                  <button
                    onClick={() => setDeletingNovel(novel)}
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
    </FolioSheet>
  );
}
