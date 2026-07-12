"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import {
  getDayDetailAction,
  type DayDetailRow,
} from "@/lib/actions/history";
import { formatPoints } from "@/lib/utils";

export function HistoryDayPanel({ date }: { date: string }) {
  const [rows, setRows] = useState<DayDetailRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(null);
    getDayDetailAction(date)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load day");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  const total = rows?.reduce((s, r) => s + r.pointsEarned, 0) ?? 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {format(parseISO(date), "EEEE, MMMM d, yyyy")}
        {rows
          ? ` · ${rows.length} event${rows.length === 1 ? "" : "s"} · ${formatPoints(total)} pts`
          : null}
      </p>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {rows === null && !error && (
        <p className="text-sm text-muted">Loading…</p>
      )}

      {rows && rows.length === 0 && (
        <p className="text-sm text-muted">No logs this day.</p>
      )}

      {rows && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="glass flex items-start justify-between gap-3 rounded-2xl p-4"
            >
              <div>
                <p className="font-medium">
                  {r.isStreakBonus
                    ? "Streak bonus"
                    : r.protocolName ?? "Activity"}
                </p>
                <p className="text-xs text-muted">
                  {r.durationMinutes ? `${r.durationMinutes} min · ` : ""}
                  {r.timeOfDay ?? ""}
                  {r.isStreakBonus ? "consistency reward" : ""}
                </p>
              </div>
              <span className="font-semibold text-accent-2">
                +{r.pointsEarned}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
