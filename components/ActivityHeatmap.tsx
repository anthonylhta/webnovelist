// components/ActivityHeatmap.tsx
"use client";

import { useMemo } from "react";

interface Activity {
  createdAt: string | Date;
}

interface ActivityHeatmapProps {
  activities: Activity[];
}

export default function ActivityHeatmap({ activities }: ActivityHeatmapProps) {
  const { weeks, totalActivities, maxCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;

    activities.forEach((activity) => {
      const date = new Date(activity.createdAt).toISOString().split("T")[0];
      counts[date] = (counts[date] || 0) + 1;
      total++;
    });

    const today = new Date();
    const days: { date: string; count: number; dayOfWeek: number }[] = [];

    const start = new Date(today);
    start.setDate(start.getDate() - 363);
    start.setDate(start.getDate() - start.getDay());

    const current = new Date(start);
    while (current <= today) {
      const dateStr = current.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        count: counts[dateStr] || 0,
        dayOfWeek: current.getDay(),
      });
      current.setDate(current.getDate() + 1);
    }

    const weekGroups: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekGroups.push(days.slice(i, i + 7));
    }

    const max = Math.max(...Object.values(counts), 1);

    return { weeks: weekGroups, totalActivities: total, maxCount: max };
  }, [activities]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-800/50";
    const intensity = count / maxCount;
    if (intensity <= 0.25) return "bg-green-900/60";
    if (intensity <= 0.5) return "bg-green-700/70";
    if (intensity <= 0.75) return "bg-green-500/80";
    return "bg-green-400";
  };

  return (
    <div>
      <div className="flex gap-0.5 justify-end">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-[11px] h-[11px] rounded-sm ${getColor(day.count)} transition-colors`}
                title={`${day.date}: ${day.count} update${day.count !== 1 ? "s" : ""}`}
              />
            ))}
            {week.length < 7 &&
              Array.from({ length: 7 - week.length }).map((_, i) => (
                <div key={`pad-${i}`} className="w-[11px] h-[11px]" />
              ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-400">
          {totalActivities} update{totalActivities !== 1 ? "s" : ""} in the last year
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Less</span>
          <div className="w-[11px] h-[11px] rounded-sm bg-gray-800/50" />
          <div className="w-[11px] h-[11px] rounded-sm bg-green-900/60" />
          <div className="w-[11px] h-[11px] rounded-sm bg-green-700/70" />
          <div className="w-[11px] h-[11px] rounded-sm bg-green-500/80" />
          <div className="w-[11px] h-[11px] rounded-sm bg-green-400" />
          <span className="text-xs text-gray-500 ml-1">More</span>
        </div>
      </div>
    </div>
  );
} 