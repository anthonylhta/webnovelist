// app/browse/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; genre?: string }>;
}) {
  const { search, genre } = await searchParams;

  const novels = await prisma.novel.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { titleChinese: { contains: search, mode: "insensitive" } },
                { author: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        genre ? { genres: { has: genre } } : {},
      ],
    },
    orderBy: { title: "asc" },
  });

  const allNovels = await prisma.novel.findMany({ select: { genres: true } });
  const allGenres = [...new Set(allNovels.flatMap((n) => n.genres))].sort();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Browse Novels</h1>

      {/* Search Bar */}
      <form className="mb-6">
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
      <p className="text-gray-400 mb-4">
        {novels.length} novel{novels.length !== 1 ? "s" : ""} found
      </p>

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
    </div>
  );
}