import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import CopyLinkButton from "@/components/CopyLinkButton";
import FollowButton from "@/components/FollowButton";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import BannerColorPicker from "@/components/BannerColorPicker";
import FavoriteAuthorsEditor from "@/components/FavoriteAuthorsEditor";
import { getBannerGradient } from "@/lib/banner-colors";
import FavoriteCharactersEditor from "@/components/FavoriteCharactersEditor";
import NovelCard from "@/components/NovelCard";
import { FolioSheet, FolioLabel, LedgerBar } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

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
    description: `Check out ${user.username}'s reading list on WebNovelist.`,
  };
}

const ROLE_COLORS: Record<string, string> = {
  admin: "text-seal-bright",
  moderator: "text-gold",
};

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

  const readerSelect = { id: true, username: true, avatarUrl: true } as const;

  // Batch 1 — everything that depends only on user.id (or nothing). One round trip.
  const [
    me,
    list,
    activities,
    favoriteAuthorRows,
    userFavoriteCharacters,
    followerRows,
    followingRows,
    followerCount,
    followingCount,
  ] =
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
      prisma.follow.findMany({
        where: { followingId: user.id },
        select: { follower: { select: readerSelect } },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
      prisma.follow.findMany({
        where: { followerId: user.id },
        select: { following: { select: readerSelect } },
        orderBy: { createdAt: "desc" },
        take: 24,
      }),
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
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
  const [activityNovels, allAuthors, availableCharactersRaw, myFollowEdge] = await Promise.all([
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
    me && !isOwner
      ? prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const followers = followerRows.map((r) => r.follower);
  const following = followingRows.map((r) => r.following);

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

  const joined = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <FolioSheet
      wide
      statusLeft={`webnovelist · readers · ${user.username}`}
      statusRight={`${totalNovels} title${totalNovels !== 1 ? "s" : ""}`}
      footer={`ink & gold · reading since ${joined.toLowerCase()}`}
    >
      {/* The reader's banner color survives as the nameplate's accent strip */}
      <div
        aria-hidden
        className={`h-1.5 bg-gradient-to-r ${getBannerGradient(user.bannerColor)}`}
      />

      {/* Nameplate */}
      <div className="relative flex items-center gap-5 border-b border-hairline px-4 py-6">
        <ProfileImageUpload
          type="avatar"
          currentUrl={user.avatarUrl}
          isOwner={!!isOwner}
          username={user.username}
        >
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-hairline bg-elevated font-serif text-2xl text-paper">
            {user.avatarUrl ? (
              <Image
                fill
                sizes="64px"
                src={user.avatarUrl}
                alt={user.username}
                className="rounded-full object-cover"
              />
            ) : (
              user.username[0].toUpperCase()
            )}
          </div>
        </ProfileImageUpload>

        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold-dim">
            Reader
            {user.role !== "user" && (
              <span className={`ml-2 ${ROLE_COLORS[user.role] ?? ""}`}>· {user.role}</span>
            )}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-paper sm:text-[26px]">
            {user.username}
          </h1>
          <p className="mt-1.5 font-mono text-[10px] text-faint tabular-nums">
            joined {joined.toLowerCase()} · {followerCount} follower{followerCount !== 1 ? "s" : ""} ·{" "}
            {followingCount} following
          </p>
        </div>

        <FollowButton username={user.username} initialFollowing={myFollowEdge !== null} />
        <CopyLinkButton username={user.username} />
        <BannerColorPicker currentColor={user.bannerColor} isOwner={!!isOwner} />
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline">
        {[
          { label: "titles", value: totalNovels.toLocaleString() },
          { label: "chapters read", value: totalChaptersRead.toLocaleString() },
          { label: "mean score", value: meanScore === "—" ? "—" : `★ ${meanScore}` },
        ].map((cell) => (
          <div key={cell.label} className="px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              {cell.label}
            </p>
            <p className="mt-1.5 font-mono text-base text-paper tabular-nums">{cell.value}</p>
          </div>
        ))}
      </div>

      {/* Activity heatmap */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel right={`${activities.length} marks this year`}>Ledger</FolioLabel>
        <div className="overflow-x-auto scrollbar-hide">
          <ActivityHeatmap activities={activities} />
        </div>
      </div>

      {/* Genre overview */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Genres</FolioLabel>
        {sortedGenres.length === 0 ? (
          <p className="font-serif text-[14.5px] text-muted">No genre data yet.</p>
        ) : (
          <div className="space-y-1.5">
            {sortedGenres.slice(0, 10).map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-3">
                <span className="w-28 truncate font-mono text-[10.5px] text-muted">
                  {genre.toLowerCase()}
                </span>
                <LedgerBar value={count} max={maxGenreCount} />
                <span className="w-6 font-mono text-[10.5px] text-muted tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favourite titles */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Favourite titles</FolioLabel>
        {favoriteNovels.length === 0 ? (
          <p className="font-serif text-[14.5px] text-muted">
            {isOwner ? "Add favourites from any title's page." : "No favourites yet."}
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {favoriteNovels.map((novel) => (
              <NovelCard
                key={novel.id}
                id={novel.id}
                title={novel.title}
                coverImageUrl={novel.coverImageUrl}
                size="sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Favourite characters + authors (each renders its own module row) */}
      <FavoriteCharactersEditor
        initialFavorites={favoriteChars}
        availableCharacters={availableCharacters}
        isOwner={!!isOwner}
      />
      <FavoriteAuthorsEditor
        initialFavorites={favoriteAuthors}
        availableAuthors={allAuthors}
        isOwner={!!isOwner}
      />

      {/* Circle — who follows whom */}
      <div className="grid grid-cols-1 border-b border-hairline sm:grid-cols-2 sm:divide-x sm:divide-hairline">
        {[
          { label: "Following", count: followingCount, readers: following, empty: isOwner ? "Follow readers from their profiles; their marks show up in your feed." : "Not following anyone yet." },
          { label: "Followers", count: followerCount, readers: followers, empty: "No followers yet." },
        ].map((col) => (
          <div key={col.label} className="px-4 py-4 first:border-b first:border-hairline sm:first:border-b-0">
            <FolioLabel right={String(col.count)}>{col.label}</FolioLabel>
            {col.readers.length === 0 ? (
              <p className="font-serif text-[14.5px] text-muted">{col.empty}</p>
            ) : (
              <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
                {col.readers.map((r) => (
                  <Link
                    key={r.id}
                    href={`/user/${r.username}`}
                    className="text-body transition hover:text-gold"
                  >
                    {r.username}
                  </Link>
                ))}
                {col.count > col.readers.length && (
                  <span className="text-faint">+{col.count - col.readers.length} more</span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Recent activity</FolioLabel>
        {recentActivities.length === 0 ? (
          <p className="font-serif text-[14.5px] text-muted">Nothing logged yet.</p>
        ) : (
          <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
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
                    <p className="pt-3 pb-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint first:pt-0">
                      {currentDate.toLowerCase()}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2.5 border-t border-hairline py-1.5 first:border-t-0">
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-body">
                      {activity.detail}
                    </span>
                    <span className="shrink-0 font-mono text-[9.5px] text-faint tabular-nums">
                      {new Date(activity.createdAt)
                        .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                        .toLowerCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
