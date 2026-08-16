// app/browse/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { safeImageSrc } from "@/lib/image-hosts";
import { MEDIA_TYPES, MEDIA_TYPE_LABELS, isMediaType } from "@/lib/media-types";
import { FolioSheet } from "@/components/FolioKit";
import FolioNav from "@/components/FolioNav";

const getAllGenres = unstable_cache(
  async () => {
    const rows = await prisma.novel.findMany({ select: { genres: true } });
    return [...new Set(rows.flatMap((n) => n.genres))].sort();
  },
  ["all-genres"],
  { revalidate: 3600 }
);

// Types actually present in the catalog, in canonical order
const getAllMediaTypes = unstable_cache(
  async () => {
    const rows = await prisma.novel.findMany({
      select: { mediaType: true },
      distinct: ["mediaType"],
    });
    const present = new Set(rows.map((r) => r.mediaType));
    return MEDIA_TYPES.filter((t) => present.has(t));
  },
  ["all-media-types"],
  { revalidate: 3600 }
);

const NOVELS_PER_PAGE = 20;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; genre?: string; type?: string; page?: string }>;
}) {
  const { search, genre, type, page } = await searchParams;

  const mediaType = isMediaType(type) ? type : undefined;
  const currentPage = Math.max(1, parseInt(page || "1") || 1);

  // Build the where clause once so we reuse it for both queries
  const whereClause = {
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { nativeTitle: { contains: search, mode: "insensitive" as const } },
              { author: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      genre ? { genres: { has: genre } } : {},
      mediaType ? { mediaType } : {},
    ],
  };

  // Fetch novels for current page + total count in parallel
  const [novels, totalCount] = await Promise.all([
    prisma.novel.findMany({
      where: whereClause,
      orderBy: { title: "asc" },
      skip: (currentPage - 1) * NOVELS_PER_PAGE,
      take: NOVELS_PER_PAGE,
    }),
    prisma.novel.count({ where: whereClause }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / NOVELS_PER_PAGE));

  const [allGenres, allMediaTypes] = await Promise.all([getAllGenres(), getAllMediaTypes()]);

  // Helper to build pagination URLs preserving search, genre & type
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (genre) params.set("genre", genre);
    if (mediaType) params.set("type", mediaType);
    params.set("page", pageNum.toString());
    return `/browse?${params.toString()}`;
  };

  // Helper for the filter rows — genre and type compose with each other
  const filterUrl = (nextGenre?: string, nextType?: string) => {
    const params = new URLSearchParams();
    if (nextGenre) params.set("genre", nextGenre);
    if (nextType) params.set("type", nextType);
    const qs = params.toString();
    return qs ? `/browse?${qs}` : "/browse";
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) pages.push("...");

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const typeLabel = (t: string) =>
    isMediaType(t) ? MEDIA_TYPE_LABELS[t].toLowerCase() : t;

  return (
    <FolioSheet
      statusLeft="webnovelist · catalog"
      statusRight={`${totalCount} title${totalCount !== 1 ? "s" : ""}`}
      footer={`ink & gold · page ${currentPage} of ${totalPages}`}
    >
      {/* Media-type tabs — only once the catalog has more than one type */}
      {allMediaTypes.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-hairline px-4 py-2.5 font-mono text-[11px]">
          <Link
            href={filterUrl(genre, undefined)}
            className={`transition ${!mediaType ? "text-gold" : "text-faint hover:text-muted"}`}
          >
            all
          </Link>
          {allMediaTypes.map((t) => (
            <Link
              key={t}
              href={filterUrl(genre, t)}
              className={`transition ${mediaType === t ? "text-gold" : "text-faint hover:text-muted"}`}
            >
              {typeLabel(t)}
            </Link>
          ))}
        </div>
      )}

      {/* Search */}
      <form className="flex items-center gap-3 border-b border-hairline px-4 py-2.5">
        {/* Preserve genre + type filters when searching */}
        {genre && <input type="hidden" name="genre" value={genre} />}
        {mediaType && <input type="hidden" name="type" value={mediaType} />}
        <span aria-hidden className="font-mono text-[11px] text-gold-dim">
          /
        </span>
        <input
          type="text"
          name="search"
          defaultValue={search || ""}
          placeholder="title, author…"
          className="w-full bg-transparent font-mono text-[12px] text-paper placeholder-faint focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 font-mono text-[11px] text-gold transition hover:text-gold-bright"
        >
          [search]
        </button>
      </form>

      {/* Genre index */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-hairline px-4 py-2.5 font-mono text-[10.5px]">
        <Link
          href={filterUrl(undefined, mediaType)}
          className={`transition ${!genre ? "text-gold" : "text-faint hover:text-muted"}`}
        >
          all genres
        </Link>
        {allGenres.map((g) => (
          <Link
            key={g}
            href={filterUrl(g, mediaType)}
            className={`transition ${genre === g ? "text-gold" : "text-faint hover:text-muted"}`}
          >
            {g.toLowerCase()}
          </Link>
        ))}
      </div>

      {/* Results line */}
      <div className="flex items-baseline justify-between border-b border-hairline px-4 py-2 font-mono text-[9.5px] tracking-[0.1em] text-faint tabular-nums">
        <span>
          {totalCount} title{totalCount !== 1 ? "s" : ""}
          {totalCount > NOVELS_PER_PAGE &&
            ` · showing ${(currentPage - 1) * NOVELS_PER_PAGE + 1}–${Math.min(
              currentPage * NOVELS_PER_PAGE,
              totalCount
            )}`}
        </span>
        {totalPages > 1 && (
          <span>
            page {currentPage} / {totalPages}
          </span>
        )}
      </div>

      {/* Catalog rows */}
      {novels.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <p className="font-serif text-[15px] text-muted">
            Nothing in the catalog matches.{" "}
            <Link href="/browse" className="text-gold transition hover:text-gold-bright">
              Clear the filters
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="divide-y divide-hairline">
          {novels.map((novel, i) => (
            <div key={novel.id} className="flex items-center gap-3 px-4 py-2.5">
              <Link href={`/novel/${novel.id}`} className="shrink-0">
                <Image
                  src={safeImageSrc(novel.coverImageUrl, "/default-cover.svg")}
                  alt={novel.title}
                  width={32}
                  height={44}
                  priority={i === 0}
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
                <div className="truncate text-[11px]">
                  {novel.nativeTitle ? (
                    <span className="font-cjk text-faint">{novel.nativeTitle}</span>
                  ) : (
                    <span className="text-faint">{novel.author}</span>
                  )}
                </div>
              </div>
              <span className="hidden w-24 shrink-0 text-right font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted sm:block">
                {typeLabel(novel.mediaType)}
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-[10.5px] text-body tabular-nums">
                {novel.totalChapters
                  ? `${novel.totalChapters} ch`
                  : novel.latestChapter
                    ? `${novel.latestChapter}+ ch`
                    : "—"}
              </span>
              <span className="hidden w-16 shrink-0 text-right font-mono text-[9.5px] text-faint md:block">
                {novel.status ?? ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-hairline px-4 py-2.5 font-mono text-[11px] tabular-nums">
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="text-gold transition hover:text-gold-bright"
            >
              [prev]
            </Link>
          )}
          {getPageNumbers().map((pageNum, i) =>
            pageNum === "..." ? (
              <span key={`dots-${i}`} className="text-faint">
                …
              </span>
            ) : (
              <Link
                key={pageNum}
                href={buildPageUrl(pageNum as number)}
                className={`transition ${
                  currentPage === pageNum ? "text-gold" : "text-faint hover:text-muted"
                }`}
              >
                {pageNum}
              </Link>
            )
          )}
          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="text-gold transition hover:text-gold-bright"
            >
              [next]
            </Link>
          )}
        </div>
      )}

      <FolioNav />
    </FolioSheet>
  );
}
