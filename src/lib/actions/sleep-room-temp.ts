"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, users } from "@/db/schema";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import {
  parseSleepRoomTempF,
  pointsForSleepRoomTemp,
  SLEEP_ROOM_TEMP_PROTOCOL_ID,
  type SleepRoomTempF,
} from "@/lib/sleep-room-temp";
import { getCatalogProtocolById } from "@/lib/catalog";
import { isSunriseKeystoneProtocol, pointsForLog } from "@/lib/scoring";
import { getSunriseBuffToday } from "@/lib/sunrise-buff";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/**
 * Persist bedroom sleep temp preference and refresh today's auto-log points if present.
 */
export async function setSleepRoomTempAction(
  tempRaw: number,
): Promise<{ tempF: SleepRoomTempF; dayPoints: number }> {
  const userId = await requireUserId();
  const tempF = parseSleepRoomTempF(tempRaw);

  await db
    .update(users)
    .set({ sleepRoomTempF: tempF })
    .where(eq(users.id, userId));

  const [u] = await db
    .select({ timezone: users.timezone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const completedOn = getTodayIsoForTimezone(u?.timezone || "UTC");

  const protocol = getCatalogProtocolById(SLEEP_ROOM_TEMP_PROTOCOL_ID);
  const [row] = await db
    .select({ id: dailyCompletions.id })
    .from(dailyCompletions)
    .where(
      and(
        eq(dailyCompletions.userId, userId),
        eq(dailyCompletions.protocolId, SLEEP_ROOM_TEMP_PROTOCOL_ID),
        eq(dailyCompletions.completedOn, completedOn),
        eq(dailyCompletions.isStreakBonus, false),
      ),
    )
    .limit(1);

  if (row && protocol) {
    const buff = await getSunriseBuffToday(userId, completedOn);
    const mult = isSunriseKeystoneProtocol(protocol) ? 1 : buff.multiplier;
    const points = pointsForLog(protocol, null, {
      sunriseMultiplier: mult,
      basePoints: pointsForSleepRoomTemp(tempF),
    });
    await db
      .update(dailyCompletions)
      .set({ variantValue: tempF, pointsEarned: points })
      .where(eq(dailyCompletions.id, row.id));
  }

  const { getUserDayStats } = await import("@/lib/data");
  const stats = await getUserDayStats(userId, completedOn);
  return { tempF, dayPoints: stats.points };
}
