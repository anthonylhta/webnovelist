import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import FavoriteAuthorButton from "@/components/FavoriteAuthorButton";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import { safeImageSrc } from "@/lib/image-hosts";

const PLACEHOLDER = "/default-cover.svg";
const AVATAR_PLACEHOLDER = "/default-avatar.svg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const author = await prisma.author.findUnique({
    where: { id: parseInt(id) },
    select: { name: true },
  });
  if (!author) return { title: "Author Not Found — WebNovelist" };
  return {
    title: `${author.name} — WebNovelist`,
    description: `Browse novels by ${author.name} on WebNovelist.`,
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authorId = parseInt(id);

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    include: {
      novels: {
        orderBy: { title: "asc" },
        select: {
          id: true,
          title: true,
          nativeTitle: true,
          coverImageUrl: true,
          status: true,
          genres: true,
          totalChapters: true,
        },
      },
      _count: { select: { favorites: true } },
    },
  });

  if (!author) notFound();

  const me = await getCurrentUser();

  const isFavorited = me
    ? !!(await prisma.userFavoriteAuthor.findUnique({
        where: { userId_authorId: { userId: me.id, authorId } },
      }))
    : false;

  const avatarUrl = author.imageUrl || AVATAR_PLACEHOLDER;

  return (
    <FolioSheet
      statusLeft="webnovelist · authors"
      statusRight={`${author.novels.length} work${author.novels.length !== 1 ? "s" : ""}`}
      footer="ink & gold"
    >
      {/* Nameplate */}
      <div className="flex items-center gap-5 border-b border-hairline px-4 py-6">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-hairline bg-elevated">
          <Image src={avatarUrl} alt={author.name} fill sizes="64px" priority className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold-dim">
            Author
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-paper sm:text-[26px]">
            {author.name}
          </h1>
          <p className="mt-1.5 font-mono text-[10px] text-faint tabular-nums">
            {author.novels.length} work{author.novels.length !== 1 ? "s" : ""} ·{" "}
            {author._count.favorites} favourite{author._count.favorites !== 1 ? "s" : ""}
          </p>
        </div>
        {me && (
          <FavoriteAuthorButton authorId={authorId} initialFavorited={isFavorited} />
        )}
      </div>

      {/* Bio */}
      {author.bio && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel>About</FolioLabel>
          <p className="whitespace-pre-line font-serif text-[14.5px] leading-relaxed text-body">
            {author.bio}
          </p>
        </div>
      )}

      {/* Works */}
      <div className="border-b border-hairline px-4 pt-4 pb-1.5">
        <FolioLabel right={String(author.novels.length)}>Works</FolioLabel>
        {author.novels.length === 0 ? (
          <p className="pb-3 font-serif text-[14.5px] text-muted">
            Nothing linked to this author yet.
          </p>
        ) : (
          <div className="divide-y divide-hairline">
            {author.novels.map((novel) => (
              <div key={novel.id} className="flex items-center gap-3 py-2.5">
                <Link href={`/novel/${novel.id}`} className="shrink-0">
                  <Image
                    src={safeImageSrc(novel.coverImageUrl, PLACEHOLDER)}
                    alt={novel.title}
                    width={32}
                    height={44}
                    className="rounded-[2px] object-cover ring-1 ring-hairline"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/novel/${novel.id}`}
                    className="block min-w-0 truncate font-serif text-[15px] text-paper transition hover:text-gold"
                  >
                    {novel.title}
                  </Link>
                  {novel.nativeTitle && (
                    <p className="truncate font-cjk text-[11px] text-faint">
                      {novel.nativeTitle}
                    </p>
                  )}
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-[10.5px] text-body tabular-nums">
                  {novel.totalChapters ? `${novel.totalChapters.toLocaleString()} ch` : "—"}
                </span>
                <span className="hidden w-16 shrink-0 text-right font-mono text-[9.5px] text-faint sm:block">
                  {novel.status?.toLowerCase() ?? ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
