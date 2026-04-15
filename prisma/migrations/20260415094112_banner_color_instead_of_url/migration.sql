/*
  Warnings:

  - You are about to drop the column `banner_url` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "banner_url",
ADD COLUMN     "banner_color" TEXT;
