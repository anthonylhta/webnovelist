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
    // Build a map of date → count for the last 52 weeks
    const counts: Record<string, number> = {};
    let total = 0;

    activities.forEach((activity) => {
      const date = new Date(activity.createdAt).toISOString().split("T")[0];
      counts[date] = (counts[date] || 0) + 1;
      total++;
    });

    // Generate all days for the last 52 weeks
    const today = new Date();
    const days: { date: string; count: number; dayOfWeek: number }[] = [];

    // Start from the beginning of the week 52 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - 363); // ~52 weeks
    // Align to start of week (Sunday)
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

    // Group into weeks
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

  const getMonthLabels = () => {
    const labels: { text: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      if (week.length === 0) return;
      const firstDay = new Date(week[0].date);
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        labels.push({
          text: firstDay.toLocaleString("en-US", { month: "short" }),
          index: weekIndex,
        });
        lastMonth = month;
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <div>
      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className="text-xs text-gray-500"
            style={{
              position: "relative",
              left: `${label.index * 13}px`,
              marginRight: i < monthLabels.length - 1
                ? `${((monthLabels[i + 1]?.index || 0) - label.index) * 13 - 30}px`
                : "0px",
            }}
          >
            {label.text}
          </div>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 shrink-0">
          <div className="h-[11px]" /> {/* Empty for alignment */}
          <div className="h-[11px] text-[10px] text-gray-500 leading-[11px]">Mon</div>
          <div className="h-[11px]" />
          <div className="h-[11px] text-[10px] text-gray-500 leading-[11px]">Wed</div>
          <div className="h-[11px]" />
          <div className="h-[11px] text-[10px] text-gray-500 leading-[11px]">Fri</div>
          <div className="h-[11px]" />
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-[11px] h-[11px] rounded-sm ${getColor(day.count)} transition-colors`}
                  title={`${day.date}: ${day.count} update${day.count !== 1 ? "s" : ""}`}
                />
              ))}
              {/* Pad incomplete weeks */}
              {week.length < 7 &&
                Array.from({ length: 7 - week.length }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-[11px] h-[11px]" />
                ))}
            </div>
          ))}
        </div>
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