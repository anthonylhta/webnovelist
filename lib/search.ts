// Catalog search: trigram-backed, typo-tolerant, ranked. Returns novel ids in
// rank order plus the total match count; callers hydrate rows with Prisma so
// every column (present and future) flows through typed.
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type SearchOptions = {
  query: string;
  genre?: string;
  mediaType?: string;
  skip: number;
  take: number;
};

/** Trim, collapse whitespace, cap length — the query as it goes into SQL. */
export function normalizeQuery(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/\s+/g, " ").slice(0, 100);
}

/**
 * Rank titles for a query. A row matches when the query is a substring of the
 * title, native title or author (ILIKE — backed by the trigram GIN indexes) or
 * when it is trigram-similar to any of them (`%`, pg_trgm's default 0.3
 * threshold — catches "reverand insanity"). Substring hits sort first, then by
 * best similarity, then title.
 */
export async function searchNovelIds({
  query,
  genre,
  mediaType,
  skip,
  take,
}: SearchOptions): Promise<{ ids: number[]; total: number }> {
  const like = `%${query}%`;
  const rows = await prisma.$queryRaw<{ id: number; total: bigint }[]>`
    SELECT n.id, COUNT(*) OVER() AS total
    FROM novels n
    WHERE (
      n.title ILIKE ${like}
      OR n.native_title ILIKE ${like}
      OR n.author ILIKE ${like}
      OR n.title % ${query}
      OR n.native_title % ${query}
      OR n.author % ${query}
    )
    ${genre ? Prisma.sql`AND ${genre} = ANY(n.genres)` : Prisma.empty}
    ${mediaType ? Prisma.sql`AND n.media_type = ${mediaType}` : Prisma.empty}
    ORDER BY
      (n.title ILIKE ${like} OR n.native_title ILIKE ${like}) DESC,
      GREATEST(
        similarity(n.title, ${query}),
        similarity(COALESCE(n.native_title, ''), ${query}),
        similarity(COALESCE(n.author, ''), ${query})
      ) DESC,
      n.title ASC
    LIMIT ${take} OFFSET ${skip}
  `;
  return {
    ids: rows.map((r) => r.id),
    total: rows.length ? Number(rows[0].total) : 0,
  };
}
