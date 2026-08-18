// Recommendations from a reader's own shelf: what they rated well, who wrote
// it, what it's tagged, what continues it, and what other readers of the same
// titles also track. `rankRecommendations` is pure (tested); `getRecommendations`
// gathers its inputs in one round trip.
import { prisma } from "@/lib/prisma";
import { INVERSE_KIND, isRelationKind, relationLabel } from "@/lib/relations";

export type LibraryEntry = {
  novelId: number;
  status: string;
  rating: number | null;
  novel: { title: string; genres: string[]; tags: string[]; author: string | null; mediaType: string };
};

export type Candidate = {
  id: number;
  title: string;
  nativeTitle: string | null;
  mediaType: string;
  genres: string[];
  tags: string[];
  author: string | null;
  /** How many readers track it — a quiet tiebreaker. */
  trackers: number;
};

/** A relation row touching one of the reader's titles, as stored (from → to is `kind`). */
export type RelationRow = { fromId: number; toId: number; kind: string };

/** "readers who track `mine` also track `candidate`" — distinct other readers. */
export type CoReaderRow = { candidate: number; mine: number; readers: number };

export type Recommendation = {
  novel: Pick<Candidate, "id" | "title" | "nativeTitle" | "mediaType">;
  score: number;
  /** One short, honest line: the strongest reason this title is here. */
  reason: string;
};

/**
 * How much one shelf entry should pull recommendations toward its genres,
 * tags and author. Status sets the base; a rating swings it — a 10 doubles it,
 * a 5 cancels it, anything lower pushes away.
 */
export function entryWeight(entry: Pick<LibraryEntry, "status" | "rating">): number {
  const base =
    { completed: 1.2, reading: 1, on_hold: 0.5, plan_to_read: 0.4, dropped: -0.5 }[entry.status] ?? 0.5;
  if (entry.rating == null) return base;
  return Math.abs(base) * ((entry.rating - 5) / 5);
}

function accumulate(map: Map<string, number>, key: string | null | undefined, weight: number) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + weight);
}

/** Scale a map so its largest positive value is 1 (negatives keep their sign). */
function normalise(map: Map<string, number>): Map<string, number> {
  const max = Math.max(0, ...map.values());
  if (max === 0) return map;
  return new Map([...map].map(([k, v]) => [k, v / max]));
}

const WEIGHTS = { genre: 2, tag: 1, author: 3, continuation: 8, coReaders: 2.5, mediaType: 0.3, trackers: 0.15 };
const MAX_BASE_WEIGHT = 1.2; // a completed, unrated title

export function rankRecommendations(
  input: {
    library: LibraryEntry[];
    candidates: Candidate[];
    relations: RelationRow[];
    coReaders: CoReaderRow[];
  },
  limit = 5
): Recommendation[] {
  const { library, candidates, relations, coReaders } = input;
  if (library.length === 0) return [];

  const genreAff = new Map<string, number>();
  const tagAff = new Map<string, number>();
  const authorAff = new Map<string, number>();
  const typeAff = new Map<string, number>();
  const titleOf = new Map<number, string>();
  const weightOf = new Map<number, number>();
  for (const e of library) {
    const w = entryWeight(e);
    titleOf.set(e.novelId, e.novel.title);
    weightOf.set(e.novelId, w);
    e.novel.genres.forEach((g) => accumulate(genreAff, g, w));
    e.novel.tags.forEach((t) => accumulate(tagAff, t, w));
    accumulate(authorAff, e.novel.author, w);
    accumulate(typeAff, e.novel.mediaType, Math.max(0, w));
  }
  const genres = normalise(genreAff);
  const tags = normalise(tagAff);
  const authors = normalise(authorAff);
  const favouriteType = [...typeAff.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  // Continuations: for each candidate, what it is to a shelf title (read from
  // the candidate's side), keeping only kinds worth following.
  const continuation = new Map<number, { kind: string; of: number }>();
  for (const r of relations) {
    if (!isRelationKind(r.kind)) continue;
    const pairs: [number, number, string][] = [
      [r.toId, r.fromId, r.kind], // `to` is the <kind> of `from`
      [r.fromId, r.toId, INVERSE_KIND[r.kind]],
    ];
    for (const [cand, mine, kind] of pairs) {
      if (!titleOf.has(mine) || titleOf.has(cand)) continue;
      if (kind === "sequel" || kind === "adaptation" || kind === "side_story" || kind === "source") {
        if (!continuation.has(cand)) continuation.set(cand, { kind, of: mine });
      }
    }
  }

  // Co-readers: total distinct readers per candidate, and the shelf title it
  // co-occurs with most (for the reason line).
  const coTotal = new Map<number, number>();
  const coBest = new Map<number, { mine: number; readers: number }>();
  for (const row of coReaders) {
    if (!titleOf.has(row.mine)) continue;
    coTotal.set(row.candidate, (coTotal.get(row.candidate) ?? 0) + row.readers);
    const best = coBest.get(row.candidate);
    if (!best || row.readers > best.readers) coBest.set(row.candidate, { mine: row.mine, readers: row.readers });
  }
  const coMax = Math.max(1, ...coTotal.values());

  const ranked = candidates.map((c) => {
    const genreHits = c.genres
      .map((g) => ({ name: g, aff: genres.get(g) ?? 0 }))
      .filter((h) => h.aff !== 0)
      .sort((a, b) => b.aff - a.aff);
    const tagHits = c.tags
      .map((t) => ({ name: t, aff: tags.get(t) ?? 0 }))
      .filter((h) => h.aff !== 0)
      .sort((a, b) => b.aff - a.aff);
    const genreScore = genreHits.reduce((s, h) => s + h.aff, 0) * WEIGHTS.genre;
    const tagScore = tagHits.reduce((s, h) => s + h.aff, 0) * WEIGHTS.tag;
    const authorAffinity = c.author ? (authors.get(c.author) ?? 0) : 0;
    const authorScore = authorAffinity * WEIGHTS.author;
    // A continuation counts in proportion to how the reader felt about what
    // it continues — the sequel of a dropped title is no recommendation.
    const cont = continuation.get(c.id);
    const contScore = cont
      ? (Math.max(0, weightOf.get(cont.of) ?? 0) / MAX_BASE_WEIGHT) * WEIGHTS.continuation
      : 0;
    const coScore = ((coTotal.get(c.id) ?? 0) / coMax) * WEIGHTS.coReaders;
    const typeScore = c.mediaType === favouriteType ? WEIGHTS.mediaType : 0;
    const popScore = Math.log1p(c.trackers) * WEIGHTS.trackers;
    const score = genreScore + tagScore + authorScore + contScore + coScore + typeScore + popScore;

    // The reason follows the strongest positive signal.
    const signals: [number, () => string][] = [
      [contScore, () => `${relationLabel(cont!.kind)} of ${titleOf.get(cont!.of)}`],
      [authorScore, () => `more from ${c.author}`],
      [
        coScore,
        () => {
          const best = coBest.get(c.id)!;
          return `also tracked by ${best.readers} reader${best.readers !== 1 ? "s" : ""} of ${titleOf.get(best.mine)}`;
        },
      ],
      [
        genreScore + tagScore,
        () => {
          const names = [...genreHits, ...tagHits]
            .filter((h) => h.aff > 0)
            .slice(0, 3)
            .map((h) => h.name.toLowerCase());
          return names.length ? `shares ${names.join(" · ")} with your shelf` : "";
        },
      ],
    ];
    const reason = signals.filter(([s]) => s > 0).sort((a, b) => b[0] - a[0])[0]?.[1]() ?? "";
    return {
      novel: { id: c.id, title: c.title, nativeTitle: c.nativeTitle, mediaType: c.mediaType },
      score,
      reason,
    };
  });

  return ranked
    .filter((r) => r.score > 0 && r.reason)
    .sort((a, b) => b.score - a.score || a.novel.title.localeCompare(b.novel.title))
    .slice(0, limit);
}

/** Recommendations for a reader — everything not already on their shelf, ranked. */
export async function getRecommendations(userId: string, limit = 5): Promise<Recommendation[]> {
  const library = await prisma.userNovelList.findMany({
    where: { userId },
    select: {
      novelId: true,
      status: true,
      rating: true,
      novel: { select: { title: true, genres: true, tags: true, author: true, mediaType: true } },
    },
  });
  if (library.length === 0) return [];
  const mine = library.map((e) => e.novelId);

  const [candidates, relations, coReaders] = await Promise.all([
    prisma.novel.findMany({
      where: { id: { notIn: mine } },
      select: {
        id: true,
        title: true,
        nativeTitle: true,
        mediaType: true,
        genres: true,
        tags: true,
        author: true,
        _count: { select: { userEntries: true } },
      },
    }),
    prisma.novelRelation.findMany({
      where: { OR: [{ fromId: { in: mine } }, { toId: { in: mine } }] },
      select: { fromId: true, toId: true, kind: true },
    }),
    prisma.$queryRaw<{ candidate: number; mine: number; readers: bigint }[]>`
      SELECT other.novel_id AS candidate, shared.novel_id AS mine,
             COUNT(DISTINCT other.user_id) AS readers
      FROM user_novel_list shared
      JOIN user_novel_list other ON other.user_id = shared.user_id
      WHERE shared.novel_id = ANY(${mine}::int[])
        AND shared.user_id <> ${userId}
        AND NOT (other.novel_id = ANY(${mine}::int[]))
      GROUP BY other.novel_id, shared.novel_id
      ORDER BY readers DESC
      LIMIT 500
    `,
  ]);

  return rankRecommendations(
    {
      library,
      candidates: candidates.map((c) => ({
        id: c.id,
        title: c.title,
        nativeTitle: c.nativeTitle,
        mediaType: c.mediaType,
        genres: c.genres,
        tags: c.tags,
        author: c.author,
        trackers: c._count.userEntries,
      })),
      relations,
      coReaders: coReaders.map((r) => ({ candidate: r.candidate, mine: r.mine, readers: Number(r.readers) })),
    },
    limit
  );
}
