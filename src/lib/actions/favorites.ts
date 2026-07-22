"use server";

import { and, eq } from "drizzle-orm";
import { after } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { userFavorites, userScheduleItems, users } from "@/db/schema";
import {
  ensureProtocolInDb,
  getCatalogProtocolById,
} from "@/lib/catalog";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import { getUserDayStats } from "@/lib/data";
import { isPermanentProtocolMerged } from "@/lib/permanent-activities";
import { isCatalogSelectableProtocolId } from "@/lib/scoring";
import { ensurePermanentCompletions } from "@/lib/permanent-completions";
import { getUserStreak } from "@/lib/streaks";
import { revalidatePath } from "next/cache";

export type PermanentAutoLogSnap = {
  protocolId: string;
  count: number;
  dayPoints: number;
  streak: { current: number; best: number };
};

export type ToggleFavoriteResult = {
  favorited: boolean;
  autoLogged?: PermanentAutoLogSnap;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/**
 * Toggle whether a protocol is available for this user ("via" list).
 * Stored in user_favorites. Removing also drops it from the schedule.
 *
 * Client already updates checklist state optimistically — do not revalidate
 * the /app shell here (that was the main lag source).
 */
export async function toggleFavoriteAction(
  protocolId: string,
): Promise<ToggleFavoriteResult> {
  const userId = await requireUserId();

  if (!getCatalogProtocolById(protocolId)) {
    throw new Error("Activity not found");
  }
  if (!isCatalogSelectableProtocolId(protocolId)) {
    throw new Error("Sunrise is logged each day from the Sunrise check-in");
  }
  const inDb = await ensureProtocolInDb(protocolId);
  if (!inDb) throw new Error("Activity not found");

  const [existing] = await db
    .select()
    .from(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.protocolId, protocolId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.protocolId, protocolId),
        ),
      );
    // Can't schedule what you don't have
    await db
      .delete(userScheduleItems)
      .where(
        and(
          eq(userScheduleItems.userId, userId),
          eq(userScheduleItems.protocolId, protocolId),
        ),
      );
    return { favorited: false };
  } else {
    await db.insert(userFavorites).values({ userId, protocolId });
    if (await isPermanentProtocolMerged(protocolId)) {
      const [u] = await db
        .select({ timezone: users.timezone })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const completedOn = getTodayIsoForTimezone(u?.timezone || "UTC");
      await ensurePermanentCompletions(userId, completedOn);
      const [stats, streak] = await Promise.all([
        getUserDayStats(userId, completedOn),
        getUserStreak(userId, completedOn),
      ]);
      const count = stats.completionCounts.get(protocolId) ?? 0;
      after(() => {
        revalidatePath("/history", "layout");
      });
      return {
        favorited: true,
        autoLogged:
          count > 0
            ? {
                protocolId,
                count,
                dayPoints: stats.points,
                streak,
              }
            : undefined,
      };
    }
  }

  return { favorited: true };
}
