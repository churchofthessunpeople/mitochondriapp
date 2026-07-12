"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols, type TimeOfDay } from "@/db/schema";
import { getServerTodayIsoDate } from "@/lib/date-server";
import { maxLogsPerDay, pointsForLog, streakBonusPoints } from "@/lib/scoring";
import { getUserStreak, hasStreakBonusToday } from "@/lib/streaks";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function revalidateLogs() {
  revalidatePath("/app");
  revalidatePath("/schedule");
  revalidatePath("/place");
  revalidatePath("/today");
  revalidatePath("/history");
  revalidatePath("/leaderboard");
  revalidatePath("/friends");
}

export async function logCompletionAction(
  protocolId: string,
  options?: { timeOfDay?: TimeOfDay | null; durationMinutes?: number | null },
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
    options?.timeOfDay ??
    protocol.lockedTimeOfDay ??
    protocol.timeOfDay ??
    null;

  const existing = await db
    .select()
    .from(dailyCompletions)
    .where(
      and(
        eq(dailyCompletions.userId, userId),
        eq(dailyCompletions.protocolId, protocolId),
        eq(dailyCompletions.completedOn, completedOn),
        eq(dailyCompletions.isStreakBonus, false),
      ),
    );

  const count = existing.length;
  const max = maxLogsPerDay(protocol);

  if (!protocol.allowsMultiple) {
    if (count > 0) {
      await db
        .delete(dailyCompletions)
        .where(
          and(
            eq(dailyCompletions.id, existing[0]!.id),
            eq(dailyCompletions.userId, userId),
          ),
        );
      revalidateLogs();
      return { action: "removed" as const, points: 0 };
    }
  } else if (count >= max) {
    throw new Error(`Daily limit reached (${max}× for this activity).`);
  }

  const points = pointsForLog(protocol, options?.durationMinutes);
  await db.insert(dailyCompletions).values({
    userId,
    protocolId,
    completedOn,
    timeOfDay: slot,
    durationMinutes: options?.durationMinutes ?? null,
    pointsEarned: points,
    isStreakBonus: false,
  });

  // First real log of the day: award streak bonus if streak ≥ 2
  let streakBonus = 0;
  if (count === 0 && !(await hasStreakBonusToday(userId, completedOn))) {
    const { current } = await getUserStreak(userId, completedOn);
    // current includes today after this log when we recompute — use current after insert
    const streak = Math.max(current, 1);
    streakBonus = streakBonusPoints(streak);
    if (streakBonus > 0) {
      await db.insert(dailyCompletions).values({
        userId,
        protocolId: protocolId,
        completedOn,
        pointsEarned: streakBonus,
        isStreakBonus: true,
        timeOfDay: null,
        durationMinutes: null,
      });
    }
  }

  revalidateLogs();
  return { action: "added" as const, points, streakBonus };
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
        eq(dailyCompletions.isStreakBonus, false),
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
