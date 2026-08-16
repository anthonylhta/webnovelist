-- AlterTable
ALTER TABLE "novels" ADD COLUMN     "mal_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "novels_mal_id_key" ON "novels"("mal_id");
