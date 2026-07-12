"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import {
  dailyCompletions,
  protocols,
  userScheduleItems,
  type TimeOfDay,
} from "@/db/schema";
import { getServerTodayIsoDate } from "@/lib/date-server";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function revalidateLogs() {
  revalidatePath("/today");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
}

/**
 * Log once (single-allow) or add a log (multi-allow).
 * timeOfDay is the schedule slot the user logged from.
 */
export async function logCompletionAction(
  protocolId: string,
  timeOfDay?: TimeOfDay | null,
) {
  const userId = await requireUser();
  const completedOn = await getServerTodayIsoDate();

  const [protocol] = await db
    .select()
    .from(protocols)
    .where(and(eq(protocols.id, protocolId), eq(protocols.active, true)))
    .limit(1);

  if (!protocol) throw new Error("Activity not found");

  // Must be on the user's schedule for this slot (if slot provided)
  if (timeOfDay) {
    const [onSchedule] = await db
      .select({ id: userScheduleItems.id })
      .from(userScheduleItems)
      .where(
        and(
          eq(userScheduleItems.userId, userId),
          eq(userScheduleItems.protocolId, protocolId),
          eq(userScheduleItems.timeOfDay, timeOfDay),
        ),
      )
      .limit(1);
    if (!onSchedule) throw new Error("Activity is not on your schedule for that time");
  }

  if (!protocol.allowsMultiple) {
    const [existing] = await db
      .select()
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.protocolId, protocolId),
          eq(dailyCompletions.completedOn, completedOn),
        ),
      )
      .limit(1);

    if (existing) {
      // Toggle off
      await db
        .delete(dailyCompletions)
        .where(
          and(
            eq(dailyCompletions.id, existing.id),
            eq(dailyCompletions.userId, userId),
          ),
        );
      revalidateLogs();
      return { action: "removed" as const };
    }
  }

  await db.insert(dailyCompletions).values({
    userId,
    protocolId,
    completedOn,
    timeOfDay: timeOfDay ?? null,
    pointsEarned: protocol.points,
  });

  revalidateLogs();
  return { action: "added" as const };
}

/** Remove one log (latest) for multi-allow activities, or clear single. */
export async function removeOneCompletionAction(protocolId: string) {
  const userId = await requireUser();
  const completedOn = await getServerTodayIsoDate();

  const [latest] = await db
    .select()
    .from(dailyCompletions)
    .where(
      and(
        eq(dailyCompletions.userId, userId),
        eq(dailyCompletions.protocolId, protocolId),
        eq(dailyCompletions.completedOn, completedOn),
      ),
    )
    .orderBy(desc(dailyCompletions.createdAt))
    .limit(1);

  if (latest) {
    await db
      .delete(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.id, latest.id),
          eq(dailyCompletions.userId, userId),
        ),
      );
  }

  revalidateLogs();
}

/** @deprecated use logCompletionAction */
export async function toggleCompletionAction(protocolId: string) {
  return logCompletionAction(protocolId);
}
