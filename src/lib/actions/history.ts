"use server";

import { auth } from "@/auth";
import { getDayDetail } from "@/lib/data";

export type DayDetailRow = {
  id: string;
  pointsEarned: number;
  durationMinutes: number | null;
  timeOfDay: string | null;
  isStreakBonus: boolean;
  protocolName: string | null;
};

export async function getDayDetailAction(
  date: string,
): Promise<DayDetailRow[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");

  const rows = await getDayDetail(session.user.id, date);
  return rows.map(({ completion, protocol }) => ({
    id: completion.id,
    pointsEarned: completion.pointsEarned,
    durationMinutes: completion.durationMinutes,
    timeOfDay: completion.timeOfDay,
    isStreakBonus: completion.isStreakBonus,
    protocolName: protocol?.name ?? null,
  }));
}
