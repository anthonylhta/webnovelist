// app/user/[username]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Star, TrendingUp, CheckCircle, Clock,
  XCircle, Pause, BookMarked, Calendar, Crown,
  ShieldCheck, User, Share2, ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";
import CopyLinkButton from "@/components/CopyLinkButton";



// Dynamic metadata for SEO / link previews
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true },
  });

  if (!user) {
    return { title: "User Not Found — WebNovelist" };
  }

  return {
    title: `${user.username}'s Profile — WebNovelist`,
    description: `Check out ${user.username}'s webnovel reading list on WebNovelist.`,
  };
}

const STATUS_CONFIG = [
  { key: "reading", label: "Reading", icon: BookMarked, color: "text-green-500", bg: "bg-green-500/10 border-green-500/30" },
  { key: "completed", label: "Completed", icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { key: "on_hold", label: "On Hold", icon: Pause, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30" },
  { key: "dropped", label: "Dropped", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
  { key: "plan_to_read", label: "Plan to Read", icon: Clock, color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30" },
];

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      novelList: {
        include: {
          novel: true,
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const list = user.novelList;

  // Stats
  const totalNovels = list.length;
  const readingCount = list.filter((e) => e.status === "reading").length;
  const completedCount = list.filter((e) => e.status === "completed").length;
  const onHoldCount = list.filter((e) => e.status === "on_hold").length;
  const droppedCount = list.filter((e) => e.status === "dropped").length;
  const planToReadCount = list.filter((e) => e.status === "plan_to_read").length;

  const ratedNovels = list.filter((e) => e.rating !== null);
  const averageRating =
    ratedNovels.length > 0
      ? (ratedNovels.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedNovels.length).toFixed(1)
      : "—";

  const totalChaptersRead = list.reduce((sum, e) => sum + e.currentChapter, 0);

  const getRoleIcon = () => {
    switch (user.role) {
      case "admin":
        return <Crown className="w-5 h-5 text-red-400" />;
      case "moderator":
        return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      default:
        return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border border-red-500/50";
      case "moderator":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/50";
    }
  };

  // Group list by status
  const listByStatus = STATUS_CONFIG.map((status) => ({
    ...status,
    entries: list.filter((e) => e.status === status.key),
  })).filter((group) => group.entries.length > 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-3xl shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.username[0].toUpperCase()
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getRoleBadge()}`}
              >
                {getRoleIcon()}
                {user.role}
              </span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {/* Share Button */}
          <CopyLinkButton username={user.username} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Total Novels"
          value={totalNovels.toString()}
          color="text-blue-500"
        />
        <StatCard
          icon={<Star className="w-5 h-5 fill-yellow-500" />}
          label="Avg Rating"
          value={averageRating}
          color="text-yellow-500"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Chapters Read"
          value={totalChaptersRead.toLocaleString()}
          color="text-blue-500"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Completed"
          value={completedCount.toString()}
          color="text-emerald-500"
        />
      </div>

      {/* Status Breakdown Bar */}
      {totalNovels > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-4 mb-3 text-sm flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              Reading {readingCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Completed {completedCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              On Hold {onHoldCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              Dropped {droppedCount}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-500" />
              Plan to Read {planToReadCount}
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-800">
            {readingCount > 0 && (
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(readingCount / totalNovels) * 100}%` }}
              />
            )}
            {completedCount > 0 && (
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(completedCount / totalNovels) * 100}%` }}
              />
            )}
            {onHoldCount > 0 && (
              <div
                className="bg-yellow-500 h-full"
                style={{ width: `${(onHoldCount / totalNovels) * 100}%` }}
              />
            )}
            {droppedCount > 0 && (
              <div
                className="bg-red-500 h-full"
                style={{ width: `${(droppedCount / totalNovels) * 100}%` }}
              />
            )}
            {planToReadCount > 0 && (
              <div
                className="bg-gray-500 h-full"
                style={{ width: `${(planToReadCount / totalNovels) * 100}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* Novel Lists by Status */}
      {totalNovels === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {user.username} hasn&apos;t added any novels yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {listByStatus.map((group) => {
            const StatusIcon = group.icon;
            return (
              <div key={group.key}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${group.color}`} />
                  {group.label}
                  <span className="text-gray-500 text-sm font-normal">
                    ({group.entries.length})
                  </span>
                </h2>

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-sm">
                        <th className="text-left p-4">Novel</th>
                        <th className="text-left p-4 hidden md:table-cell">Progress</th>
                        <th className="text-left p-4">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((entry) => (
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
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {entry.currentChapter}
                                {entry.novel.totalChapters
                                  ? ` / ${entry.novel.totalChapters}`
                                  : ""}
                              </span>
                              {entry.novel.totalChapters && (
                                <div className="w-20 bg-gray-700 rounded-full h-1.5">
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
                            </div>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
      <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}