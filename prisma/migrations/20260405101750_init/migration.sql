-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novels" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "title_chinese" TEXT,
    "author" TEXT,
    "description" TEXT,
    "cover_image_url" TEXT,
    "total_chapters" INTEGER,
    "status" TEXT,
    "genres" TEXT[],
    "tags" TEXT[],
    "original_source" TEXT,
    "year_published" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_novel_list" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "novel_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "current_chapter" INTEGER NOT NULL DEFAULT 0,
    "date_started" TIMESTAMP(3),
    "date_finished" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_novel_list_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_novel_list_user_id_novel_id_key" ON "user_novel_list"("user_id", "novel_id");

-- AddForeignKey
ALTER TABLE "user_novel_list" ADD CONSTRAINT "user_novel_list_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_novel_list" ADD CONSTRAINT "user_novel_list_novel_id_fkey" FOREIGN KEY ("novel_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
