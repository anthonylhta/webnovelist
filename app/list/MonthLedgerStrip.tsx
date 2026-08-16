// app/list/MonthLedgerStrip.tsx
import { FolioLabel } from "@/components/FolioKit";
import type { MonthLedger } from "@/lib/folio";

/** Ink tiers for the day marks — four strengths of gold, as in the mock. */
function markClass(chapters: number): string {
  if (chapters === 0) return "border-hairline";
  if (chapters < 5) return "border-hairline bg-gold/15";
  if (chapters < 15) return "border-hairline bg-gold/35";
  if (chapters < 30) return "border-gold-dim bg-gold/55";
  return "border-gold bg-gold/80";
}

/** The library sheet's bottom strip: one mark per day this month, and the month's totals. */
export default function MonthLedgerStrip({
  ledger,
  monthLabel,
}: {
  ledger: MonthLedger;
  monthLabel: string;
}) {
  const totals = [
    { label: "chapters this month", value: ledger.chapters, hot: true },
    { label: "volumes finished", value: ledger.finished },
    { label: "ratings filed", value: ledger.ratings },
  ];
  return (
    <div className="grid grid-cols-1 border-t border-hairline sm:grid-cols-2 sm:divide-x sm:divide-hairline">
      <div className="px-4 py-3">
        <FolioLabel>{monthLabel} ledger</FolioLabel>
        <div className="flex flex-wrap gap-1">
          {ledger.days.map((chapters, i) => (
            <span
              key={i}
              title={`${monthLabel} ${i + 1} · ${chapters} chapter${chapters !== 1 ? "s" : ""}`}
              className={`h-3.5 w-3.5 rounded-[2px] border ${markClass(chapters)}`}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-hairline px-4 py-3 font-mono text-[11px] tabular-nums sm:border-t-0">
        {totals.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between py-0.5">
            <span className="text-muted">{row.label}</span>
            <span className={row.hot ? "text-gold" : "text-body"}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
