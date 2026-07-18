"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, users } from "@/db/schema";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import {
  MAGNETICO_PROTOCOL_ID,
  parseMagneticoGauss,
  pointsForMagneticoGauss,
  type MagneticoGauss,
} from "@/lib/magnetico";
import { getCatalogProtocolById } from "@/lib/catalog";
import { isSunriseKeystoneProtocol, pointsForLog } from "@/lib/scoring";
import { getSunriseBuffToday } from "@/lib/sunrise-buff";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/**
 * Persist Magnetico gauss preference and refresh today's auto-log points if present.
 */
export async function setMagneticoGaussAction(
  gaussRaw: number,
): Promise<{ gauss: MagneticoGauss; dayPoints: number }> {
  const userId = await requireUserId();
  const gauss = parseMagneticoGauss(gaussRaw);
  if (gauss !== 5 && gauss !== 10 && gauss !== 20) {
    throw new Error("Choose 5, 10, or 20 gauss");
  }

  await db
    .update(users)
    .set({ magneticoGauss: gauss })
    .where(eq(users.id, userId));

  const [u] = await db
    .select({ timezone: users.timezone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const completedOn = getTodayIsoForTimezone(u?.timezone || "UTC");

  const protocol = getCatalogProtocolById(MAGNETICO_PROTOCOL_ID);
  const [row] = await db
    .select({ id: dailyCompletions.id })
    .from(dailyCompletions)
    .where(
      and(
        eq(dailyCompletions.userId, userId),
        eq(dailyCompletions.protocolId, MAGNETICO_PROTOCOL_ID),
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
      basePoints: pointsForMagneticoGauss(gauss, protocol.points),
    });
    await db
      .update(dailyCompletions)
      .set({ variantValue: gauss, pointsEarned: points })
      .where(eq(dailyCompletions.id, row.id));
  }

  const { getUserDayStats } = await import("@/lib/data");
  const stats = await getUserDayStats(userId, completedOn);
  return { gauss, dayPoints: stats.points };
}
