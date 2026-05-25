import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User, Layers } from "lucide-react";
import AddToListButton from "@/components/AddToListButton";
import FavoriteNovelButton from "@/components/FavoriteNovelButton";
import NovelAdminActions from "@/components/NovelAdminActions";

const PLACEHOLDER = "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover";

const STATUS_STYLES: Record<string, string> = {
  Ongoing: "bg-green-600/20 text-green-400 border-green-600/30",
  Completed: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  Hiatus: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
};

export default async function NovelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const novel = await prisma.novel.findUnique({
    where: { id: parseInt(id) },
  });

  if (!novel) notFound();

  const coverUrl = novel.coverImageUrl || PLACEHOLDER;
  const statusStyle = STATUS_STYLES[novel.status || ""] ?? "bg-gray-600/20 text-gray-400 border-gray-600/30";

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
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/50 via-transparent to-gray-950/50" />
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
                  <span className="text-gray-500 text-sm">{novel.originalSource}</span>
                )}
                {novel.yearPublished && (
                  <span className="text-gray-600 text-sm">· {novel.yearPublished}</span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{novel.title}</h1>
              {novel.titleChinese && (
                <p className="text-gray-400 mt-1.5 text-lg">{novel.titleChinese}</p>
              )}

              {/* Author + chapter count */}
              <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-gray-400">
                {novel.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    {novel.author}
                  </span>
                )}
                {novel.totalChapters && (
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-gray-500" />
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
                      className="px-3 py-1 bg-blue-600/15 text-blue-400 rounded-full text-sm border border-blue-600/20 hover:bg-blue-600/25 transition"
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
                    <span key={t} className="px-2.5 py-0.5 bg-gray-800/80 text-gray-500 rounded-full text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="mt-8 pt-8 border-t border-gray-800/60">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                  Synopsis
                </h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-[15px]">
                  {novel.description || "No description available."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
