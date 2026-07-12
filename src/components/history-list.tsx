import Link from "next/link";
import { format, parseISO } from "date-fns";
import { formatPoints } from "@/lib/utils";

export function HistoryList({
  rows,
  linkDays,
}: {
  rows: { date: string; points: number; count: number }[];
  linkDays?: boolean;
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
                  {linkDays ? " · tap for detail" : ""}
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

        if (linkDays) {
          return (
            <Link
              key={row.date}
              href={`/history/${row.date}`}
              className="glass block rounded-2xl p-4 transition hover:border-accent/30"
            >
              {inner}
            </Link>
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
