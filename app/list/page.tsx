// app/list/page.tsx
import { redirect } from "next/navigation";
import { calendar, formatDate, startOfDay, toKey } from "@/lib/time";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { buildMonthLedger } from "@/lib/folio";
import LibraryList from "./LibraryList";

export default async function ListPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const now = new Date();
  const { year, month } = calendar(now);
  const activities = await prisma.activity.findMany({
    where: {
      userId: currentUser.id,
      createdAt: { gte: startOfDay(toKey(year, month, 1)) },
    },
    select: { type: true, novelId: true, detail: true, createdAt: true },
  });

  return (
    <LibraryList
      ledger={buildMonthLedger(activities, now)}
      monthLabel={formatDate(now, { month: "long" })}
    />
  );
}
