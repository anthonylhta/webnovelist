// app/list/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star, BookOpen, Edit, Trash2,
  ArrowUpDown, ExternalLink,
} from "lucide-react";
import AddToListModal from "@/components/AddToListModal";
import ConfirmModal from "@/components/ConfirmModal";
import QuickChapterUpdate from "@/components/QuickChapterUpdate";
import type { UserNovelList, Novel } from "@prisma/client";

type ListEntry = UserNovelList & { novel: Novel };

const STATUS_TABS = [
  { key: "all", label: "All", icon: "📚" },
  { key: "reading", label: "Reading", icon: "📖" },
  { key: "completed", label: "Completed", icon: "✅" },
  { key: "on_hold", label: "On Hold", icon: "⏸️" },
  { key: "dropped", label: "Dropped", icon: "❌" },
  { key: "plan_to_read", label: "Plan to Read", icon: "📋" },
];

type SortKey = "title" | "rating" | "progress" | "updated";
type SortDir = "asc" | "desc";

export default function ListPage() {
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
  }, [isLoaded, isSignedIn]);

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
        <div className="text-gray-400">Loading your list...</div>
      </div>
    );
  }

  const SortButton = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKeyName)}
      className="flex items-center gap-1 hover:text-blue-400 transition"
    >
      {label}
      {sortKey === sortKeyName && (
        <ArrowUpDown className="w-3 h-3 text-blue-400" />
      )}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My List</h1>
        <div className="text-gray-400">
          {list.length} novel{list.length !== 1 ? "s" : ""} total
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2
              ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {counts[tab.key] ? (
              <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {counts[tab.key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* List */}
      {sortedList.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No novels in this category</p>
          <Link
            href="/browse"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition"
          >
            Browse Novels
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="text-left p-4">
                  <SortButton label="Novel" sortKeyName="title" />
                </th>
                <th className="text-left p-4 hidden md:table-cell">
                  <SortButton label="Progress" sortKeyName="progress" />
                </th>
                <th className="text-left p-4">
                  <SortButton label="Rating" sortKeyName="rating" />
                </th>
                <th className="text-left p-4 hidden lg:table-cell">
                  <SortButton label="Updated" sortKeyName="updated" />
                </th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                >
                  {/* Novel Title */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/novel/${entry.novel.id}`}
                        className="hover:text-blue-400 transition"
                      >
                        <div className="font-medium">{entry.novel.title}</div>
                        {entry.novel.titleChinese && (
                          <div className="text-gray-500 text-sm">
                            {entry.novel.titleChinese}
                          </div>
                        )}
                      </Link>
                      {entry.readingUrl && (
                        <a
                          href={entry.readingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-blue-400 transition"
                          title="Open reading link"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Progress with Quick Update */}
                  <td className="p-4 hidden md:table-cell">
                    <QuickChapterUpdate
                      entryId={entry.id}
                      currentChapter={entry.currentChapter}
                      totalChapters={entry.novel.totalChapters}
                      onUpdate={(newCh) => handleChapterUpdate(entry.id, newCh)}
                    />
                    {entry.novel.totalChapters && (
                      <div className="w-24 bg-gray-700 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-500 rounded-full h-1.5"
                          style={{
                            width: `${Math.min(
                              (entry.currentChapter / entry.novel.totalChapters) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="p-4">
                    {entry.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{entry.rating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>

                  {/* Last Updated */}
                  <td className="p-4 text-sm text-gray-400 hidden lg:table-cell">
                    {new Date(entry.updatedAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingEntry(entry)}
                        className="p-2 text-gray-400 hover:text-red-400 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          title="Remove Novel"
          message={`Are you sure you want to remove "${deletingEntry.novel.title}" from your list? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Keep it"
          danger={true}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeletingEntry(null)}
        />
      )}
    </div>
  );
}