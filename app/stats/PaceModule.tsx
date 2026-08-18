// app/stats/PaceModule.tsx
import Link from "next/link";
import { FolioLabel } from "@/components/FolioKit";
import type { PaceStats } from "@/lib/pace";

export type FinishEstimate = {
  novelId: number;
  title: string;
  remaining: number;
  days: number;
};

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Column chart in the ledger idiom: one gold-dim bar per bucket, label beneath. */
function Columns({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1">
      {values.map((v, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="font-mono text-[9px] text-faint tabular-nums">{v > 0 ? v : ""}</span>
          <span
            title={`${labels[i]} · ${v} chapter${v !== 1 ? "s" : ""}`}
            className="flex h-14 w-full items-end overflow-hidden bg-elevated"
          >
            <span className="block w-full bg-gold-dim" style={{ height: `${(v / max) * 100}%` }} />
          </span>
          <span className="font-mono text-[9px] text-muted">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/** The stats sheet's pace module: windows, streaks, rhythms, and finish estimates. */
export default function PaceModule({
  pace,
  estimates,
}: {
  pace: PaceStats;
  estimates: FinishEstimate[];
}) {
  const cells = [
    { label: "30-day pace", value: pace.perDay.toFixed(1), unit: "ch / day" },
    { label: "streak", value: String(pace.currentStreak), unit: pace.currentStreak === 1 ? "day" : "days" },
    { label: "longest streak", value: String(pace.longestStreak), unit: pace.longestStreak === 1 ? "day" : "days" },
    { label: "active days", value: String(pace.activeDays), unit: "of 90" },
  ];
  const windows = [
    { label: "7d", value: pace.chapters.week },
    { label: "30d", value: pace.chapters.month },
    { label: "90d", value: pace.chapters.quarter },
    { label: "365d", value: pace.chapters.year },
  ];

  return (
    <>
      <div className="grid grid-cols-2 divide-x divide-hairline border-b border-hairline sm:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">{cell.label}</p>
            <p className="mt-1.5 font-mono text-base text-paper tabular-nums">
              {cell.value}
              <span className="ml-1.5 text-[10px] text-muted">{cell.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel
          right={windows.map((w) => `${w.label} ${w.value.toLocaleString()}`).join(" · ")}
        >
          Pace
        </FolioLabel>
        {pace.chapters.year === 0 ? (
          <p className="font-serif text-[14.5px] text-muted">
            No chapters logged this year. Mark progress from the{" "}
            <Link href="/list" className="text-gold transition hover:text-gold-bright">
              library
            </Link>{" "}
            and the rhythm shows up here.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[3fr_2fr]">
            <div>
              <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint">
                by month
              </p>
              <Columns values={pace.months.map((m) => m.chapters)} labels={pace.months.map((m) => m.label)} />
            </div>
            <div>
              <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-faint">
                by weekday
              </p>
              <Columns values={pace.weekdays} labels={WEEKDAYS} />
            </div>
          </div>
        )}
        {pace.bestDay && (
          <p className="mt-3 font-mono text-[10.5px] text-muted tabular-nums">
            best day ·{" "}
            <span className="text-body">
              {pace.bestDay.date
                .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                .toLowerCase()}
            </span>{" "}
            · <span className="text-gold">{pace.bestDay.chapters} chapters</span>
          </p>
        )}
      </div>

      <div className="border-b border-hairline px-4 py-4">
        <FolioLabel right={pace.perDay > 0 ? `at ${pace.perDay.toFixed(1)} ch / day` : undefined}>
          At this pace
        </FolioLabel>
        {estimates.length === 0 ? (
          <p className="font-serif text-[14.5px] text-muted">
            {pace.perDay > 0
              ? "Nothing in progress with a known chapter count."
              : "Log a few chapters and the finish estimates appear here."}
          </p>
        ) : (
          <div className="divide-y divide-hairline">
            {estimates.map((e) => (
              <div key={e.novelId} className="flex items-baseline gap-2.5 py-2 first:pt-0 last:pb-0">
                <Link
                  href={`/novel/${e.novelId}`}
                  className="min-w-0 truncate font-serif text-[14.5px] text-paper transition hover:text-gold"
                >
                  {e.title}
                </Link>
                <span aria-hidden className="leader-dots flex-1" />
                <span className="shrink-0 font-mono text-[10.5px] text-muted tabular-nums">
                  {e.remaining.toLocaleString()} left ·{" "}
                  <span className="text-gold">
                    ~{e.days} day{e.days !== 1 ? "s" : ""}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
