// app/list/LibraryList.tsx
"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/time";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import AddToListModal from "@/components/AddToListModal";
import ConfirmModal from "@/components/ConfirmModal";
import QuickChapterUpdate from "@/components/QuickChapterUpdate";
import { FolioSheet, StatusSeal } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import MonthLedgerStrip from "./MonthLedgerStrip";
import type { MonthLedger } from "@/lib/folio";
type ListEntry = {
  id: number;
  userId: string;
  novelId: number;
  status: string;
  rating: number | null;
  currentChapter: number;
  isFavorite: boolean;
  dateStarted: string | null;
  dateFinished: string | null;
  notes: string | null;
  readingUrl: string | null;
  rereadCount: number;
  createdAt: string;
  updatedAt: string;
  novel: {
    id: number;
    title: string;
    nativeTitle: string | null;
    author: string | null;
    coverImageUrl: string | null;
    totalChapters: number | null;
    status: string | null;
    genres: string[];
    tags: string[];
  };
};

const STATUS_TABS = [
  { key: "all", label: "all" },
  { key: "reading", label: "reading" },
  { key: "completed", label: "completed" },
  { key: "on_hold", label: "on hold" },
  { key: "dropped", label: "dropped" },
  { key: "plan_to_read", label: "plan" },
];

type SortKey = "title" | "rating" | "progress" | "updated";
type SortDir = "asc" | "desc";

/** The library sheet: status tabs, the seal-column table, and the month ledger. */
export default function LibraryList({
  ledger,
  monthLabel,
}: {
  ledger: MonthLedger;
  monthLabel: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<ListEntry[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<ListEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<ListEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (isLoaded && isSignedIn) {
      fetchList();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchList = async () => {
    try {
      const res = await fetch("/api/list");
      const data = await res.json();
      if (Array.isArray(data)) {
        setList(data);
      }
    } catch (error) {
      console.error("Failed to fetch list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEntry) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/list/${deletingEntry.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setList(list.filter((e) => e.id !== deletingEntry.id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeleteLoading(false);
      setDeletingEntry(null);
    }
  };

  const handleChapterUpdate = (entryId: number, newChapter: number) => {
    setList(
      list.map((e) =>
        e.id === entryId ? { ...e, currentChapter: newChapter } : e
      )
    );
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "title" ? "asc" : "desc");
    }
  };

  const filteredList =
    activeTab === "all" ? list : list.filter((e) => e.status === activeTab);

  const sortedList = [...filteredList].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;

    switch (sortKey) {
      case "title":
        return dir * a.novel.title.localeCompare(b.novel.title);
      case "rating":
        return dir * ((a.rating || 0) - (b.rating || 0));
      case "progress":
        const aProgress = a.novel.totalChapters
          ? a.currentChapter / a.novel.totalChapters
          : a.currentChapter;
        const bProgress = b.novel.totalChapters
          ? b.currentChapter / b.novel.totalChapters
          : b.currentChapter;
        return dir * (aProgress - bProgress);
      case "updated":
        return dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      default:
        return 0;
    }
  });

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: list.length };
    list.forEach((e) => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return counts;
  };

  const counts = getStatusCounts();

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="font-mono text-xs text-muted">loading the library…</div>
      </div>
    );
  }

  const SortButton = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKeyName)}
      className="flex items-center gap-1 uppercase transition hover:text-gold-bright"
    >
      {label}
      {sortKey === sortKeyName && (
        <ArrowUpDown className="w-2.5 h-2.5 text-gold" />
      )}
    </button>
  );

  const shortDate = (iso: string) => formatDate(iso, { month: "short", day: "numeric" }).toLowerCase();

  return (
    <FolioSheet
      statusLeft="webnovelist · library"
      statusRight={`${list.length} title${list.length !== 1 ? "s" : ""}`}
      footer={`ink & gold · ${list.length} on the shelf`}
    >
      {/* Status tabs */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`transition ${
              activeTab === tab.key
                ? "text-gold"
                : "text-faint hover:text-muted"
            }`}
          >
            {tab.label}
            {counts[tab.key] ? (
              <span className="tabular-nums"> · {counts[tab.key]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {sortedList.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <p className="font-serif text-[15px] text-muted">
            Nothing on this shelf yet.{" "}
            <Link
              href="/browse"
              className="text-gold transition hover:text-gold-bright"
            >
              Browse the catalog
            </Link>{" "}
            to add something.
          </p>
        </div>
      ) : (
        <>
          {/* Sort header */}
          <div className="hidden items-center gap-3 border-b border-hairline px-4 py-2 font-mono text-[9px] tracking-[0.15em] text-muted md:flex">
            <span className="w-5 shrink-0" />
            <span className="min-w-0 flex-1">
              <SortButton label="title" sortKeyName="title" />
            </span>
            <span className="w-44 shrink-0">
              <SortButton label="progress" sortKeyName="progress" />
            </span>
            <span className="w-12 shrink-0">
              <SortButton label="rating" sortKeyName="rating" />
            </span>
            <span className="hidden w-14 shrink-0 lg:block">
              <SortButton label="updated" sortKeyName="updated" />
            </span>
            <span className="w-[76px] shrink-0" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-hairline">
            {sortedList.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                <StatusSeal status={entry.status} />

                {/* Title + native title */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link
                      href={`/novel/${entry.novel.id}`}
                      className="min-w-0 truncate font-serif text-[15px] text-paper transition hover:text-gold"
                    >
                      {entry.novel.title}
                    </Link>
                    {entry.readingUrl && (
                      <a
                        href={entry.readingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-faint transition hover:text-gold"
                        title="Open reading link"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {entry.novel.nativeTitle && (
                    <div className="truncate font-cjk text-[11px] text-faint">
                      {entry.novel.nativeTitle}
                    </div>
                  )}
                </div>

                {/* Progress with quick update */}
                <div className="hidden w-44 shrink-0 md:block">
                  <QuickChapterUpdate
                    entryId={entry.id}
                    currentChapter={entry.currentChapter}
                    totalChapters={entry.novel.totalChapters}
                    onUpdate={(newCh) => handleChapterUpdate(entry.id, newCh)}
                  />
                </div>

                {/* Rating */}
                <div className="w-12 shrink-0 font-mono text-[11px] tabular-nums">
                  {entry.rating ? (
                    <span className="text-body">
                      <span className="text-gold">★</span> {entry.rating}
                    </span>
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </div>

                {/* Last updated */}
                <div className="hidden w-14 shrink-0 text-right font-mono text-[9.5px] text-faint tabular-nums lg:block">
                  {shortDate(entry.updatedAt)}
                </div>

                {/* Actions */}
                <div className="flex w-[76px] shrink-0 items-center justify-end gap-2 font-mono text-[11px]">
                  <button
                    onClick={() => setEditingEntry(entry)}
                    className="text-muted transition hover:text-gold"
                    title="Edit entry"
                  >
                    [edit]
                  </button>
                  <button
                    onClick={() => setDeletingEntry(entry)}
                    className="text-muted transition hover:text-seal-bright"
                    title="Remove from library"
                  >
                    [rm]
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <MonthLedgerStrip ledger={ledger} monthLabel={monthLabel} />

      <FolioNav />

      {/* Edit Modal */}
      {editingEntry && (
        <AddToListModal
          novelId={editingEntry.novel.id}
          novelTitle={editingEntry.novel.title}
          totalChapters={editingEntry.novel.totalChapters}
          existingEntry={{
            id: editingEntry.id,
            status: editingEntry.status,
            rating: editingEntry.rating,
            currentChapter: editingEntry.currentChapter,
            dateStarted: editingEntry.dateStarted,
            dateFinished: editingEntry.dateFinished,
            notes: editingEntry.notes,
            readingUrl: editingEntry.readingUrl,
            rereadCount: editingEntry.rereadCount,
          }}
          onClose={() => setEditingEntry(null)}
          onSuccess={() => {
            setEditingEntry(null);
            fetchList();
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {deletingEntry && (
        <ConfirmModal
          title="Remove Title"
          message={`Are you sure you want to remove "${deletingEntry.novel.title}" from your library? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Keep it"
          danger={true}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeletingEntry(null)}
        />
      )}
    </FolioSheet>
  );
}
