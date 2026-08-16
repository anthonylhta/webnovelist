-- CreateTable
CREATE TABLE "novel_relations" (
    "id" SERIAL NOT NULL,
    "from_id" INTEGER NOT NULL,
    "to_id" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "novel_relations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "novel_relations_to_id_idx" ON "novel_relations"("to_id");

-- CreateIndex
CREATE UNIQUE INDEX "novel_relations_from_id_to_id_kind_key" ON "novel_relations"("from_id", "to_id", "kind");

-- AddForeignKey
ALTER TABLE "novel_relations" ADD CONSTRAINT "novel_relations_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novel_relations" ADD CONSTRAINT "novel_relations_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "novels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
