"use client";

import { useAppContentOptional } from "@/components/app-content-context";
import { format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  getDayDetailAction,
  type DayDetailRow,
} from "@/lib/actions/history";
import {
  displayName,
  formatLoggedMinutes,
  formatMultiLogCount,
} from "@/lib/format-day-activities";
import {
  aggregateDayActivities,
  groupAggregatedBySection,
  HISTORY_SECTIONS,
} from "@/lib/history-sections";
import {
  formatSunriseLogDetail,
  isSunriseKeystoneProtocolId,
} from "@/lib/scoring";
import { formatVariantLabel } from "@/lib/protocol-variants";
import { formatPoints } from "@/lib/utils";

function ActivityRow({ r }: { r: DayDetailRow }) {
  const variant =
    r.protocolId &&
    r.variantValue != null &&
    !isSunriseKeystoneProtocolId(r.protocolId)
      ? formatVariantLabel(r.protocolId, r.variantValue)
      : null;
  const sunriseDetail =
    r.protocolId && isSunriseKeystoneProtocolId(r.protocolId)
      ? formatSunriseLogDetail(
          r.protocolId,
          r.sunriseBuffMultiplier,
          r.variantValue,
          r.durationMinutes,
        )
      : null;

  return (
    <li className="glass flex items-start justify-between gap-3 rounded-2xl p-4">
      <div>
        <p className="font-medium">
          {r.isStreakBonus ? "Streak bonus" : (r.protocolName ?? "Activity")}
        </p>
        <p className="text-xs text-muted">
          {variant
            ? `${variant} · `
            : sunriseDetail
              ? `${sunriseDetail} · `
              : ""}
          {r.durationMinutes &&
          r.protocolId &&
          !isSunriseKeystoneProtocolId(r.protocolId)
            ? `${r.durationMinutes} min · `
            : ""}
          {r.timeOfDay ?? ""}
          {r.isStreakBonus ? "consistency reward" : ""}
        </p>
      </div>
      <span className="font-semibold text-accent-2">+{r.pointsEarned}</span>
    </li>
  );
}

function AggregatedRow({
  name,
  totalMins,
  totalPoints,
  logCount,
}: {
  name: string;
  totalMins: number;
  totalPoints: number;
  logCount: number;
}) {
  return (
    <li className="glass flex items-start justify-between gap-3 rounded-2xl p-4">
      <div>
        <p className="font-medium">{name}</p>
        {totalMins > 0 ? (
          <p className="text-xs text-muted">{formatLoggedMinutes(totalMins)} logged</p>
        ) : logCount > 0 ? (
          <p className="text-xs text-muted">{formatMultiLogCount(logCount)}</p>
        ) : null}
      </div>
      <span className="font-semibold text-accent-2">+{totalPoints}</span>
    </li>
  );
}

export function HistoryDayPanel({ date }: { date: string }) {
  const content = useAppContentOptional();
  const permanentIds = useMemo(
    () => new Set(content?.permanentProtocolIds ?? []),
    [content?.permanentProtocolIds],
  );
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

  const { grouped, streakRows } = useMemo(() => {
    if (!rows) return { grouped: null, streakRows: [] as DayDetailRow[] };
    const streakRows = rows.filter((r) => r.isStreakBonus);
    const aggregated = aggregateDayActivities(rows, displayName, permanentIds);
    return {
      grouped: groupAggregatedBySection(aggregated),
      streakRows,
    };
  }, [rows, permanentIds]);

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

      {grouped && (
        <div className="space-y-5">
          {HISTORY_SECTIONS.map((section) => {
            const items = grouped.get(section.id) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={section.id} className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  {section.label}
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <AggregatedRow
                      key={item.key}
                      name={item.name}
                      totalMins={item.totalMins}
                      totalPoints={item.totalPoints}
                      logCount={item.logCount}
                    />
                  ))}
                </ul>
              </section>
            );
          })}

          {streakRows.length > 0 && (
            <section className="space-y-2">
              <ul className="space-y-2">
                {streakRows.map((r) => (
                  <ActivityRow key={r.id} r={r} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
