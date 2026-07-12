"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols, type TimeOfDay } from "@/db/schema";
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
 * Log from the full catalog (no schedule required).
 * Single-allow: toggle. Multi-allow: always add one log.
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

  const slot =
    timeOfDay ?? protocol.lockedTimeOfDay ?? protocol.timeOfDay ?? null;

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
    timeOfDay: slot,
    pointsEarned: protocol.points,
  });

  revalidateLogs();
  return { action: "added" as const };
}

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

export async function toggleCompletionAction(protocolId: string) {
  return logCompletionAction(protocolId);
}
