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
 * title, native title, author or an alternative title (ILIKE — the first three
 * backed by the trigram GIN indexes) or when it is trigram-similar to any of
 * them (`%`, pg_trgm's default 0.3 threshold — catches "reverand insanity").
 * Substring hits sort first, then by best similarity, then title. Alternative
 * titles ("LOTM", romaji) are unnested per row — unindexed, fine at catalog
 * scale; see ADR 0030 for the upgrade path.
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
      OR EXISTS (SELECT 1 FROM unnest(n.alt_titles) AS alt WHERE alt ILIKE ${like} OR alt % ${query})
    )
    ${genre ? Prisma.sql`AND ${genre} = ANY(n.genres)` : Prisma.empty}
    ${mediaType ? Prisma.sql`AND n.media_type = ${mediaType}` : Prisma.empty}
    ORDER BY
      (
        n.title ILIKE ${like} OR n.native_title ILIKE ${like}
        OR EXISTS (SELECT 1 FROM unnest(n.alt_titles) AS alt WHERE alt ILIKE ${like})
      ) DESC,
      GREATEST(
        similarity(n.title, ${query}),
        similarity(COALESCE(n.native_title, ''), ${query}),
        similarity(COALESCE(n.author, ''), ${query}),
        COALESCE((SELECT MAX(similarity(alt, ${query})) FROM unnest(n.alt_titles) AS alt), 0)
      ) DESC,
      n.title ASC
    LIMIT ${take} OFFSET ${skip}
  `;
  return {
    ids: rows.map((r) => r.id),
    total: rows.length ? Number(rows[0].total) : 0,
  };
}

/**
 * The catalog row whose title *or* one of its alternative titles equals `title`
 * (case-insensitive) — how the importers link a foreign list entry to a title
 * we already have. Null when nothing matches.
 */
export async function findNovelIdByAnyTitle(title: string): Promise<number | null> {
  const t = title.trim();
  if (!t) return null;
  const rows = await prisma.$queryRaw<{ id: number }[]>`
    SELECT n.id
    FROM novels n
    WHERE lower(n.title) = lower(${t})
       OR EXISTS (SELECT 1 FROM unnest(n.alt_titles) AS alt WHERE lower(alt) = lower(${t}))
    ORDER BY (lower(n.title) = lower(${t})) DESC, n.id ASC
    LIMIT 1
  `;
  return rows[0]?.id ?? null;
}
