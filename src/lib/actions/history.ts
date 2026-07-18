"use server";

import { auth } from "@/auth";
import { dedupeSingleLogCompletions } from "@/lib/completion-dedupe";
import {
  getActiveProtocols,
  getCompletionsForUserDateRange,
  getDayDetail,
} from "@/lib/data";
import { formatWeekActivitiesCopy } from "@/lib/format-day-activities";
import { buildPermanentProtocolIds } from "@/lib/permanent-activities";
import { getPreviousWeekRange } from "@/lib/week-range";

export type DayDetailRow = {
  id: string;
  pointsEarned: number;
  durationMinutes: number | null;
  variantValue: number | null;
  sunriseBuffMultiplier: number | null;
  timeOfDay: string | null;
  isStreakBonus: boolean;
  protocolName: string | null;
  protocolId: string | null;
};

export async function getDayDetailAction(
  date: string,
): Promise<DayDetailRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");

  await dedupeSingleLogCompletions(session.user.id, date);

  const rows = await getDayDetail(session.user.id, date);
  return mapCompletionRows(rows);
}

function mapCompletionRows(
  rows: Awaited<ReturnType<typeof getCompletionsForUserDateRange>>,
): DayDetailRow[] {
  return rows.map(({ completion, protocol }) => ({
    id: completion.id,
    pointsEarned: completion.pointsEarned,
    durationMinutes: completion.durationMinutes,
    variantValue: completion.variantValue ?? null,
    sunriseBuffMultiplier: completion.sunriseBuffMultiplier ?? null,
    timeOfDay: completion.timeOfDay,
    isStreakBonus: completion.isStreakBonus,
    protocolName: protocol?.name ?? null,
    protocolId: completion.protocolId,
  }));
}

export async function getPreviousWeekCopyAction(
  timeZone: string,
): Promise<{ text: string; weekLabel: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const week = getPreviousWeekRange(timeZone);
  const [rows, protocols] = await Promise.all([
    getCompletionsForUserDateRange(
      session.user.id,
      week.start,
      week.endExclusive,
    ),
    getActiveProtocols(),
  ]);
  const permanentIds = new Set(buildPermanentProtocolIds(protocols));

  const text = formatWeekActivitiesCopy(
    `Week total · ${week.label}`,
    mapCompletionRows(rows),
    permanentIds,
  );

  return { text, weekLabel: week.label };
}
