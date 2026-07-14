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
import { isPermanentProtocolId } from "@/lib/permanent-activities";
import { isCatalogSelectableProtocolId } from "@/lib/scoring";
import { ensurePermanentCompletions } from "@/lib/permanent-completions";
import { revalidatePath } from "next/cache";

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
export async function toggleFavoriteAction(protocolId: string) {
  const userId = await requireUserId();

  if (!getCatalogProtocolById(protocolId)) {
    throw new Error("Activity not found");
  }
  if (!isCatalogSelectableProtocolId(protocolId)) {
    throw new Error("Morning light is logged each day from the sunrise check-in");
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
  } else {
    await db.insert(userFavorites).values({ userId, protocolId });
    if (isPermanentProtocolId(protocolId)) {
      const [u] = await db
        .select({ timezone: users.timezone })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      const completedOn = getTodayIsoForTimezone(u?.timezone || "UTC");
      await ensurePermanentCompletions(userId, completedOn);
      after(() => {
        revalidatePath("/history", "layout");
      });
    }
  }

  return { favorited: !existing };
}
