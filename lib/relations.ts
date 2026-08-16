// Novel-to-novel relations — single source of truth for the kinds, their
// labels, and the inverse used to read a link from the other title's side.
import { prisma } from "@/lib/prisma";

/** Kinds as stored on a NovelRelation row: `to` is the <kind> of `from`. */
export const RELATION_KINDS = [
  "adaptation",
  "source",
  "sequel",
  "prequel",
  "side_story",
  "parent",
  "alternative",
  "other",
] as const;

export type RelationKind = (typeof RELATION_KINDS)[number];

export const RELATION_LABELS: Record<RelationKind, string> = {
  adaptation: "adaptation",
  source: "source material",
  sequel: "sequel",
  prequel: "prequel",
  side_story: "side story",
  parent: "parent story",
  alternative: "alternative version",
  other: "related",
};

/** Reading the same row from `to`'s side: what `from` is to `to`. */
export const INVERSE_KIND: Record<RelationKind, RelationKind> = {
  adaptation: "source",
  source: "adaptation",
  sequel: "prequel",
  prequel: "sequel",
  side_story: "parent",
  parent: "side_story",
  alternative: "alternative",
  other: "other",
};

export function isRelationKind(value: unknown): value is RelationKind {
  return typeof value === "string" && (RELATION_KINDS as readonly string[]).includes(value);
}

export function relationLabel(kind: string): string {
  return isRelationKind(kind) ? RELATION_LABELS[kind] : kind;
}

export type RelatedNovel = {
  /** The relation row — pass to DELETE. */
  relationId: number;
  /** What the other title is to this one. */
  kind: string;
  novel: {
    id: number;
    title: string;
    nativeTitle: string | null;
    mediaType: string;
    coverImageUrl: string | null;
  };
};

const NOVEL_SELECT = {
  id: true,
  title: true,
  nativeTitle: true,
  mediaType: true,
  coverImageUrl: true,
} as const;

/** Every title linked to `novelId`, from either side, read from this title's point of view. */
export async function listRelations(novelId: number): Promise<RelatedNovel[]> {
  const [from, to] = await Promise.all([
    prisma.novelRelation.findMany({
      where: { fromId: novelId },
      include: { to: { select: NOVEL_SELECT } },
      orderBy: { id: "asc" },
    }),
    prisma.novelRelation.findMany({
      where: { toId: novelId },
      include: { from: { select: NOVEL_SELECT } },
      orderBy: { id: "asc" },
    }),
  ]);
  return [
    ...from.map((r) => ({ relationId: r.id, kind: r.kind, novel: r.to })),
    ...to.map((r) => ({
      relationId: r.id,
      kind: isRelationKind(r.kind) ? INVERSE_KIND[r.kind] : r.kind,
      novel: r.from,
    })),
  ];
}
