// scripts/export-novels.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const novels = await prisma.novel.findMany();
  
  fs.writeFileSync(
    'scripts/novels-backup.json',
    JSON.stringify(novels, null, 2)
  );

  console.log(`✅ Exported ${novels.length} novels to scripts/novels-backup.json`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());