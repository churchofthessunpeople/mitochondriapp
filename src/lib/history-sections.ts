import { protocolAllowsMultiple } from "@/lib/completion-dedupe";
import {
  isPermanentProtocolId,
} from "@/lib/permanent-activities";
import { isSunriseKeystoneProtocolId } from "@/lib/scoring";

export type DayActivityRow = {
  protocolName: string | null;
  protocolId?: string | null;
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
  { id: "day", label: "Activities" },
  { id: "permanent", label: "Automatic · every day" },
];

export type AggregatedActivity = {
  key: string;
  name: string;
  totalMins: number;
  totalPoints: number;
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

export function aggregateDayActivities(
  rows: DayActivityRow[],
  displayName: (row: DayActivityRow) => string,
  permanentIds?: ReadonlySet<string>,
): AggregatedActivity[] {
  const activities = rows.filter((r) => !r.isStreakBonus);
  const byProtocol = new Map<string, AggregatedActivity>();
  let order = 0;

  for (const r of activities) {
    const name = displayName(r);
    const key = r.protocolId ?? `name:${name}`;
    const mins =
      r.protocolId && isSunriseKeystoneProtocolId(r.protocolId)
        ? 0
        : (r.durationMinutes ?? 0);
    const pts = r.pointsEarned;
    const allowsMultiple = protocolAllowsMultiple(r.protocolId);
    const existing = byProtocol.get(key);
    if (existing) {
      if (allowsMultiple) {
        existing.totalMins += mins;
        existing.totalPoints += pts;
      }
      continue;
    }

    byProtocol.set(key, {
      key,
      name,
      totalMins: mins,
      totalPoints: pts,
      order: order++,
      section: historySectionForActivity(r.protocolId, permanentIds),
    });
  }

  return [...byProtocol.values()].sort((a, b) => a.order - b.order);
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
