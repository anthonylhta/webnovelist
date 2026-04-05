// app/list/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, BookOpen, Edit, Trash2 } from "lucide-react";
import AddToListModal from "@/components/AddToListModal";
import ConfirmModal from "@/components/ConfirmModal";

const STATUS_TABS = [
  { key: "all", label: "All", icon: "📚" },
  { key: "reading", label: "Reading", icon: "📖" },
  { key: "completed", label: "Completed", icon: "✅" },
  { key: "on_hold", label: "On Hold", icon: "⏸️" },
  { key: "dropped", label: "Dropped", icon: "❌" },
  { key: "plan_to_read", label: "Plan to Read", icon: "📋" },
];

export default function ListPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [list, setList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [deletingEntry, setDeletingEntry] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (authStatus === "authenticated") {
      fetchList();
    }
  }, [authStatus]);

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

  const filteredList =
    activeTab === "all" ? list : list.filter((e) => e.status === activeTab);

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: list.length };
    list.forEach((e) => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return counts;
  };

  const counts = getStatusCounts();

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">Loading your list...</div>
      </div>
    );
  }

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
      {filteredList.length === 0 ? (
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
                <th className="text-left p-4">Novel</th>
                <th className="text-left p-4 hidden md:table-cell">Progress</th>
                <th className="text-left p-4">Rating</th>
                <th className="text-left p-4 hidden lg:table-cell">Started</th>
                <th className="text-left p-4 hidden lg:table-cell">Finished</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition"
                >
                  <td className="p-4">
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
                  </td>

                  <td className="p-4 hidden md:table-cell">
                    <div className="text-sm">
                      {entry.currentChapter}
                      {entry.novel.totalChapters
                        ? ` / ${entry.novel.totalChapters}`
                        : ""}
                    </div>
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

                  <td className="p-4 text-sm text-gray-400 hidden lg:table-cell">
                    {entry.dateStarted
                      ? new Date(entry.dateStarted).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="p-4 text-sm text-gray-400 hidden lg:table-cell">
                    {entry.dateFinished
                      ? new Date(entry.dateFinished).toLocaleDateString()
                      : "—"}
                  </td>

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