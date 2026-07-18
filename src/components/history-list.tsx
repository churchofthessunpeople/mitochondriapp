"use client";

import { useAppContentOptional } from "@/components/app-content-context";
import { format, parseISO } from "date-fns";
import { Copy } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useToast } from "@/components/toast";
import { getDayDetailAction, getPreviousWeekCopyAction } from "@/lib/actions/history";
import { formatDayActivitiesCopy } from "@/lib/format-day-activities";
import { getPreviousWeekRange } from "@/lib/week-range";
import { cn, formatPoints } from "@/lib/utils";

function WeekCopyBar({
  weekShortLabel,
  copyingWeek,
  onCopy,
}: {
  weekShortLabel: string;
  copyingWeek: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted">
        Previous week · Sun–Sun · {weekShortLabel}
      </p>
      <button
        type="button"
        onClick={onCopy}
        disabled={copyingWeek}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:border-accent/40 hover:text-accent disabled:opacity-50",
          copyingWeek && "animate-pulse",
        )}
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />
        {copyingWeek ? "Copying…" : "Copy last week"}
      </button>
    </div>
  );
}

export function HistoryList({
  rows,
  onSelectDay,
  timeZone = "UTC",
}: {
  rows: { date: string; points: number; count: number }[];
  /** When set, day rows open an in-page card instead of navigating. */
  onSelectDay?: (date: string) => void;
  timeZone?: string;
}) {
  const content = useAppContentOptional();
  const permanentIds = useMemo(
    () => new Set(content?.permanentProtocolIds ?? []),
    [content?.permanentProtocolIds],
  );
  const { push } = useToast();
  const [copyingDate, setCopyingDate] = useState<string | null>(null);
  const [copyingWeek, setCopyingWeek] = useState(false);
  const [, startCopy] = useTransition();

  const previousWeek = useMemo(
    () => getPreviousWeekRange(timeZone),
    [timeZone],
  );
  const weekShortLabel = useMemo(() => {
    const start = format(parseISO(previousWeek.start), "MMM d");
    const end = format(
      parseISO(previousWeek.endExclusive),
      "MMM d",
    );
    return `${start} – ${end}`;
  }, [previousWeek]);

  function copyDay(date: string) {
    setCopyingDate(date);
    startCopy(async () => {
      try {
        const detail = await getDayDetailAction(date);
        const text = formatDayActivitiesCopy(date, detail, permanentIds);
        await navigator.clipboard.writeText(text);
        push("Activities copied");
      } catch {
        push("Could not copy activities", "err");
      } finally {
        setCopyingDate(null);
      }
    });
  }

  function copyPreviousWeek() {
    setCopyingWeek(true);
    startCopy(async () => {
      try {
        const { text } = await getPreviousWeekCopyAction(timeZone);
        await navigator.clipboard.writeText(text);
        push("Last week copied");
      } catch {
        push("Could not copy last week", "err");
      } finally {
        setCopyingWeek(false);
      }
    });
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <WeekCopyBar
          weekShortLabel={weekShortLabel}
          copyingWeek={copyingWeek}
          onCopy={copyPreviousWeek}
        />
        <div className="glass rounded-3xl px-6 py-12 text-center text-sm text-muted">
          No history yet. Log today&apos;s protocols to start.
        </div>
      </div>
    );
  }

  const maxPoints = Math.max(...rows.map((r) => r.points), 1);

  return (
    <div className="space-y-3">
      <WeekCopyBar
        weekShortLabel={weekShortLabel}
        copyingWeek={copyingWeek}
        onCopy={copyPreviousWeek}
      />

      {rows.map((row) => {
        const width = Math.max(8, Math.round((row.points / maxPoints) * 100));
        const copying = copyingDate === row.date;
        const dateLabel = format(parseISO(row.date), "EEEE, MMM d");

        return (
          <div
            key={row.date}
            className="glass flex items-stretch gap-2 rounded-2xl p-4"
          >
            {onSelectDay ? (
              <button
                type="button"
                onClick={() => onSelectDay(row.date)}
                className="min-w-0 flex-1 text-left transition hover:opacity-90"
              >
                <p className="font-medium">{dateLabel}</p>
                <p className="text-xs text-muted">
                  {row.count} log{row.count === 1 ? "" : "s"} · tap for detail
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </button>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="font-medium">{dateLabel}</p>
                <p className="text-xs text-muted">
                  {row.count} log{row.count === 1 ? "" : "s"}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex shrink-0 flex-col items-end justify-between gap-2">
              <button
                type="button"
                onClick={() => copyDay(row.date)}
                disabled={copying || row.count === 0}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent/40 hover:text-accent disabled:opacity-40",
                  copying && "animate-pulse",
                )}
                aria-label={`Copy activities for ${format(parseISO(row.date), "MMMM d")}`}
                title="Copy activities"
              >
                <Copy className="h-4 w-4" strokeWidth={2.25} />
              </button>
              <p className="text-lg font-semibold tabular-nums text-accent">
                {formatPoints(row.points)} pts
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
