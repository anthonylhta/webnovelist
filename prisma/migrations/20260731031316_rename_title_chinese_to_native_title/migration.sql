-- Rename in place (not drop + add) so existing native titles are preserved
ALTER TABLE "novels" RENAME COLUMN "title_chinese" TO "native_title";
