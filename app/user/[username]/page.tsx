import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Star, TrendingUp,
  Calendar, Crown, ShieldCheck, Heart,
  BookMarked,
} from "lucide-react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import CopyLinkButton from "@/components/CopyLinkButton";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import BannerColorPicker from "@/components/BannerColorPicker";
import FavoriteAuthorsEditor from "@/components/FavoriteAuthorsEditor";
import { getBannerGradient } from "@/lib/banner-colors";
import FavoriteCharactersEditor from "@/components/FavoriteCharactersEditor";


export const dynamic = "force-dynamic";

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

  if (!user) return { title: "User Not Found — WebNovelist" };

  return {
    title: `${user.username}'s Profile — WebNovelist`,
    description: `Check out ${user.username}'s webnovel reading list on WebNovelist.`,
  };
}

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
      bannerColor: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  const me = await getCurrentUser();
  const isOwner = me?.id === user.id;

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const [list, activities] = await Promise.all([
    prisma.userNovelList.findMany({
      where: { userId: user.id },
      include: { novel: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.activity.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: oneYearAgo },
      },
      select: { createdAt: true, type: true, detail: true, novelId: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Fetch novel covers for activity feed
  const activityNovelIds = [
    ...new Set(
      activities
        .map((a) => a.novelId)
        .filter((id): id is number => id !== null)
    ),
  ];
  const activityNovels = await prisma.novel.findMany({
    where: { id: { in: activityNovelIds } },
    select: { id: true, coverImageUrl: true },
  });
  const novelCovers: Record<number, string | null> = {};
  activityNovels.forEach((n) => {
    novelCovers[n.id] = n.coverImageUrl;
  });

  // Favorite novels
  const favoriteNovels = list
    .filter((entry) => entry.isFavorite)
    .slice(0, 5)
    .map((entry) => entry.novel);

  // Favorite authors
  const favoriteAuthors = await prisma.userFavoriteAuthor.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  const favoriteAuthorNames = favoriteAuthors.map((a) => a.authorName);

  const availableAuthors = [
    ...new Set(
      list
        .map((entry) => entry.novel.author)
        .filter((a): a is string => a !== null && a !== undefined && a.trim() !== "")
    ),
  ].sort();

  // Favorite characters
  const userFavoriteCharacters = await prisma.userFavoriteCharacter.findMany({
    where: { userId: user.id },
    include: {
      character: {
        include: { novel: { select: { id: true, title: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  const favoriteChars = userFavoriteCharacters.map((f) => ({
    id: f.character.id,
    name: f.character.name,
    role: f.character.role,
    imageUrl: f.character.imageUrl,
    novel: f.character.novel,
  }));

  // Available characters (from novels in user's list)
  const userNovelIds = list.map((entry) => entry.novelId);
  const availableCharactersRaw = await prisma.character.findMany({
    where: { novelId: { in: userNovelIds } },
    include: { novel: { select: { id: true, title: true } } },
    orderBy: [{ novel: { title: "asc" } }, { name: "asc" }],
  });
  const availableCharacters = availableCharactersRaw.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    imageUrl: c.imageUrl,
    novel: c.novel,
  }));

  // Stats
  const totalNovels = list.length;
  const totalChaptersRead = list.reduce((sum, e) => sum + e.currentChapter, 0);
  const ratedNovels = list.filter((e) => e.rating !== null);
  const meanScore =
    ratedNovels.length > 0
      ? (ratedNovels.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedNovels.length).toFixed(1)
      : "—";

  // Genre breakdown
  const genreCounts: Record<string, number> = {};
  list.forEach((entry) => {
    entry.novel.genres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const maxGenreCount = sortedGenres.length > 0 ? sortedGenres[0][1] : 0;

  // Recent activities
  const recentActivities = activities.slice(0, 25);

  const bannerCoverUrls = favoriteNovels
    .map((n) => n.coverImageUrl)
    .filter((url): url is string => !!url)
    .slice(0, 4);

  const getRoleIcon = () => {
    switch (user.role) {
      case "admin": return <Crown className="w-4 h-4 text-red-400" />;
      case "moderator": return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case "admin": return "bg-red-500/20 text-red-400 border border-red-500/50";
      case "moderator": return "bg-blue-500/20 text-blue-400 border border-blue-500/50";
      default: return "";
    }
  };

  return (
    <div className="max-w-6xl mx-auto -mt-8 -mx-4 sm:mx-auto">
      {/* ===== BANNER + PROFILE HEADER ===== */}
      <div className="relative mb-16 sm:mb-20">
        {/* Banner */}
        <div className="relative h-32 sm:h-44 overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
          {/* Blurred favorite covers */}
          {bannerCoverUrls.length > 0 ? (
            <div className="absolute inset-0 flex">
              {bannerCoverUrls.map((url, i) => (
                <div key={i} className="relative flex-1">
                  <Image
                    fill
                    sizes="25vw"
                    src={url}
                    alt=""
                    aria-hidden="true"
                    className="object-cover blur-2xl scale-125 opacity-70"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-r ${getBannerGradient(user.bannerColor)}`} />
          )}
          {/* Color tint overlay — still lets the color picker do something */}
          {bannerCoverUrls.length > 0 && (
            <div className={`absolute inset-0 bg-gradient-to-r ${getBannerGradient(user.bannerColor)} mix-blend-color`} />
          )}
          {/* Bottom fade into page background */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />
          <BannerColorPicker currentColor={user.bannerColor} isOwner={!!isOwner} />
        </div>

        {/* Profile Info — overlaps banner */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-5">
            {/* Avatar */}
            <ProfileImageUpload
              type="avatar"
              currentUrl={user.avatarUrl}
              isOwner={!!isOwner}
              username={user.username}
            >
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gray-800 border-4 border-gray-950 rounded-full flex items-center justify-center text-2xl sm:text-4xl font-bold shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  <Image
                    fill
                    src={user.avatarUrl}
                    alt={user.username}
                    className="rounded-full object-cover"
                  />
                ) : (
                  user.username[0].toUpperCase()
                )}
              </div>
            </ProfileImageUpload>

            {/* Name + Meta */}
            <div className="flex-1 text-center sm:text-left pb-0 sm:pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">{user.username}</h1>
                {user.role !== "user" && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getRoleBadge()}`}>
                    {getRoleIcon()}
                    {user.role}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 text-xs sm:text-sm mt-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Share Button */}
            <div className="hidden sm:block pb-2">
              <CopyLinkButton username={user.username} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Share Button */}
      <div className="sm:hidden flex justify-center mb-6 px-4">
        <CopyLinkButton username={user.username} />
      </div>

      {/* ===== TWO COLUMN LAYOUT ===== */}
      <div className="px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:w-[55%] space-y-6">

            {/* Heatmap */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 overflow-x-auto scrollbar-hide">
              <ActivityHeatmap activities={activities} />
            </div>

            {/* Genre Overview */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Genre Overview</h2>
              {sortedGenres.length === 0 ? (
                <p className="text-gray-500 text-sm">No genre data yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {sortedGenres.slice(0, 10).map(([genre, count]) => (
                    <div key={genre} className="flex items-center gap-3">
                      <span className="w-20 sm:w-24 text-xs sm:text-sm text-gray-400 truncate shrink-0">
                        {genre}
                      </span>
                      <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-blue-500/70 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxGenreCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-xs sm:text-sm text-gray-500 text-right shrink-0">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Novels */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                Favorite Novels
              </h2>
              {favoriteNovels.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {isOwner ? "Add favorites from any novel page." : "No favorite novels yet."}
                </p>
              ) : (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                  {favoriteNovels.map((novel) => (
                    <Link
                      key={novel.id}
                      href={`/novel/${novel.id}`}
                      className="shrink-0 w-20 sm:w-24 group"
                    >
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-700 group-hover:border-pink-500/50 transition">
                        <Image
                          fill
                          src={novel.coverImageUrl || "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"}
                          alt={novel.title}
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate group-hover:text-pink-400 transition">
                        {novel.title}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Characters */}
            <FavoriteCharactersEditor
              initialFavorites={favoriteChars}
              availableCharacters={availableCharacters}
              isOwner={!!isOwner}
            />

            {/* Favorite Authors */}
            <FavoriteAuthorsEditor
              initialFavorites={favoriteAuthorNames}
              availableAuthors={availableAuthors}
              isOwner={!!isOwner}
            />
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="lg:w-[45%] space-y-6">

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-3">
              <MiniStat
                icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />}
                label="Total Novels"
                value={totalNovels.toString()}
              />
              <MiniStat
                icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />}
                label="Chapters Read"
                value={totalChaptersRead.toLocaleString()}
              />
              <MiniStat
                icon={<Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />}
                label="Mean Score"
                value={meanScore}
              />
            </div>

            {/* Activity Feed */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 lg:sticky lg:top-24">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Activity</h2>

              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No activity yet.</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-[600px] overflow-y-auto scrollbar-hide">
                  {recentActivities.map((activity, i) => {
                    const prevActivity = recentActivities[i - 1];
                    const currentDate = new Date(activity.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    const prevDate = prevActivity
                      ? new Date(prevActivity.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : null;
                    const showDateHeader = currentDate !== prevDate;

                    return (
                      <div key={i}>
                        {showDateHeader && (
                          <div className="text-xs text-gray-500 font-medium pt-3 pb-1 first:pt-0">
                            {currentDate}
                          </div>
                        )}

                        <div className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-gray-800/50 transition">
                          <div className="mt-0.5 shrink-0">
                            {activity.novelId && novelCovers[activity.novelId] ? (
                              <Image
                                src={novelCovers[activity.novelId]!}
                                alt=""
                                width={36}
                                height={48}
                                className="rounded object-cover"
                              />
                            ) : (
                              <>
                                {activity.type === "chapter_update" && (
                                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                                  </div>
                                )}
                                {activity.type === "status_change" && (
                                  <div className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <BookMarked className="w-3.5 h-3.5 text-green-400" />
                                  </div>
                                )}
                                {activity.type === "rating" && (
                                  <div className="w-7 h-7 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                    <Star className="w-3.5 h-3.5 text-yellow-400" />
                                  </div>
                                )}
                                {activity.type === "add" && (
                                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                                  </div>
                                )}
                                {activity.type === "remove" && (
                                  <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <span className="text-red-400 text-xs">✕</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 leading-snug">
                              {activity.detail}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {new Date(activity.createdAt).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-4 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-lg sm:text-xl font-bold">{value}</div>
      <div className="text-[10px] sm:text-xs text-gray-500">{label}</div>
    </div>
  );
}