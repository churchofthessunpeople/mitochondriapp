"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userFavorites, userScheduleItems, type TimeOfDay } from "@/db/schema";
import {
  ensureCatalogSyncedToDb,
  getCatalogProtocolById,
} from "@/lib/catalog";
import { revalidateApp } from "@/lib/revalidate-app";
import { canAssignToSlot } from "@/lib/schedule-rules";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function isTimeOfDay(value: string): value is TimeOfDay {
  return (TIME_OF_DAY_ORDER as string[]).includes(value);
}

export async function addToScheduleAction(
  protocolId: string,
  timeOfDay: TimeOfDay,
) {
  const userId = await requireUserId();
  if (!isTimeOfDay(timeOfDay)) throw new Error("Invalid time of day");

  await ensureCatalogSyncedToDb();
  const protocol = getCatalogProtocolById(protocolId);
  if (!protocol) throw new Error("Activity not found");
  if (!canAssignToSlot(protocol, timeOfDay)) {
    throw new Error(
      `“${protocol.name}” is locked to ${protocol.lockedTimeOfDay} only.`,
    );
  }

  // Must be on the user's available (via) list first
  const [available] = await db
    .select({ protocolId: userFavorites.protocolId })
    .from(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.protocolId, protocolId),
      ),
    )
    .limit(1);
  if (!available) {
    throw new Error(
      "Mark this activity as available on My activities before scheduling it.",
    );
  }

  await db
    .insert(userScheduleItems)
    .values({
      userId,
      protocolId,
      timeOfDay,
      sortOrder: protocol.sortOrder,
    })
    .onConflictDoNothing();

  revalidateApp();
}

export async function removeFromScheduleAction(scheduleId: string) {
  const userId = await requireUserId();

  await db
    .delete(userScheduleItems)
    .where(
      and(
        eq(userScheduleItems.id, scheduleId),
        eq(userScheduleItems.userId, userId),
      ),
    );

  revalidateApp();
}

export async function moveScheduleItemAction(
  scheduleId: string,
  timeOfDay: TimeOfDay,
) {
  const userId = await requireUserId();
  if (!isTimeOfDay(timeOfDay)) throw new Error("Invalid time of day");

  const [item] = await db
    .select({
      id: userScheduleItems.id,
      protocolId: userScheduleItems.protocolId,
    })
    .from(userScheduleItems)
    .where(
      and(
        eq(userScheduleItems.id, scheduleId),
        eq(userScheduleItems.userId, userId),
      ),
    )
    .limit(1);

  if (!item) throw new Error("Schedule item not found");

  await ensureCatalogSyncedToDb();
  const protocol = getCatalogProtocolById(item.protocolId);

  if (!protocol || !canAssignToSlot(protocol, timeOfDay)) {
    throw new Error(
      protocol
        ? `“${protocol.name}” is locked to ${protocol.lockedTimeOfDay} only.`
        : "Activity not found",
    );
  }

  // Unique on (user, protocol, slot) — delete conflicting target then update
  await db
    .delete(userScheduleItems)
    .where(
      and(
        eq(userScheduleItems.userId, userId),
        eq(userScheduleItems.protocolId, item.protocolId),
        eq(userScheduleItems.timeOfDay, timeOfDay),
      ),
    );

  await db
    .update(userScheduleItems)
    .set({ timeOfDay })
    .where(
      and(
        eq(userScheduleItems.id, scheduleId),
        eq(userScheduleItems.userId, userId),
      ),
    );

  revalidateApp();
}
