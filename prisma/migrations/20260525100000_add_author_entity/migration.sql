-- DropIndex
DROP INDEX "user_favorite_authors_user_id_author_name_key";

-- AlterTable
ALTER TABLE "novels" ADD COLUMN "author_id" INTEGER;

-- Clear existing favourite-author rows before restructuring the table
-- (old rows reference author names with no matching Author entity)
TRUNCATE TABLE "user_favorite_authors";

-- AlterTable
ALTER TABLE "user_favorite_authors" DROP COLUMN "author_name",
ADD COLUMN "author_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "authors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authors_name_key" ON "authors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_authors_user_id_author_id_key" ON "user_favorite_authors"("user_id", "author_id");

-- AddForeignKey
ALTER TABLE "novels" ADD CONSTRAINT "novels_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_authors" ADD CONSTRAINT "user_favorite_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
