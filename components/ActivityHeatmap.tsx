// components/ActivityHeatmap.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { dayKey, shiftDay, weekday } from "@/lib/time";

interface Activity {
  createdAt: string | Date;
}

interface ActivityHeatmapProps {
  activities: Activity[];
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Zero-based month of a day key (see lib/time.ts). */
const monthOf = (key: number) => Math.floor((key % 10000) / 100) - 1;
/** "2026-08-15" for a day key. */
const isoDay = (key: number) => String(key).replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");

export default function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const { weeks, monthLabels, maxCount } = useMemo(() => {
    const counts: Record<number, number> = {};

    activities.forEach((activity) => {
      const key = dayKey(new Date(activity.createdAt));
      counts[key] = (counts[key] || 0) + 1;
    });

    const today = dayKey(new Date());
    const days: { key: number; count: number; dayOfWeek: number }[] = [];

    const yearAgo = shiftDay(today, -363);
    const start = shiftDay(yearAgo, -weekday(yearAgo));

    for (let key = start; key <= today; key = shiftDay(key, 1)) {
      days.push({
        key,
        count: counts[key] || 0,
        dayOfWeek: weekday(key),
      });
    }

    const weekGroups: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekGroups.push(days.slice(i, i + 7));
    }

    // One label per calendar month, on the first week that starts inside it.
    const labels: (string | null)[] = weekGroups.map((week, i) => {
      const month = monthOf(week[0].key);
      if (i === 0) return null; // the year-ago edge is usually a partial month
      const prevMonth = monthOf(weekGroups[i - 1][0].key);
      return month !== prevMonth ? MONTHS[month] : null;
    });

    const max = Math.max(...Object.values(counts), 1);

    return { weeks: weekGroups, monthLabels: labels, maxCount: max };
  }, [activities]);

  // Open narrow viewports on the newest weeks. Scroll position isn't layout,
  // so the deterministic no-CLS render is preserved.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const getColor = (count: number) => {
    if (count === 0) return "bg-elevated";
    const intensity = count / maxCount;
    if (intensity <= 0.25) return "bg-gold/20";
    if (intensity <= 0.5) return "bg-gold/40";
    if (intensity <= 0.75) return "bg-gold/70";
    return "bg-gold";
  };

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
        <div className="w-max">
          {/* Month markers, one column per week to stay in lockstep with the grid */}
          <div className="mb-1 flex gap-0.5">
            {monthLabels.map((label, i) => (
              <div key={i} className="relative h-3 w-[11px] shrink-0">
                {label && (
                  <span className="absolute left-0 top-0 whitespace-nowrap font-mono text-[9px] text-faint">
                    {label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-0.5">
                {week.map((day) => (
                  <div
                    key={day.key}
                    className={`w-[11px] h-[11px] rounded-sm ${getColor(day.count)} transition-colors`}
                    title={`${isoDay(day.key)}: ${day.count} update${day.count !== 1 ? "s" : ""}`}
                  />
                ))}
                {week.length < 7 &&
                  Array.from({ length: 7 - week.length }).map((_, i) => (
                    <div key={`pad-${i}`} className="w-[11px] h-[11px]" />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2.5 flex items-center justify-end gap-1 font-mono text-[9.5px] text-faint">
        <span className="mr-1">less</span>
        <div className="w-[11px] h-[11px] rounded-sm bg-elevated" />
        <div className="w-[11px] h-[11px] rounded-sm bg-gold/20" />
        <div className="w-[11px] h-[11px] rounded-sm bg-gold/40" />
        <div className="w-[11px] h-[11px] rounded-sm bg-gold/70" />
        <div className="w-[11px] h-[11px] rounded-sm bg-gold" />
        <span className="ml-1">more</span>
      </div>
    </div>
  );
} 