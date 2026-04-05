-- AlterTable
ALTER TABLE "user_novel_list" ADD COLUMN     "reading_url" TEXT,
ADD COLUMN     "reread_count" INTEGER NOT NULL DEFAULT 0;
