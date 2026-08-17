-- AlterTable
ALTER TABLE "novels" ADD COLUMN     "alt_titles" TEXT[] DEFAULT ARRAY[]::TEXT[];
