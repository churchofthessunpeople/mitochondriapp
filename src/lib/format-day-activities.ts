import { format, parseISO } from "date-fns";
import {
  aggregateDayActivities,
  groupAggregatedBySection,
  HISTORY_SECTIONS,
  type DayActivityRow,
} from "@/lib/history-sections";
import { formatVariantLabel } from "@/lib/protocol-variants";
import {
  formatSunriseLogDetail,
  isSunriseKeystoneProtocolId,
} from "@/lib/scoring";
import { formatPoints } from "@/lib/utils";

export type { DayActivityRow } from "@/lib/history-sections";

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

export function formatLine(
  name: string,
  totalMins: number,
  totalPoints: number,
): string {
  const pts = `${formatPoints(totalPoints)} pts`;
  if (totalMins > 0) {
    return `• ${name} (${formatLoggedMinutes(totalMins)}) — ${pts}`;
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
      lines.push(formatLine(item.name, item.totalMins, item.totalPoints));
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
