import { format, parseISO } from "date-fns";
import { formatPoints } from "@/lib/utils";

export function HistoryList({
  rows,
}: {
  rows: { date: string; points: number; count: number }[];
}) {
  if (rows.length === 0) {
    return (
      <div className="glass rounded-3xl px-6 py-12 text-center text-sm text-muted">
        No history yet. Log today&apos;s protocols to start your streak of days.
      </div>
    );
  }

  const maxPoints = Math.max(...rows.map((r) => r.points), 1);

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const width = Math.max(8, Math.round((row.points / maxPoints) * 100));
        return (
          <div key={row.date} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {format(parseISO(row.date), "EEEE, MMM d")}
                </p>
                <p className="text-xs text-muted">
                  {row.count} protocol{row.count === 1 ? "" : "s"} logged
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
          </div>
        );
      })}
    </div>
  );
}
