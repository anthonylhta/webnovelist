// scripts/import-novels.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(
    fs.readFileSync('scripts/novels-backup.json', 'utf-8')
  );

  console.log(`📦 Found ${data.length} novels to import\n`);

  let added = 0;
  const skipped = 0;
  let updated = 0;

  for (const novel of data) {
    const existing = await prisma.novel.findFirst({
      where: { title: novel.title },
    });

    if (existing) {
      // Update existing novel with latest data (including cover images)
      await prisma.novel.update({
        where: { id: existing.id },
        data: {
          nativeTitle: novel.nativeTitle,
          author: novel.author,
          description: novel.description,
          coverImageUrl: novel.coverImageUrl,
          totalChapters: novel.totalChapters,
          status: novel.status,
          genres: novel.genres,
          tags: novel.tags,
          originalSource: novel.originalSource,
          yearPublished: novel.yearPublished,
        },
      });
      console.log(`  🔄 Updated: ${novel.title}`);
      updated++;
    } else {
      await prisma.novel.create({
        data: {
          title: novel.title,
          nativeTitle: novel.nativeTitle,
          author: novel.author,
          description: novel.description,
          coverImageUrl: novel.coverImageUrl,
          totalChapters: novel.totalChapters,
          status: novel.status,
          genres: novel.genres,
          tags: novel.tags,
          originalSource: novel.originalSource,
          yearPublished: novel.yearPublished,
        },
      });
      console.log(`  ✅ Added: ${novel.title}`);
      added++;
    }
  }

  console.log(`\n🎉 Done! Added: ${added}, Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());