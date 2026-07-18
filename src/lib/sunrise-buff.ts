import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyCompletions } from "@/db/schema";
import {
  bestSunriseMultiplier,
  type SunriseTier,
} from "@/lib/scoring";

export type SunriseBuffState = {
  multiplier: number;
  tier: SunriseTier | null;
};

/** Best morning-light tier logged today (non-streak). Server-only helper — not a server action. */
export async function getSunriseBuffToday(
  userId: string,
  completedOn: string,
): Promise<SunriseBuffState> {
  try {
    const rows = await db
      .select({
        protocolId: dailyCompletions.protocolId,
        sunriseBuffMultiplier: dailyCompletions.sunriseBuffMultiplier,
      })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.completedOn, completedOn),
          eq(dailyCompletions.isStreakBonus, false),
        ),
      );

    return bestSunriseMultiplier(
      rows.map((r) => ({
        protocolId: r.protocolId,
        multiplier: r.sunriseBuffMultiplier,
      })),
    );
  } catch {
    return { multiplier: 1, tier: null };
  }
}

/** @deprecated use getSunriseBuffToday */
export async function hasSunriseBuffToday(
  userId: string,
  completedOn: string,
): Promise<boolean> {
  const b = await getSunriseBuffToday(userId, completedOn);
  return b.multiplier > 1;
}
