// app/feed/page.tsx — the marks of the readers you follow, newest first.
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

const FEED_SIZE = 60;
const READER_SUGGESTIONS = 8;

export default async function FeedPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/sign-in");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const edges = await prisma.follow.findMany({
    where: { followerId: me.id },
    select: { followingId: true },
  });
  const followingIds = edges.map((e) => e.followingId);
  const excluded = [me.id, ...followingIds];

  const [activities, activeReaders] = await Promise.all([
    followingIds.length
      ? prisma.activity.findMany({
          where: { userId: { in: followingIds } },
          select: {
            id: true,
            type: true,
            detail: true,
            novelId: true,
            createdAt: true,
            user: { select: { username: true } },
          },
          orderBy: { createdAt: "desc" },
          take: FEED_SIZE,
        })
      : Promise.resolve([]),
    // Readers worth following: whoever has been marking the most lately.
    prisma.activity.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: thirtyDaysAgo }, userId: { notIn: excluded } },
      _count: { _all: true },
      orderBy: { _count: { userId: "desc" } },
      take: READER_SUGGESTIONS,
    }),
  ]);

  // Hydrate the suggested readers; fall back to the newest sign-ups when the
  // last 30 days were quiet.
  const readers =
    activeReaders.length > 0
      ? await prisma.user
          .findMany({
            where: { id: { in: activeReaders.map((r) => r.userId) } },
            select: { id: true, username: true },
          })
          .then((rows) =>
            activeReaders.flatMap((r) => {
              const u = rows.find((row) => row.id === r.userId);
              return u ? [{ ...u, note: `${r._count._all} marks · 30d` }] : [];
            })
          )
      : await prisma.user
          .findMany({
            where: { id: { notIn: excluded } },
            select: { id: true, username: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: READER_SUGGESTIONS,
          })
          .then((rows) =>
            rows.map((u) => ({
              id: u.id,
              username: u.username,
              note: `joined ${u.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toLowerCase()}`,
            }))
          );

  const dayOf = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();

  return (
    <FolioSheet
      statusLeft="webnovelist · feed"
      statusRight={`following ${followingIds.length}`}
      footer="ink & gold · the marks of your circle"
    >
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel right={activities.length > 0 ? `latest ${activities.length}` : undefined}>
          From your circle
        </FolioLabel>
        {followingIds.length === 0 ? (
          <p className="font-serif text-[15px] text-muted">
            You aren&apos;t following anyone yet. Open a reader&apos;s profile and press{" "}
            <span className="font-mono text-[12px] text-gold">[follow]</span> — their marks
            will gather here.
          </p>
        ) : activities.length === 0 ? (
          <p className="font-serif text-[15px] text-muted">
            Quiet so far — nobody in your circle has logged anything yet.
          </p>
        ) : (
          <div>
            {activities.map((a, i) => {
              const day = dayOf(a.createdAt);
              const showDay = i === 0 || day !== dayOf(activities[i - 1].createdAt);
              return (
                <div key={a.id}>
                  {showDay && (
                    <p className="pt-3 pb-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint first:pt-0">
                      {day}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2.5 border-t border-hairline py-1.5 first:border-t-0">
                    <Link
                      href={`/user/${a.user.username}`}
                      className="shrink-0 font-mono text-[11px] text-gold-dim transition hover:text-gold"
                    >
                      {a.user.username}
                    </Link>
                    {a.novelId ? (
                      <Link
                        href={`/novel/${a.novelId}`}
                        className="min-w-0 flex-1 truncate text-[12.5px] text-body transition hover:text-gold"
                      >
                        {a.detail}
                      </Link>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-body">{a.detail}</span>
                    )}
                    <span className="shrink-0 font-mono text-[9.5px] text-faint tabular-nums">
                      {a.createdAt
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

      {readers.length > 0 && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel>Readers</FolioLabel>
          <div className="divide-y divide-hairline">
            {readers.map((r) => (
              <div key={r.id} className="flex items-baseline gap-2.5 py-1.5 first:pt-0 last:pb-0">
                <Link
                  href={`/user/${r.username}`}
                  className="min-w-0 truncate font-mono text-[12px] text-body transition hover:text-gold"
                >
                  {r.username}
                </Link>
                <span aria-hidden className="leader-dots flex-1" />
                <span className="shrink-0 font-mono text-[10px] text-faint tabular-nums">{r.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <FolioNav />
    </FolioSheet>
  );
}
