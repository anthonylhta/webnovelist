import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { listRelations, relationLabel } from "@/lib/relations";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import NovelAdminActions from "@/components/NovelAdminActions";
import NovelProgress from "@/components/NovelProgress";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import { safeImageSrc } from "@/lib/image-hosts";
import { mediaTypeLabel } from "@/lib/media-types";

const PLACEHOLDER = "/default-cover.svg";

// Role → mono text color for the character chips
const ROLE_COLORS: Record<string, string> = {
  Protagonist: "text-gold-bright",
  "Main Character": "text-gold",
  Antagonist: "text-seal-bright",
  Supporting: "text-muted",
};

export default async function NovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const novelId = parseInt(id);
  const currentUser = await getCurrentUser();

  const [novel, related, characters, entry] = await Promise.all([
    prisma.novel.findUnique({
      where: { id: novelId },
      include: { authorEntity: { select: { id: true, name: true } } },
    }),
    listRelations(novelId),
    prisma.character.findMany({
      where: { novelId },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: { id: true, name: true, role: true, imageUrl: true },
    }),
    currentUser
      ? prisma.userNovelList.findUnique({
          where: { userId_novelId: { userId: currentUser.id, novelId } },
        })
      : null,
  ]);

  if (!novel) notFound();

  const coverUrl = safeImageSrc(novel.coverImageUrl, PLACEHOLDER);
  const typeLabel = mediaTypeLabel(novel.mediaType).toLowerCase();

  return (
    <FolioSheet
      statusLeft="webnovelist · catalog"
      statusRight={`${typeLabel}${novel.status ? ` · ${novel.status.toLowerCase()}` : ""}`}
      footer={`ink & gold${novel.totalChapters ? ` · ${novel.totalChapters.toLocaleString()} chapters` : ""}`}
    >
      {/* Title page */}
      <div className="flex gap-5 border-b border-hairline px-4 py-6">
        <Image
          src={coverUrl}
          alt={novel.title}
          width={112}
          height={160}
          priority
          className="h-40 w-28 shrink-0 rounded-[2px] object-cover ring-1 ring-hairline"
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-gold-dim">
            {typeLabel}
            {novel.originalSource && ` · ${novel.originalSource}`}
            {novel.yearPublished && ` · ${novel.yearPublished}`}
          </p>
          <h1 className="mt-1.5 font-serif text-2xl font-semibold leading-tight text-paper sm:text-[28px]">
            {novel.title}
          </h1>
          {novel.nativeTitle && (
            <p className="mt-1 font-cjk text-[15px] text-muted">{novel.nativeTitle}</p>
          )}
          {novel.author && (
            <p className="mt-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
              by{" "}
              {novel.authorEntity ? (
                <Link
                  href={`/author/${novel.authorEntity.id}`}
                  className="text-body transition hover:text-gold"
                >
                  {novel.author}
                </Link>
              ) : (
                <span className="text-body">{novel.author}</span>
              )}
            </p>
          )}
          {novel.genres.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-2.5 gap-y-1 font-mono text-[10.5px]">
              {novel.genres.map((g) => (
                <Link
                  key={g}
                  href={`/browse?genre=${encodeURIComponent(g)}`}
                  className="text-gold-dim transition hover:text-gold"
                >
                  {g.toLowerCase()}
                </Link>
              ))}
            </p>
          )}
          {novel.tags.length > 0 && (
            <p className="mt-1.5 font-mono text-[9.5px] text-faint">
              {novel.tags.join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Your reading — the chapter number is the hero */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Your reading</FolioLabel>
        <NovelProgress
          novelId={novel.id}
          novelTitle={novel.title}
          totalChapters={novel.totalChapters}
          signedIn={currentUser !== null}
          entry={
            entry
              ? {
                  id: entry.id,
                  status: entry.status,
                  rating: entry.rating,
                  currentChapter: entry.currentChapter,
                  isFavorite: entry.isFavorite,
                  dateStarted: entry.dateStarted?.toISOString() ?? null,
                  dateFinished: entry.dateFinished?.toISOString() ?? null,
                  notes: entry.notes,
                  readingUrl: entry.readingUrl,
                  rereadCount: entry.rereadCount,
                }
              : null
          }
        />
      </div>

      {/* Synopsis */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>Synopsis</FolioLabel>
        <p className="whitespace-pre-line font-serif text-[14.5px] leading-relaxed text-body">
          {novel.description || "No description available."}
        </p>
      </div>

      {/* Related titles — adaptations, sequels, source material */}
      {related.length > 0 && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel right={String(related.length)}>Related titles</FolioLabel>
          <div className="divide-y divide-hairline">
            {related.map((r) => (
              <div key={r.relationId} className="flex items-baseline gap-3 py-2 first:pt-0 last:pb-0">
                <span className="w-32 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold-dim">
                  {relationLabel(r.kind)}
                </span>
                <Link
                  href={`/novel/${r.novel.id}`}
                  className="min-w-0 flex-1 truncate font-serif text-[15px] text-paper transition hover:text-gold"
                >
                  {r.novel.title}
                  {r.novel.nativeTitle && (
                    <span className="ml-2 font-cjk text-[11px] text-faint">{r.novel.nativeTitle}</span>
                  )}
                </Link>
                <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted">
                  {mediaTypeLabel(r.novel.mediaType).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Characters */}
      {characters.length > 0 && (
        <div className="border-b border-hairline px-4 py-4">
          <FolioLabel right={String(characters.length)}>Characters</FolioLabel>
          <div className="flex flex-wrap gap-2">
            {characters.map((char) => (
              <Link
                key={char.id}
                href={`/character/${char.id}`}
                className="flex items-center gap-2.5 rounded-[2px] border border-hairline px-2.5 py-1.5 transition hover:border-gold-dim"
              >
                <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-hairline bg-elevated">
                  <Image
                    fill
                    sizes="28px"
                    src={char.imageUrl || "/default-avatar.svg"}
                    alt={char.name}
                    className="object-cover"
                  />
                </span>
                <span>
                  <span className="block text-[12.5px] leading-tight text-body">
                    {char.name}
                  </span>
                  {char.role && (
                    <span
                      className={`font-mono text-[9px] uppercase tracking-[0.12em] ${
                        ROLE_COLORS[char.role] ?? ROLE_COLORS.Supporting
                      }`}
                    >
                      {char.role}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Admin actions — renders nothing for regular users */}
      <NovelAdminActions novelId={novel.id} novelTitle={novel.title} />

      <FolioNav />
    </FolioSheet>
  );
}
