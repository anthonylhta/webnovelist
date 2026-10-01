// scripts/plan-to-read.ts
// Bulk-add titles to a user's plan-to-read list from a JSON file, creating
// catalog rows for titles that aren't there yet. Never touches an existing
// list entry. Usage (prod): npx dotenv-cli -e .env.prod -- npx tsx scripts/plan-to-read.ts <list.json> [--dry-run]
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { findNovelIdByAnyTitle } from "../lib/search";

type Entry = {
  title: string;
  nativeTitle?: string;
  altTitles?: string[];
  author?: string;
  mediaType?: string;
  description?: string;
  totalChapters?: number;
  yearPublished?: number;
  genres?: string[];
  tags?: string[];
};

const prisma = new PrismaClient();
const username = process.env.LIST_USERNAME ?? "mando";

async function main() {
  const [file, flag] = process.argv.slice(2);
  if (!file) throw new Error("usage: plan-to-read.ts <list.json> [--dry-run]");
  const dryRun = flag === "--dry-run";
  const entries: Entry[] = JSON.parse(fs.readFileSync(file, "utf-8"));

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error(`no user "${username}"`);
  console.log(
    `📦 ${entries.length} titles → ${username}'s plan-to-read${dryRun ? " (dry run)" : ""}\n`,
  );

  let created = 0;
  let added = 0;
  let skipped = 0;

  for (const entry of entries) {
    let novelId = await findNovelIdByAnyTitle(entry.title);
    if (novelId === null && entry.nativeTitle) {
      const byNative = await prisma.novel.findFirst({
        where: { nativeTitle: entry.nativeTitle },
      });
      novelId = byNative?.id ?? null;
    }

    if (novelId === null) {
      console.log(`  ✨ New catalog row + plan to read: ${entry.title}`);
      created++;
      added++;
      if (dryRun) continue;
      const novel = await prisma.novel.create({
        data: {
          title: entry.title,
          nativeTitle: entry.nativeTitle ?? null,
          altTitles: entry.altTitles ?? [],
          mediaType: entry.mediaType ?? "novel",
          author: entry.author ?? null,
          description: entry.description ?? null,
          totalChapters: entry.totalChapters ?? null,
          status: "Completed",
          genres: entry.genres ?? [],
          tags: entry.tags ?? [],
          yearPublished: entry.yearPublished ?? null,
        },
      });
      novelId = novel.id;
    } else {
      const existing = await prisma.userNovelList.findUnique({
        where: { userId_novelId: { userId: user.id, novelId } },
      });
      if (existing) {
        console.log(
          `  ⏭️  Already on the list (${existing.status}): ${entry.title}`,
        );
        skipped++;
        continue;
      }
      console.log(`  ✅ Plan to read: ${entry.title}`);
      added++;
      if (dryRun) continue;
    }

    await prisma.userNovelList.create({
      data: { userId: user.id, novelId, status: "plan_to_read" },
    });
  }

  console.log(
    `\n🎉 Done. Catalog rows created: ${created}, list entries added: ${added}, skipped: ${skipped}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
