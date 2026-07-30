-- The DEFAULT backfills every existing row as a webnovel
ALTER TABLE "novels" ADD COLUMN "media_type" TEXT NOT NULL DEFAULT 'webnovel';

-- AniList media id, for import dedup (re-imports upsert instead of duplicating)
ALTER TABLE "novels" ADD COLUMN "anilist_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "novels_anilist_id_key" ON "novels"("anilist_id");
