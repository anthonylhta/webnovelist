// app/list/page.tsx
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { buildMonthLedger } from "@/lib/folio";
import LibraryList from "./LibraryList";

export default async function ListPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in");

  const now = new Date();
  const activities = await prisma.activity.findMany({
    where: {
      userId: currentUser.id,
      createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
    },
    select: { type: true, novelId: true, detail: true, createdAt: true },
  });

  return (
    <LibraryList
      ledger={buildMonthLedger(activities, now)}
      monthLabel={now.toLocaleDateString("en-US", { month: "long" })}
    />
  );
}
