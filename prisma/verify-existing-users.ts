// prisma/verify-existing-users.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Mark all existing users as verified
  const result = await prisma.user.updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true },
  });

  console.log(`✅ Marked ${result.count} existing users as verified`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());