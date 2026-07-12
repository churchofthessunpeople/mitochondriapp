import { and, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { dailyCompletions, protocols } from "@/db/schema";

export type WeeklySummary = {
  daysActive: number;
  totalPoints: number;
  /** Points from light-category protocols in the window */
  lightPoints: number;
  lightLogs: number;
};

function addDaysIso(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

/** Last 7 calendar days including todayIso. */
export async function getWeeklySummary(
  userId: string,
  todayIso: string,
): Promise<WeeklySummary> {
  const since = addDaysIso(todayIso, -6);
  try {
    const rows = await db
      .select({
        completedOn: dailyCompletions.completedOn,
        points: sum(dailyCompletions.pointsEarned).mapWith(Number),
      })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          gte(dailyCompletions.completedOn, since),
        ),
      )
      .groupBy(dailyCompletions.completedOn);

    const daysActive = rows.filter((r) => (r.points ?? 0) > 0).length;
    const totalPoints = rows.reduce((a, r) => a + (r.points ?? 0), 0);

    const lightRows = await db
      .select({
        points: sum(dailyCompletions.pointsEarned).mapWith(Number),
        logs: sql<number>`count(*) filter (where ${dailyCompletions.isStreakBonus} = false)::int`,
      })
      .from(dailyCompletions)
      .innerJoin(protocols, eq(protocols.id, dailyCompletions.protocolId))
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          gte(dailyCompletions.completedOn, since),
          eq(protocols.category, "light"),
          eq(dailyCompletions.isStreakBonus, false),
        ),
      );

    return {
      daysActive,
      totalPoints,
      lightPoints: lightRows[0]?.points ?? 0,
      lightLogs: lightRows[0]?.logs ?? 0,
    };
  } catch {
    return { daysActive: 0, totalPoints: 0, lightPoints: 0, lightLogs: 0 };
  }
}
