// app/browse/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import NovelCard from "@/components/NovelCard";
import { MEDIA_TYPES, MEDIA_TYPE_LABELS, isMediaType } from "@/lib/media-types";

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

  // Helper for the filter pills — genre and type compose with each other
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

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold text-paper mb-2">Browse Novels</h1>
      <div className="rule-gold w-20 mb-8" />

      {/* Search Bar */}
      <form className="mb-6">
        {/* Preserve genre + type filters when searching */}
        {genre && <input type="hidden" name="genre" value={genre} />}
        {mediaType && <input type="hidden" name="type" value={mediaType} />}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-faint" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search by title, author…"
            className="w-full bg-surface border border-hairline rounded-lg pl-10 pr-4 py-3
                       text-paper placeholder-faint focus:outline-none focus:border-gold-dim"
          />
        </div>
      </form>

      {/* Media Type Filters — only once the catalog has more than one type */}
      {allMediaTypes.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <Link
            href={filterUrl(genre, undefined)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              !mediaType
                ? "bg-gold text-ink border-gold font-medium"
                : "bg-surface text-muted border-hairline hover:border-gold-dim hover:text-gold"
            }`}
          >
            All Types
          </Link>
          {allMediaTypes.map((t) => (
            <Link
              key={t}
              href={filterUrl(genre, t)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                mediaType === t
                  ? "bg-gold text-ink border-gold font-medium"
                  : "bg-surface text-muted border-hairline hover:border-gold-dim hover:text-gold"
              }`}
            >
              {MEDIA_TYPE_LABELS[t]}
            </Link>
          ))}
        </div>
      )}

      {/* Genre Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href={filterUrl(undefined, mediaType)}
          className={`px-3 py-1 rounded-full text-sm border transition ${
            !genre
              ? "bg-gold text-ink border-gold font-medium"
              : "bg-surface text-muted border-hairline hover:border-gold-dim hover:text-gold"
          }`}
        >
          All
        </Link>
        {allGenres.map((g) => (
          <Link
            key={g}
            href={filterUrl(g, mediaType)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              genre === g
                ? "bg-gold text-ink border-gold font-medium"
                : "bg-surface text-muted border-hairline hover:border-gold-dim hover:text-gold"
            }`}
          >
            {g}
          </Link>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-muted text-sm">
          {totalCount} novel{totalCount !== 1 ? "s" : ""} found
          {totalCount > NOVELS_PER_PAGE && (
            <span className="text-faint">
              {" "}· showing {(currentPage - 1) * NOVELS_PER_PAGE + 1}–
              {Math.min(currentPage * NOVELS_PER_PAGE, totalCount)}
            </span>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-faint text-sm">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Novel Grid */}
      {novels.length === 0 ? (
        <p className="text-muted text-center py-12">No novels found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {novels.map((novel, i) => (
            <NovelCard
              key={novel.id}
              id={novel.id}
              title={novel.title}
              nativeTitle={novel.nativeTitle}
              mediaType={novel.mediaType}
              coverImageUrl={novel.coverImageUrl}
              bordered
              priority={i < 4}
              footer={
                <>
                  <p className="text-faint text-sm mt-1 truncate">{novel.author}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {novel.genres.slice(0, 2).map((g) => (
                      <span key={g} className="px-2 py-0.5 bg-elevated border border-hairline rounded text-xs text-muted">
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-faint">
                    <span className="capitalize">{novel.status}</span>
                    <span>{novel.totalChapters} ch.</span>
                  </div>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {/* First Page */}
          {currentPage > 2 && (
            <Link
              href={buildPageUrl(1)}
              className="p-2 bg-surface border border-hairline rounded-md transition text-muted hover:border-gold-dim hover:text-gold"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Link>
          )}

          {/* Previous */}
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="p-2 bg-surface border border-hairline rounded-md transition text-muted hover:border-gold-dim hover:text-gold"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum, i) =>
            pageNum === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-faint">
                …
              </span>
            ) : (
              <Link
                key={pageNum}
                href={buildPageUrl(pageNum as number)}
                className={`px-3 py-2 rounded-md text-sm font-medium border transition ${
                  currentPage === pageNum
                    ? "bg-gold text-ink border-gold"
                    : "bg-surface text-muted border-hairline hover:border-gold-dim hover:text-gold"
                }`}
              >
                {pageNum}
              </Link>
            )
          )}

          {/* Next */}
          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="p-2 bg-surface border border-hairline rounded-md transition text-muted hover:border-gold-dim hover:text-gold"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          {/* Last Page */}
          {currentPage < totalPages - 1 && (
            <Link
              href={buildPageUrl(totalPages)}
              className="p-2 bg-surface border border-hairline rounded-md transition text-muted hover:border-gold-dim hover:text-gold"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}