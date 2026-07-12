"use client";

import { format, parseISO } from "date-fns";
import { formatPoints } from "@/lib/utils";

export function HistoryList({
  rows,
  onSelectDay,
}: {
  rows: { date: string; points: number; count: number }[];
  /** When set, day rows open an in-page card instead of navigating. */
  onSelectDay?: (date: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="glass rounded-3xl px-6 py-12 text-center text-sm text-muted">
        No history yet. Log today&apos;s protocols to start.
      </div>
    );
  }

  const maxPoints = Math.max(...rows.map((r) => r.points), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const width = Math.max(8, Math.round((row.points / maxPoints) * 100));
        const inner = (
          <>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {format(parseISO(row.date), "EEEE, MMM d")}
                </p>
                <p className="text-xs text-muted">
                  {row.count} log{row.count === 1 ? "" : "s"}
                  {onSelectDay ? " · tap for detail" : ""}
                </p>
              </div>
              <p className="text-lg font-semibold tabular-nums text-accent">
                {formatPoints(row.points)} pts
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                style={{ width: `${width}%` }}
              />
            </div>
          </>
        );

        if (onSelectDay) {
          return (
            <button
              key={row.date}
              type="button"
              onClick={() => onSelectDay(row.date)}
              className="glass block w-full rounded-2xl p-4 text-left transition hover:border-accent/30"
            >
              {inner}
            </button>
          );
        }

        return (
          <div key={row.date} className="glass rounded-2xl p-4">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
