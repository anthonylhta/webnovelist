// app/browse/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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

  // Get all genres for the filter bar
  const allNovels = await prisma.novel.findMany({ select: { genres: true } });
  const allGenres = [...new Set(allNovels.flatMap((n) => n.genres))].sort();

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
      <h1 className="text-3xl font-bold mb-8">Browse Novels</h1>

      {/* Search Bar */}
      <form className="mb-6">
        {/* Preserve genre filter when searching */}
        {genre && <input type="hidden" name="genre" value={genre} />}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search by title, author..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 
                       text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </form>

      {/* Genre Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/browse"
          className={`px-3 py-1 rounded-full text-sm transition ${
            !genre
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          All
        </Link>
        {allGenres.map((g) => (
          <Link
            key={g}
            href={`/browse?genre=${g}`}
            className={`px-3 py-1 rounded-full text-sm transition ${
              genre === g
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {g}
          </Link>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400">
          {totalCount} novel{totalCount !== 1 ? "s" : ""} found
          {totalCount > NOVELS_PER_PAGE && (
            <span className="text-gray-500">
              {" "}· showing {(currentPage - 1) * NOVELS_PER_PAGE + 1}–
              {Math.min(currentPage * NOVELS_PER_PAGE, totalCount)}
            </span>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-gray-500 text-sm">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Novel Grid */}
      {novels.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No novels found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {novels.map((novel) => (
            <Link
              key={novel.id}
              href={`/novel/${novel.id}`}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden 
                         hover:border-blue-500 transition group"
            >
              <div className="aspect-[3/4] bg-gray-800 overflow-hidden">
                <img
                  src={novel.coverImageUrl || "https://placehold.co/300x400/1a1a2e/ffffff?text=No+Cover"}
                  alt={novel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{novel.title}</h3>
                {novel.titleChinese && (
                  <p className="text-gray-400 text-sm truncate">{novel.titleChinese}</p>
                )}
                <p className="text-gray-500 text-sm mt-1">{novel.author}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {novel.genres.slice(0, 2).map((g) => (
                    <span key={g} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
                      {g}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>{novel.status}</span>
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
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Link>
          )}

          {/* Previous */}
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum, i) =>
            pageNum === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-gray-500">
                …
              </span>
            ) : (
              <Link
                key={pageNum}
                href={buildPageUrl(pageNum as number)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
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
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          {/* Last Page */}
          {currentPage < totalPages - 1 && (
            <Link
              href={buildPageUrl(totalPages)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
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