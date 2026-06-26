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
import { safeImageSrc } from "@/lib/image-hosts";
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

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Batch 1 — everything that depends only on user.id (or nothing). One round trip.
  const [me, list, activities, favoriteAuthorRows, userFavoriteCharacters] =
    await Promise.all([
      getCurrentUser(),
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
      prisma.userFavoriteAuthor.findMany({
        where: { userId: user.id },
        include: { author: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.userFavoriteCharacter.findMany({
        where: { userId: user.id },
        include: {
          character: {
            include: { novel: { select: { id: true, title: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  const isOwner = me?.id === user.id;

  const activityNovelIds = [
    ...new Set(
      activities
        .map((a) => a.novelId)
        .filter((id): id is number => id !== null)
    ),
  ];

  // Batch 2 — depends on batch-1 results. The full-table author/character lists
  // only feed the owner's editor dropdowns, so visitors skip those scans entirely.
  const [activityNovels, allAuthors, availableCharactersRaw] = await Promise.all([
    prisma.novel.findMany({
      where: { id: { in: activityNovelIds } },
      select: { id: true, coverImageUrl: true },
    }),
    isOwner
      ? prisma.author.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, imageUrl: true },
        })
      : Promise.resolve([] as { id: number; name: string; imageUrl: string | null }[]),
    isOwner
      ? prisma.character.findMany({
          include: { novel: { select: { id: true, title: true } } },
          orderBy: [{ novel: { title: "asc" } }, { name: "asc" }],
        })
      : Promise.resolve(
          [] as Awaited<
            ReturnType<
              typeof prisma.character.findMany<{
                include: { novel: { select: { id: true; title: true } } };
              }>
            >
          >
        ),
  ]);

  const novelCovers: Record<number, string | null> = {};
  activityNovels.forEach((n) => {
    novelCovers[n.id] = n.coverImageUrl;
  });

  // Favorite novels
  const favoriteNovels = list
    .filter((entry) => entry.isFavorite)
    .slice(0, 5)
    .map((entry) => entry.novel);

  const favoriteAuthors = favoriteAuthorRows.map((r) => ({
    id: r.author.id,
    name: r.author.name,
    imageUrl: r.author.imageUrl,
  }));

  const favoriteChars = userFavoriteCharacters.map((f) => ({
    id: f.character.id,
    name: f.character.name,
    role: f.character.role,
    imageUrl: f.character.imageUrl,
    novel: f.character.novel,
  }));

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
      case "admin": return <Crown className="w-4 h-4 text-seal-bright" />;
      case "moderator": return <ShieldCheck className="w-4 h-4 text-gold" />;
      default: return null;
    }
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case "admin": return "bg-seal/20 text-seal-bright border border-seal/50";
      case "moderator": return "bg-gold/20 text-gold border border-gold/50";
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
                    sizes="200px"
                    src={url}
                    alt=""
                    aria-hidden="true"
                    priority={i === 0}
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
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
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-elevated border-4 border-ink rounded-full flex items-center justify-center text-2xl sm:text-4xl font-bold shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  <Image
                    fill
                    sizes="112px"
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
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-paper">{user.username}</h1>
                {user.role !== "user" && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getRoleBadge()}`}>
                    {getRoleIcon()}
                    {user.role}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-faint text-xs sm:text-sm mt-1">
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
            <div className="bg-surface border border-hairline rounded-xl p-3 sm:p-4 overflow-x-auto scrollbar-hide">
              <ActivityHeatmap activities={activities} />
            </div>

            {/* Genre Overview */}
            <div className="bg-surface border border-hairline rounded-xl p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-4 font-serif text-paper">Genre Overview</h2>
              {sortedGenres.length === 0 ? (
                <p className="text-faint text-sm">No genre data yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {sortedGenres.slice(0, 10).map(([genre, count]) => (
                    <div key={genre} className="flex items-center gap-3">
                      <span className="w-20 sm:w-24 text-xs sm:text-sm text-muted truncate shrink-0">
                        {genre}
                      </span>
                      <div className="flex-1 bg-elevated rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gold/70 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxGenreCount) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-xs sm:text-sm text-faint text-right shrink-0">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Novels */}
            <div className="bg-surface border border-hairline rounded-xl p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2 font-serif text-paper">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                Favorite Novels
              </h2>
              {favoriteNovels.length === 0 ? (
                <p className="text-faint text-sm">
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
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-hairline group-hover:border-gold/50 transition">
                        <Image
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          src={safeImageSrc(novel.coverImageUrl, "/default-cover.svg")}
                          alt={novel.title}
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted mt-1 truncate group-hover:text-gold transition">
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

            {/* Favourite Authors */}
            <FavoriteAuthorsEditor
              initialFavorites={favoriteAuthors}
              availableAuthors={allAuthors}
              isOwner={!!isOwner}
            />
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="lg:w-[45%] space-y-6">

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-3">
              <MiniStat
                icon={<BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />}
                label="Total Novels"
                value={totalNovels.toString()}
              />
              <MiniStat
                icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-jade" />}
                label="Chapters Read"
                value={totalChaptersRead.toLocaleString()}
              />
              <MiniStat
                icon={<Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold fill-gold" />}
                label="Mean Score"
                value={meanScore}
              />
            </div>

            {/* Activity Feed */}
            <div className="bg-surface border border-hairline rounded-xl p-4 sm:p-5 lg:sticky lg:top-24">
              <h2 className="text-base sm:text-lg font-semibold mb-4 font-serif text-paper">Activity</h2>

              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-faint mx-auto mb-2" />
                  <p className="text-faint text-sm">No activity yet.</p>
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
                          <div className="text-xs text-faint font-medium pt-3 pb-1 first:pt-0">
                            {currentDate}
                          </div>
                        )}

                        <div className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-elevated/50 transition">
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
                                  <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5 text-gold" />
                                  </div>
                                )}
                                {activity.type === "status_change" && (
                                  <div className="w-7 h-7 rounded-full bg-jade/10 flex items-center justify-center">
                                    <BookMarked className="w-3.5 h-3.5 text-jade" />
                                  </div>
                                )}
                                {activity.type === "rating" && (
                                  <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center">
                                    <Star className="w-3.5 h-3.5 text-gold" />
                                  </div>
                                )}
                                {activity.type === "add" && (
                                  <div className="w-7 h-7 rounded-full bg-jade/10 flex items-center justify-center">
                                    <BookOpen className="w-3.5 h-3.5 text-jade" />
                                  </div>
                                )}
                                {activity.type === "remove" && (
                                  <div className="w-7 h-7 rounded-full bg-seal/10 flex items-center justify-center">
                                    <span className="text-seal-bright text-xs">✕</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-body leading-snug">
                              {activity.detail}
                            </p>
                            <p className="text-xs text-faint mt-0.5">
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
    <div className="bg-surface border border-hairline rounded-xl p-3 sm:p-4 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-lg sm:text-xl font-bold">{value}</div>
      <div className="text-[10px] sm:text-xs text-faint">{label}</div>
    </div>
  );
}