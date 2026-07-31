import { format, parseISO } from "date-fns";
import {
  aggregateDayActivities,
  aggregatePeriodActivities,
  groupAggregatedBySection,
  HISTORY_SECTIONS,
  type DayActivityRow,
} from "@/lib/history-sections";
import {
  formatVariantLabel,
  isSessionDetailProtocolId,
} from "@/lib/protocol-variants";
import {
  formatSunriseLogDetail,
  isSunriseKeystoneProtocolId,
} from "@/lib/scoring";
import { formatPoints } from "@/lib/utils";

export type { DayActivityRow } from "@/lib/history-sections";

/** Slim completion projection for Performed session summaries. */
export type CompletionSession = {
  protocolId: string;
  variantValue: number | null;
  durationMinutes: number | null;
};

/**
 * Compact Performed subtitle for multi-option activities, e.g.
 * "1h Morning · Full sun · 30 min Peak sun · Shaded" or
 * "RO water · Salt ⅛ tsp · carbonated · Spring water · still".
 */
export function formatPerformedSessionsSummary(
  protocolId: string,
  sessions: readonly CompletionSession[],
): string | null {
  if (!isSessionDetailProtocolId(protocolId)) return null;
  const mine = sessions.filter((s) => s.protocolId === protocolId);
  if (mine.length === 0) return null;

  const byVariant = new Map<
    string,
    { variantValue: number | null; mins: number; count: number }
  >();
  for (const s of mine) {
    const key =
      s.variantValue != null && Number.isFinite(s.variantValue)
        ? `v${Math.trunc(s.variantValue)}`
        : "none";
    const mins =
      s.durationMinutes != null && s.durationMinutes > 0
        ? s.durationMinutes
        : 0;
    const existing = byVariant.get(key);
    if (existing) {
      existing.mins += mins;
      existing.count += 1;
    } else {
      byVariant.set(key, {
        variantValue: s.variantValue,
        mins,
        count: 1,
      });
    }
  }

  const parts: string[] = [];
  for (const g of byVariant.values()) {
    const label =
      g.variantValue != null
        ? formatVariantLabel(protocolId, g.variantValue)
        : null;
    if (!label) continue;
    if (g.mins > 0) {
      parts.push(`${formatLoggedMinutes(g.mins)} ${label}`);
    } else if (g.count > 1) {
      parts.push(`${label} ×${g.count}`);
    } else {
      parts.push(label);
    }
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** e.g. 1 log, 3 logs */
export function formatMultiLogCount(count: number): string {
  if (count <= 0) return "";
  return count === 1 ? "1 log" : `${count} logs`;
}

/** Today checklist subtitle for multi-log activities without a timer. */
export function formatTodayMultiLogStatus(
  pointsPerLog: number,
  count: number,
): string {
  if (count <= 0) return "";
  return `${formatPoints(pointsPerLog * count)} pts today · ${formatMultiLogCount(count)}`;
}

/** e.g. 45 min, 1h, 1h 15 min */
export function formatLoggedMinutes(mins: number): string {
  if (mins <= 0) return "";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m} min`;
}

function activityDetailSuffix(r: DayActivityRow): string | null {
  if (r.protocolId && isSunriseKeystoneProtocolId(r.protocolId)) {
    return formatSunriseLogDetail(
      r.protocolId,
      r.sunriseBuffMultiplier,
      r.variantValue,
      r.durationMinutes,
    );
  }
  if (r.protocolId && r.variantValue != null) {
    const variant = formatVariantLabel(r.protocolId, r.variantValue);
    if (variant) return variant;
  }
  return null;
}

export function displayName(r: DayActivityRow): string {
  const base = r.protocolName?.trim() || "Activity";
  const suffix = activityDetailSuffix(r);
  if (suffix) return `${base} (${suffix})`;
  return base;
}

/**
 * Week-total label: sunrise is tier-only (no one day's sky/timing),
 * other activities keep their variant specifics.
 */
export function periodDisplayName(r: DayActivityRow): string {
  if (r.protocolId && isSunriseKeystoneProtocolId(r.protocolId)) {
    return r.protocolName?.trim() || "Morning light";
  }
  return displayName(r);
}

export function formatCountLabel(
  count: number,
  unit: "logs" | "days" = "logs",
): string {
  if (count <= 0) return "";
  if (unit === "days") {
    return count === 1 ? "1 day" : `${count} days`;
  }
  return formatMultiLogCount(count);
}

export function formatLine(
  name: string,
  totalMins: number,
  totalPoints: number,
  logCount = 0,
  countUnit: "logs" | "days" = "logs",
): string {
  const pts = `${formatPoints(totalPoints)} pts`;
  if (totalMins > 0) {
    return `• ${name} (${formatLoggedMinutes(totalMins)}) — ${pts}`;
  }
  if (logCount > 0) {
    return `• ${name} (${formatCountLabel(logCount, countUnit)}) — ${pts}`;
  }
  return `• ${name} — ${pts}`;
}

/** Plain-text bullet list for clipboard (one line per activity; timed totals summed). */
export function formatDayActivitiesCopy(
  date: string,
  rows: DayActivityRow[],
  permanentIds?: ReadonlySet<string>,
): string {
  const header = format(parseISO(date), "EEEE, MMMM d, yyyy");
  const streakRows = rows.filter((r) => r.isStreakBonus);
  const streakPoints = streakRows.reduce((s, r) => s + r.pointsEarned, 0);
  const aggregated = aggregateDayActivities(rows, displayName, permanentIds);
  const grouped = groupAggregatedBySection(aggregated);

  if (aggregated.length === 0 && streakPoints === 0) {
    return `${header}\n(no activities logged)`;
  }

  const lines: string[] = [];

  for (const section of HISTORY_SECTIONS) {
    const items = grouped.get(section.id) ?? [];
    if (items.length === 0) continue;
    if (lines.length > 0) lines.push("");
    lines.push(section.label);
    for (const item of items) {
      lines.push(
        formatLine(
          item.name,
          item.totalMins,
          item.totalPoints,
          item.logCount,
          item.countUnit,
        ),
      );
    }
  }

  if (streakPoints > 0) {
    if (lines.length > 0) lines.push("");
    lines.push(`• Streak bonus — ${formatPoints(streakPoints)} pts`);
  }

  const activityPoints = aggregated.reduce((s, row) => s + row.totalPoints, 0);
  const totalPoints = activityPoints + streakPoints;
  const totalMins = aggregated.reduce((s, row) => s + row.totalMins, 0);

  lines.push("");
  if (totalMins > 0) {
    lines.push(
      `Total: ${formatPoints(totalPoints)} pts · ${formatLoggedMinutes(totalMins)} logged`,
    );
  } else {
    lines.push(`Total: ${formatPoints(totalPoints)} pts`);
  }

  return `${header}\n${lines.join("\n")}`;
}

function appendAggregatedSections(
  lines: string[],
  aggregated: ReturnType<typeof aggregatePeriodActivities>,
  streakPoints: number,
  opts?: { includeSectionHeaders?: boolean },
): void {
  const includeHeaders = opts?.includeSectionHeaders !== false;
  const grouped = groupAggregatedBySection(aggregated);

  for (const section of HISTORY_SECTIONS) {
    const items = grouped.get(section.id) ?? [];
    if (items.length === 0) continue;
    if (lines.length > 0) lines.push("");
    if (includeHeaders) lines.push(section.label);
    for (const item of items) {
      lines.push(
        formatLine(
          item.name,
          item.totalMins,
          item.totalPoints,
          item.logCount,
          item.countUnit,
        ),
      );
    }
  }

  if (streakPoints > 0) {
    if (lines.length > 0) lines.push("");
    lines.push(`• Streak bonus — ${formatPoints(streakPoints)} pts`);
  }
}

/**
 * Last-7-days clipboard copy: each day with logs (variant-split), then
 * week totals (sunrise by tier only; Outside Time / water by mix).
 */
export function formatWeekActivitiesCopy(
  weekLabel: string,
  rows: DayActivityRow[],
  permanentIds?: ReadonlySet<string>,
): string {
  const streakRows = rows.filter((r) => r.isStreakBonus);
  const streakPoints = streakRows.reduce((s, r) => s + r.pointsEarned, 0);
  const activityRows = rows.filter((r) => !r.isStreakBonus);

  if (activityRows.length === 0 && streakPoints === 0) {
    return `${weekLabel}\n(no activities logged)`;
  }

  const byDate = new Map<string, DayActivityRow[]>();
  for (const r of activityRows) {
    const date = r.completedOn?.trim();
    if (!date) continue;
    const list = byDate.get(date);
    if (list) list.push(r);
    else byDate.set(date, [r]);
  }
  const dates = [...byDate.keys()].sort();

  const lines: string[] = [];

  for (const date of dates) {
    const dayRows = byDate.get(date) ?? [];
    const dayAgg = aggregateDayActivities(dayRows, displayName, permanentIds);
    if (dayAgg.length === 0) continue;
    if (lines.length > 0) lines.push("");
    lines.push(format(parseISO(date), "EEEE, MMMM d, yyyy"));
    appendAggregatedSections(lines, dayAgg, 0);
  }

  // Rows missing completedOn still contribute to week totals only.
  const weekAgg = aggregatePeriodActivities(
    activityRows,
    periodDisplayName,
    permanentIds,
  );

  if (weekAgg.length > 0 || streakPoints > 0) {
    if (lines.length > 0) lines.push("");
    lines.push("Week totals");
    appendAggregatedSections(lines, weekAgg, streakPoints);
  }

  const activityPoints = weekAgg.reduce((s, row) => s + row.totalPoints, 0);
  const totalPoints = activityPoints + streakPoints;
  const totalMins = weekAgg.reduce((s, row) => s + row.totalMins, 0);

  lines.push("");
  if (totalMins > 0) {
    lines.push(
      `Total: ${formatPoints(totalPoints)} pts · ${formatLoggedMinutes(totalMins)} logged`,
    );
  } else {
    lines.push(`Total: ${formatPoints(totalPoints)} pts`);
  }

  return `${weekLabel}\n${lines.join("\n")}`;
}
