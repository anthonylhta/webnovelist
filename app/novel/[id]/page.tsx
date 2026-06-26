import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User, Layers } from "lucide-react";
import AddToListButton from "@/components/AddToListButton";
import FavoriteNovelButton from "@/components/FavoriteNovelButton";
import NovelAdminActions from "@/components/NovelAdminActions";
import { safeImageSrc } from "@/lib/image-hosts";

const PLACEHOLDER = "/default-cover.svg";

const STATUS_STYLES: Record<string, string> = {
  Ongoing: "bg-gold/10 text-gold border-gold/30",
  Completed: "bg-jade/10 text-jade border-jade/30",
  Hiatus: "bg-elevated text-muted border-hairline",
};

export default async function NovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const novelId = parseInt(id);

  const [novel, characters] = await Promise.all([
    prisma.novel.findUnique({
      where: { id: novelId },
      include: { authorEntity: { select: { id: true, name: true } } },
    }),
    prisma.character.findMany({
      where: { novelId },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: { id: true, name: true, role: true, imageUrl: true },
    }),
  ]);

  if (!novel) notFound();

  const coverUrl = safeImageSrc(novel.coverImageUrl, PLACEHOLDER);

  const ROLE_STYLES: Record<string, string> = {
    Protagonist: "text-gold-bright bg-gold/10 border-gold/30",
    "Main Character": "text-gold bg-gold/10 border-gold/30",
    Antagonist: "text-seal-bright bg-seal/10 border-seal/30",
    Supporting: "text-muted bg-elevated border-hairline",
  };
  const statusStyle = STATUS_STYLES[novel.status || ""] ?? "bg-elevated text-muted border-hairline";

  return (
    <div className="-mt-8 -mx-4">
      {/* Blurred hero banner */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        <Image
          src={coverUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover scale-110 blur-2xl opacity-40"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-transparent to-ink/50" />
      </div>

      {/* Content — pulled up to overlap the hero */}
      <div className="relative -mt-24 sm:-mt-32 px-4 sm:px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">

            {/* Left: cover art + action buttons */}
            <div className="shrink-0 w-40 sm:w-48 mx-auto md:mx-0">
              <Image
                src={coverUrl}
                alt={novel.title}
                width={192}
                height={288}
                className="w-full rounded-xl shadow-2xl ring-1 ring-white/10"
              />
              <div className="mt-4 flex flex-col gap-2">
                <AddToListButton
                  novelId={novel.id}
                  novelTitle={novel.title}
                  totalChapters={novel.totalChapters}
                />
                <FavoriteNovelButton novelId={novel.id} />
                <NovelAdminActions novelId={novel.id} novelTitle={novel.title} />
              </div>
            </div>

            {/* Right: title + metadata + description */}
            <div className="flex-1 md:pt-8">
              {/* Status / source / year inline */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {novel.status && (
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusStyle}`}>
                    {novel.status}
                  </span>
                )}
                {novel.originalSource && (
                  <span className="text-faint text-sm">{novel.originalSource}</span>
                )}
                {novel.yearPublished && (
                  <span className="text-faint text-sm">· {novel.yearPublished}</span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold leading-tight font-serif text-paper">{novel.title}</h1>
              {novel.titleChinese && (
                <p className="font-cjk text-muted mt-1.5 text-lg">{novel.titleChinese}</p>
              )}

              {/* Author + chapter count */}
              <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-muted">
                {novel.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-faint" />
                    {novel.authorEntity ? (
                      <Link
                        href={`/author/${novel.authorEntity.id}`}
                        className="hover:text-gold-bright transition"
                      >
                        {novel.author}
                      </Link>
                    ) : (
                      novel.author
                    )}
                  </span>
                )}
                {novel.totalChapters && (
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-faint" />
                    {novel.totalChapters.toLocaleString()} chapters
                  </span>
                )}
              </div>

              {/* Genre pills */}
              {novel.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {novel.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-gold/15 text-gold rounded-full text-sm border border-gold/20 hover:bg-gold/25 transition"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Tag pills */}
              {novel.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {novel.tags.map((t) => (
                    <span key={t} className="px-2.5 py-0.5 bg-elevated/80 text-faint rounded-full text-xs border border-hairline">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="mt-8 pt-8 border-t border-hairline/60">
                <h3 className="text-xs font-semibold text-faint uppercase tracking-widest mb-4">
                  Synopsis
                </h3>
                <p className="text-body leading-relaxed whitespace-pre-line text-[15px]">
                  {novel.description || "No description available."}
                </p>
              </div>

              {/* Characters */}
              {characters.length > 0 && (
                <div className="mt-8 pt-8 border-t border-hairline/60">
                  <h3 className="text-xs font-semibold text-faint uppercase tracking-widest mb-4">
                    Characters
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {characters.map((char) => (
                      <Link
                        key={char.id}
                        href={`/character/${char.id}`}
                        className="flex items-center gap-2.5 bg-surface hover:bg-elevated border border-hairline
                                   hover:border-gold-dim rounded-xl px-3 py-2 transition group"
                      >
                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-elevated border border-hairline shrink-0">
                          <Image
                            fill
                            sizes="36px"
                            src={char.imageUrl || "/default-avatar.svg"}
                            alt={char.name}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-body group-hover:text-paper transition leading-none mb-1">
                            {char.name}
                          </p>
                          {char.role && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ROLE_STYLES[char.role] ?? ROLE_STYLES.Supporting}`}>
                              {char.role}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
