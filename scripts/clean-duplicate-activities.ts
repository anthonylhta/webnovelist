import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find duplicates: same user, type, novelId, detail within 2 minutes of each other
  const activities = await prisma.activity.findMany({
    orderBy: [
      { userId: "asc" },
      { type: "asc" },
      { novelId: "asc" },
      { detail: "asc" },
      { createdAt: "asc" },
    ],
  });

  const toDelete: number[] = [];

  for (let i = 1; i < activities.length; i++) {
    const prev = activities[i - 1];
    const curr = activities[i];

    if (
      prev.userId === curr.userId &&
      prev.type === curr.type &&
      prev.novelId === curr.novelId &&
      prev.detail === curr.detail
    ) {
      const diff = curr.createdAt.getTime() - prev.createdAt.getTime();
      if (diff < 2 * 60 * 1000) {
        toDelete.push(curr.id);
      }
    }
  }

  if (toDelete.length === 0) {
    console.log("No duplicates found!");
    return;
  }

  console.log(`Found ${toDelete.length} duplicates. Deleting...`);

  await prisma.activity.deleteMany({
    where: { id: { in: toDelete } },
  });

  console.log(`Deleted ${toDelete.length} duplicate activities.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());