// app/browse/page.tsx
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { safeImageSrc } from "@/lib/image-hosts";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const getAllGenres = unstable_cache(
  async () => {
    const rows = await prisma.novel.findMany({ select: { genres: true } });
    return [...new Set(rows.flatMap((n) => n.genres))].sort();
  },
  ["all-genres"],
  { revalidate: 3600 }
);

const NOVELS_PER_PAGE = 20;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; genre?: string; page?: string }>;
}) {
  const { search, genre, page } = await searchParams;

  const currentPage = Math.max(1, parseInt(page || "1") || 1);

  // Build the where clause once so we reuse it for both queries
  const whereClause = {
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { titleChinese: { contains: search, mode: "insensitive" as const } },
              { author: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      genre ? { genres: { has: genre } } : {},
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

  const allGenres = await getAllGenres();

  // Helper to build pagination URLs preserving search & genre
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (genre) params.set("genre", genre);
    params.set("page", pageNum.toString());
    return `/browse?${params.toString()}`;
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
        {/* Preserve genre filter when searching */}
        {genre && <input type="hidden" name="genre" value={genre} />}
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

      {/* Genre Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/browse"
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
            href={`/browse?genre=${g}`}
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
            <Link
              key={novel.id}
              href={`/novel/${novel.id}`}
              className="bg-surface rounded-lg border border-hairline overflow-hidden
                         hover:border-gold-dim transition group"
            >
              <div className="relative aspect-[3/4] bg-elevated overflow-hidden">
                <Image
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  src={safeImageSrc(novel.coverImageUrl, "/default-cover.svg")}
                  alt={novel.title}
                  priority={i < 4}
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-serif text-paper truncate group-hover:text-gold transition">{novel.title}</h3>
                {novel.titleChinese && (
                  <p className="font-cjk text-muted text-sm truncate">{novel.titleChinese}</p>
                )}
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
              </div>
            </Link>
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