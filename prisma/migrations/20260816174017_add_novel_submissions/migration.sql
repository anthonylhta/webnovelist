-- CreateTable
CREATE TABLE "novel_submissions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "native_title" TEXT,
    "media_type" TEXT NOT NULL DEFAULT 'webnovel',
    "author" TEXT,
    "source_url" TEXT,
    "description" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "novel_id" INTEGER,
    "review_note" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "novel_submissions_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "novel_submissions_status_created_at_idx" ON "novel_submissions"("status", "created_at");
-- CreateIndex
CREATE INDEX "novel_submissions_user_id_idx" ON "novel_submissions"("user_id");
-- AddForeignKey
ALTER TABLE "novel_submissions" ADD CONSTRAINT "novel_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "novel_submissions" ADD CONSTRAINT "novel_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "novel_submissions" ADD CONSTRAINT "novel_submissions_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
