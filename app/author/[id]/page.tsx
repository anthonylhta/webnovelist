import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User, BookOpen, Heart, Layers } from "lucide-react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/current-user";
import FavoriteAuthorButton from "@/components/FavoriteAuthorButton";

const PLACEHOLDER = "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover";
const AVATAR_PLACEHOLDER = "https://placehold.co/200x200/1a1a2e/ffffff?text=?";

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
          titleChinese: true,
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

  const STATUS_STYLES: Record<string, string> = {
    Ongoing: "bg-green-600/20 text-green-400 border-green-600/30",
    Completed: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    Hiatus: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  };

  return (
    <div className="-mt-8 -mx-4">
      {/* Blurred hero using author image */}
      <div className="relative h-48 sm:h-60 overflow-hidden">
        <Image
          src={avatarUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover scale-110 blur-2xl opacity-30"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
      </div>

      {/* Content — pulled up to overlap hero */}
      <div className="relative -mt-28 sm:-mt-36 px-4 sm:px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-center sm:items-end">

            {/* Avatar */}
            <div className="shrink-0">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-gray-900 shadow-2xl ring-1 ring-white/10 bg-gray-800">
                <Image
                  src={avatarUrl}
                  alt={author.name}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Name + meta */}
            <div className="flex-1 text-center sm:text-left pb-0 sm:pb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 uppercase tracking-widest">Author</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold">{author.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  {author.novels.length} novel{author.novels.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  {author._count.favorites} favourite{author._count.favorites !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Favourite button */}
            {me && (
              <div className="shrink-0">
                <FavoriteAuthorButton authorId={authorId} initialFavorited={isFavorited} />
              </div>
            )}
          </div>

          {/* Bio */}
          {author.bio && (
            <div className="mt-8 max-w-3xl">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                About
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
                {author.bio}
              </p>
            </div>
          )}

          {/* Novels */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-5">Novels</h2>
            {author.novels.length === 0 ? (
              <p className="text-gray-500 text-sm">No novels linked to this author yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {author.novels.map((novel) => {
                  const statusStyle =
                    STATUS_STYLES[novel.status ?? ""] ??
                    "bg-gray-600/20 text-gray-400 border-gray-600/30";
                  return (
                    <Link
                      key={novel.id}
                      href={`/novel/${novel.id}`}
                      className="group flex flex-col"
                    >
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-800 group-hover:border-blue-500/50 transition">
                        <Image
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                          src={novel.coverImageUrl || PLACEHOLDER}
                          alt={novel.title}
                          className="object-cover"
                        />
                        {novel.status && (
                          <span
                            className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded border ${statusStyle}`}
                          >
                            {novel.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2 group-hover:text-white transition leading-snug">
                        {novel.title}
                      </p>
                      {novel.totalChapters && (
                        <p className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          {novel.totalChapters.toLocaleString()} ch
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
