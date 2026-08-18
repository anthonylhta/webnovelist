// scripts/copy-database.ts — copy every app table from one Postgres to another,
// preserving ids, in FK order. Built for the Seoul → Sydney Supabase move
// (ADR 0035); reusable for any future region hop or prod → scratch clone.
//
//   SOURCE_DATABASE_URL=… TARGET_DATABASE_URL=… npx tsx scripts/copy-database.ts
//
// Use *direct* (5432) URLs, not the pgBouncer pooler. The target must already
// carry the schema (`prisma migrate deploy` against it first) and must be
// empty — the script refuses to write into a target that has users or novels.
import { PrismaClient } from "@prisma/client";

const source = new PrismaClient({ datasourceUrl: required("SOURCE_DATABASE_URL") });
const target = new PrismaClient({ datasourceUrl: required("TARGET_DATABASE_URL") });

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

// Parents before children. Each entry: Prisma delegate name + the mapped SQL
// table (for the sequence reset) + whether its id is a serial.
const TABLES: { model: string; table: string; serial: boolean }[] = [
  { model: "user", table: "users", serial: false },
  { model: "author", table: "authors", serial: true },
  { model: "novel", table: "novels", serial: true },
  { model: "character", table: "characters", serial: true },
  { model: "novelRelation", table: "novel_relations", serial: true },
  { model: "novelSubmission", table: "novel_submissions", serial: true },
  { model: "userNovelList", table: "user_novel_list", serial: true },
  { model: "activity", table: "activities", serial: true },
  { model: "userFavoriteAuthor", table: "user_favorite_authors", serial: true },
  { model: "userFavoriteCharacter", table: "user_favorite_characters", serial: true },
  { model: "follow", table: "follows", serial: true },
];

const BATCH = 500;

// The delegates share the same findMany/createMany/count shape; index by name.
type Delegate = {
  findMany: (args: { orderBy: { id: "asc" }; skip: number; take: number }) => Promise<Record<string, unknown>[]>;
  createMany: (args: { data: Record<string, unknown>[] }) => Promise<{ count: number }>;
  count: () => Promise<number>;
};
const delegate = (client: PrismaClient, model: string) =>
  (client as unknown as Record<string, Delegate>)[model];

async function main() {
  const [targetUsers, targetNovels] = await Promise.all([target.user.count(), target.novel.count()]);
  if (targetUsers > 0 || targetNovels > 0) {
    throw new Error(`Target is not empty (${targetUsers} users, ${targetNovels} novels) — refusing to copy.`);
  }

  for (const { model, table, serial } of TABLES) {
    const from = delegate(source, model);
    const to = delegate(target, model);
    const total = await from.count();
    let copied = 0;
    for (let skip = 0; skip < total; skip += BATCH) {
      const rows = await from.findMany({ orderBy: { id: "asc" }, skip, take: BATCH });
      if (rows.length === 0) break;
      const res = await to.createMany({ data: rows });
      copied += res.count;
    }
    if (serial && copied > 0) {
      await target.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), (SELECT MAX(id) FROM "${table}"), true)`
      );
    }
    const check = await to.count();
    const mark = check === total ? "✓" : "✗";
    console.log(`${mark} ${table.padEnd(26)} ${String(copied).padStart(6)} / ${total}`);
    if (check !== total) throw new Error(`Row count mismatch on ${table}: source ${total}, target ${check}`);
  }
  console.log("\nCopy complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await Promise.all([source.$disconnect(), target.$disconnect()]);
  });
