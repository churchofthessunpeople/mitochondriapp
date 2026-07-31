import {
  protocolAllowsMultiple,
  protocolShowsLogCount,
} from "@/lib/completion-dedupe";
import {
  isPermanentProtocolId,
} from "@/lib/permanent-activities";
import { isSunriseKeystoneProtocolId } from "@/lib/scoring";

export type DayActivityRow = {
  protocolName: string | null;
  protocolId?: string | null;
  /** YYYY-MM-DD — required for week-by-day history copy */
  completedOn?: string | null;
  durationMinutes: number | null;
  timeOfDay?: string | null;
  variantValue?: number | null;
  sunriseBuffMultiplier?: number | null;
  pointsEarned: number;
  isStreakBonus: boolean;
};

export type HistorySectionId = "sunrise" | "day" | "permanent";

export const HISTORY_SECTIONS: {
  id: HistorySectionId;
  label: string;
}[] = [
  { id: "sunrise", label: "Sunrise" },
  { id: "day", label: "Performed" },
  { id: "permanent", label: "Permanent" },
];

export type AggregatedActivity = {
  key: string;
  name: string;
  totalMins: number;
  totalPoints: number;
  /** Times logged for multi-log activities without a timer (or days for sunrise week totals). */
  logCount: number;
  /** How to label logCount in copy — sunrise week rollups use days. */
  countUnit: "logs" | "days";
  order: number;
  section: HistorySectionId;
};

/** Classify a logged activity for history display. */
export function historySectionForActivity(
  protocolId: string | null | undefined,
  permanentIds?: ReadonlySet<string>,
): HistorySectionId {
  if (
    protocolId &&
    (permanentIds?.has(protocolId) || isPermanentProtocolId(protocolId))
  ) {
    return "permanent";
  }
  if (protocolId && isSunriseKeystoneProtocolId(protocolId)) return "sunrise";
  return "day";
}

/** Coerce DB / JSON variant values to a truncated int key piece. */
export function coerceVariantValue(variantValue: unknown): number | null {
  if (typeof variantValue === "number" && Number.isFinite(variantValue)) {
    return Math.trunc(variantValue);
  }
  if (typeof variantValue === "string" && variantValue.trim() !== "") {
    const n = Number(variantValue);
    if (Number.isFinite(n)) return Math.trunc(n);
  }
  return null;
}

/**
 * Group key for history rows. Includes variant so distinct Outside Time /
 * water / exercise mixes stay separate instead of collapsing to the first label.
 *
 * Period (week) mode keys sunrise by protocol/tier only so one week's Open-sky
 * logs roll into a single total instead of one weather-specific line.
 */
export function activityAggregateKey(
  r: DayActivityRow,
  mode: "day" | "period" = "day",
): string {
  const base =
    r.protocolId ??
    `name:${r.protocolName?.trim() || "Activity"}`;
  if (
    mode === "period" &&
    r.protocolId &&
    isSunriseKeystoneProtocolId(r.protocolId)
  ) {
    return base;
  }
  const variant = coerceVariantValue(r.variantValue);
  if (variant != null) {
    return `${base}:v${variant}`;
  }
  return base;
}

export function aggregateDayActivities(
  rows: DayActivityRow[],
  displayName: (row: DayActivityRow) => string,
  permanentIds?: ReadonlySet<string>,
): AggregatedActivity[] {
  const activities = rows.filter((r) => !r.isStreakBonus);
  const byKey = new Map<string, AggregatedActivity>();
  let order = 0;

  for (const r of activities) {
    const name = displayName(r);
    const key = activityAggregateKey(r);
    const mins =
      r.protocolId && isSunriseKeystoneProtocolId(r.protocolId)
        ? 0
        : (r.durationMinutes ?? 0);
    const pts = r.pointsEarned;
    const allowsMultiple = protocolAllowsMultiple(r.protocolId);
    const showsLogCount = protocolShowsLogCount(r.protocolId);
    const existing = byKey.get(key);
    if (existing) {
      if (allowsMultiple) {
        existing.totalMins += mins;
        existing.totalPoints += pts;
        if (showsLogCount) existing.logCount += 1;
      }
      continue;
    }

    byKey.set(key, {
      key,
      name,
      totalMins: mins,
      totalPoints: pts,
      logCount: showsLogCount ? 1 : 0,
      countUnit: "logs",
      order: order++,
      section: historySectionForActivity(r.protocolId, permanentIds),
    });
  }

  return [...byKey.values()].sort((a, b) => a.order - b.order);
}

/** Sum activity totals across multiple days (e.g. weekly copy). */
export function aggregatePeriodActivities(
  rows: DayActivityRow[],
  displayName: (row: DayActivityRow) => string,
  permanentIds?: ReadonlySet<string>,
): AggregatedActivity[] {
  const activities = rows.filter((r) => !r.isStreakBonus);
  const byKey = new Map<string, AggregatedActivity>();
  let order = 0;

  for (const r of activities) {
    const name = displayName(r);
    const key = activityAggregateKey(r, "period");
    const isSunrise =
      !!r.protocolId && isSunriseKeystoneProtocolId(r.protocolId);
    const mins = isSunrise ? 0 : (r.durationMinutes ?? 0);
    const pts = r.pointsEarned;
    const showsLogCount = protocolShowsLogCount(r.protocolId);
    const countUnit: "logs" | "days" = isSunrise ? "days" : "logs";
    const countsEntries = showsLogCount || isSunrise;
    const existing = byKey.get(key);
    if (existing) {
      existing.totalMins += mins;
      existing.totalPoints += pts;
      if (countsEntries) existing.logCount += 1;
      continue;
    }

    byKey.set(key, {
      key,
      name,
      totalMins: mins,
      totalPoints: pts,
      logCount: countsEntries ? 1 : 0,
      countUnit,
      order: order++,
      section: historySectionForActivity(r.protocolId, permanentIds),
    });
  }

  return [...byKey.values()].sort((a, b) => a.order - b.order);
}

export function groupAggregatedBySection(
  items: AggregatedActivity[],
): Map<HistorySectionId, AggregatedActivity[]> {
  const grouped = new Map<HistorySectionId, AggregatedActivity[]>();
  for (const section of HISTORY_SECTIONS) {
    grouped.set(section.id, []);
  }
  for (const item of items) {
    grouped.get(item.section)!.push(item);
  }
  return grouped;
}
