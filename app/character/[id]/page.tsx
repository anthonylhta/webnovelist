import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BookOpen, Heart, User } from "lucide-react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import FavoriteCharacterButton from "@/components/FavoriteCharacterButton";
import { safeImageSrc } from "@/lib/image-hosts";

const PLACEHOLDER = "/default-cover.svg";
const AVATAR_PLACEHOLDER = "/default-avatar.svg";

const ROLE_STYLES: Record<string, string> = {
  Protagonist: "bg-gold/10 text-gold-bright border-gold/30",
  "Main Character": "bg-gold/10 text-gold border-gold/30",
  Antagonist: "bg-seal/10 text-seal-bright border-seal/30",
  Supporting: "bg-elevated text-muted border-hairline",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const character = await prisma.character.findUnique({
    where: { id: parseInt(id) },
    select: { name: true, novel: { select: { title: true } } },
  });
  if (!character) return { title: "Character Not Found — WebNovelist" };
  return {
    title: `${character.name} — ${character.novel.title} — WebNovelist`,
  };
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const characterId = parseInt(id);

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      novel: {
        select: {
          id: true,
          title: true,
          nativeTitle: true,
          coverImageUrl: true,
          authorId: true,
          author: true,
        },
      },
      _count: { select: { favorites: true } },
    },
  });

  if (!character) notFound();

  const me = await getCurrentUser();

  const isFavorited = me
    ? !!(await prisma.userFavoriteCharacter.findUnique({
        where: { userId_characterId: { userId: me.id, characterId } },
      }))
    : false;

  const avatarUrl = character.imageUrl || AVATAR_PLACEHOLDER;
  const coverUrl = safeImageSrc(character.novel.coverImageUrl, PLACEHOLDER);
  const roleStyle = ROLE_STYLES[character.role ?? ""] ?? ROLE_STYLES.Supporting;

  return (
    <div className="-mt-8 -mx-4">
      {/* Blurred hero using novel cover */}
      <div className="relative h-48 sm:h-60 overflow-hidden">
        <Image
          src={coverUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover scale-110 blur-2xl opacity-30"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      <div className="relative -mt-28 sm:-mt-36 px-4 sm:px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-end">

            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-ink shadow-2xl ring-1 ring-white/10 bg-elevated">
                <Image
                  src={avatarUrl}
                  alt={character.name}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Name + meta */}
            <div className="flex-1 text-center sm:text-left pb-0 sm:pb-2">
              {character.role && (
                <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border mb-2 ${roleStyle}`}>
                  {character.role}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold font-serif text-paper">{character.name}</h1>

              {/* Novel link */}
              <Link
                href={`/novel/${character.novel.id}`}
                className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-sm text-muted hover:text-gold transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {character.novel.title}
              </Link>

              {/* Author link */}
              {character.novel.author && (
                <Link
                  href={character.novel.authorId ? `/author/${character.novel.authorId}` : "#"}
                  className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-xs text-faint hover:text-gold transition"
                >
                  <User className="w-3 h-3" />
                  {character.novel.author}
                </Link>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-xs text-faint">
                <Heart className="w-3 h-3" />
                {character._count.favorites} favourite{character._count.favorites !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Favourite button */}
            {me && (
              <div className="shrink-0">
                <FavoriteCharacterButton characterId={characterId} initialFavorited={isFavorited} />
              </div>
            )}
          </div>

          {/* Novel card */}
          <div className="mt-10">
            <h2 className="text-xs font-semibold text-faint uppercase tracking-widest mb-4">From</h2>
            <Link href={`/novel/${character.novel.id}`} className="flex items-center gap-4 bg-surface border border-hairline hover:border-gold-dim rounded-xl p-4 transition group">
              <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-hairline">
                <Image
                  fill
                  sizes="48px"
                  src={coverUrl}
                  alt={character.novel.title}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold group-hover:text-gold-bright transition">{character.novel.title}</p>
                {character.novel.nativeTitle && (
                  <p className="font-cjk text-sm text-muted">{character.novel.nativeTitle}</p>
                )}
                {character.novel.author && (
                  <p className="text-xs text-faint mt-0.5">{character.novel.author}</p>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
