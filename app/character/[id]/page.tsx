import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import FavoriteCharacterButton from "@/components/FavoriteCharacterButton";
import { FolioSheet, FolioLabel } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";
import { safeImageSrc } from "@/lib/image-hosts";

const PLACEHOLDER = "/default-cover.svg";
const AVATAR_PLACEHOLDER = "/default-avatar.svg";

const ROLE_COLORS: Record<string, string> = {
  Protagonist: "text-gold-bright",
  "Main Character": "text-gold",
  Antagonist: "text-seal-bright",
  Supporting: "text-muted",
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
  const roleColor = ROLE_COLORS[character.role ?? ""] ?? ROLE_COLORS.Supporting;

  return (
    <FolioSheet
      statusLeft="webnovelist · characters"
      statusRight={`${character._count.favorites} ♥`}
      footer="ink & gold"
    >
      {/* Nameplate */}
      <div className="flex items-center gap-5 border-b border-hairline px-4 py-6">
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-hairline bg-elevated">
          <Image src={avatarUrl} alt={character.name} fill sizes="64px" priority className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          {character.role && (
            <p className={`font-mono text-[9.5px] uppercase tracking-[0.22em] ${roleColor}`}>
              {character.role}
            </p>
          )}
          <h1 className="mt-1 font-serif text-2xl font-semibold text-paper sm:text-[26px]">
            {character.name}
          </h1>
          <p className="mt-1.5 font-mono text-[10px] text-faint tabular-nums">
            {character._count.favorites} favourite{character._count.favorites !== 1 ? "s" : ""}
          </p>
        </div>
        {me && (
          <FavoriteCharacterButton
            characterId={characterId}
            initialFavorited={isFavorited}
          />
        )}
      </div>

      {/* From */}
      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel>From</FolioLabel>
        <div className="flex items-center gap-3">
          <Link href={`/novel/${character.novel.id}`} className="shrink-0">
            <Image
              src={coverUrl}
              alt={character.novel.title}
              width={40}
              height={56}
              className="rounded-[2px] object-cover ring-1 ring-hairline"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/novel/${character.novel.id}`}
              className="block min-w-0 truncate font-serif text-[15px] text-paper transition hover:text-gold"
            >
              {character.novel.title}
            </Link>
            {character.novel.nativeTitle && (
              <p className="truncate font-cjk text-[11px] text-faint">
                {character.novel.nativeTitle}
              </p>
            )}
            {character.novel.author && (
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {character.novel.authorId ? (
                  <Link
                    href={`/author/${character.novel.authorId}`}
                    className="transition hover:text-gold"
                  >
                    {character.novel.author}
                  </Link>
                ) : (
                  character.novel.author
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <FolioNav />
    </FolioSheet>
  );
}
