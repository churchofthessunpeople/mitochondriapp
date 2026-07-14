"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userFavorites, userScheduleItems } from "@/db/schema";
import {
  ensureCatalogSyncedToDb,
  getCatalogProtocolById,
} from "@/lib/catalog";
import { revalidateApp } from "@/lib/revalidate-app";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function revalidateAvailable() {
  revalidateApp();
}

/**
 * Toggle whether a protocol is available for this user ("via" list).
 * Stored in user_favorites. Removing also drops it from the schedule.
 */
export async function toggleFavoriteAction(protocolId: string) {
  const userId = await requireUserId();

  await ensureCatalogSyncedToDb();
  if (!getCatalogProtocolById(protocolId)) {
    throw new Error("Activity not found");
  }

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
  }

  revalidateAvailable();
  return { favorited: !existing };
}
