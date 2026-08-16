import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { novelRelation: { findMany: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import {
  RELATION_KINDS,
  INVERSE_KIND,
  isRelationKind,
  relationLabel,
  listRelations,
} from "@/lib/relations";

describe("relation kinds", () => {
  it("every kind has an inverse whose inverse is itself", () => {
    for (const kind of RELATION_KINDS) {
      expect(INVERSE_KIND[INVERSE_KIND[kind]]).toBe(kind);
    }
  });

  it("guards and labels kinds, passing unknown strings through", () => {
    expect(isRelationKind("sequel")).toBe(true);
    expect(isRelationKind("remake")).toBe(false);
    expect(relationLabel("side_story")).toBe("side story");
    expect(relationLabel("remake")).toBe("remake");
  });
});

describe("listRelations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads rows from both sides, inverting the kind for incoming links", async () => {
    const webnovel = { id: 1, title: "LOTM", nativeTitle: null, mediaType: "webnovel", coverImageUrl: null };
    const manhua = { id: 2, title: "LOTM (manhua)", nativeTitle: null, mediaType: "manhua", coverImageUrl: null };
    vi.mocked(prisma.novelRelation.findMany)
      // outgoing: 2 is an adaptation of 1
      .mockResolvedValueOnce([{ id: 10, fromId: 1, toId: 2, kind: "adaptation", to: manhua }] as never)
      // incoming: 1 is the sequel of 3, i.e. 3 is 1's prequel
      .mockResolvedValueOnce([{ id: 11, fromId: 3, toId: 1, kind: "sequel", from: webnovel }] as never);

    const rows = await listRelations(1);
    expect(rows).toEqual([
      { relationId: 10, kind: "adaptation", novel: manhua },
      { relationId: 11, kind: "prequel", novel: webnovel },
    ]);
  });
});
