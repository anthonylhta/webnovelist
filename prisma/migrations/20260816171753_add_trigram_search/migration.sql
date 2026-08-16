-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateIndex
CREATE INDEX "novels_title_trgm_idx" ON "novels" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "novels_native_title_trgm_idx" ON "novels" USING GIN ("native_title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "novels_author_trgm_idx" ON "novels" USING GIN ("author" gin_trgm_ops);
