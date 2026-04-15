-- AlterTable
ALTER TABLE "user_novel_list" ADD COLUMN     "is_favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_favorite_authors" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_authors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_authors_user_id_author_name_key" ON "user_favorite_authors"("user_id", "author_name");

-- AddForeignKey
ALTER TABLE "user_favorite_authors" ADD CONSTRAINT "user_favorite_authors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
