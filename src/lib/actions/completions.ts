"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols, users, type TimeOfDay } from "@/db/schema";
import { getUserDayStats } from "@/lib/data";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import { maxLogsPerDay, pointsForLog, streakBonusPoints } from "@/lib/scoring";
import { getUserStreak, hasStreakBonusToday } from "@/lib/streaks";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function userToday(userId: string) {
  const [u] = await db
    .select({ timezone: users.timezone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return getTodayIsoForTimezone(u?.timezone || "UTC");
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

export type CompletionResult = {
  action: "added" | "removed";
  points: number;
  streakBonus?: number;
  dayPoints: number;
  streak: { current: number; best: number };
  count: number;
};

async function daySnapshot(
  userId: string,
  completedOn: string,
  protocolId: string,
): Promise<Pick<CompletionResult, "dayPoints" | "streak" | "count">> {
  const [stats, streak] = await Promise.all([
    getUserDayStats(userId, completedOn),
    getUserStreak(userId, completedOn),
  ]);
  return {
    dayPoints: stats.points,
    streak,
    count: stats.completionCounts.get(protocolId) ?? 0,
  };
}

export async function logCompletionAction(
  protocolId: string,
  options?: { timeOfDay?: TimeOfDay | null; durationMinutes?: number | null },
): Promise<CompletionResult> {
  const userId = await requireUser();
  const completedOn = await userToday(userId);

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
      const snap = await daySnapshot(userId, completedOn, protocolId);
      return { action: "removed", points: 0, ...snap };
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

  let streakBonus = 0;
  if (count === 0 && !(await hasStreakBonusToday(userId, completedOn))) {
    const { current } = await getUserStreak(userId, completedOn);
    const streakDays = Math.max(current, 1);
    streakBonus = streakBonusPoints(streakDays);
    if (streakBonus > 0) {
      await db.insert(dailyCompletions).values({
        userId,
        protocolId,
        completedOn,
        pointsEarned: streakBonus,
        isStreakBonus: true,
        timeOfDay: null,
        durationMinutes: null,
      });
    }
  }

  revalidateLogs();
  const snap = await daySnapshot(userId, completedOn, protocolId);
  return { action: "added", points, streakBonus, ...snap };
}

export async function removeOneCompletionAction(
  protocolId: string,
): Promise<CompletionResult> {
  const userId = await requireUser();
  const completedOn = await userToday(userId);

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
  const snap = await daySnapshot(userId, completedOn, protocolId);
  return { action: "removed", points: 0, ...snap };
}

export async function toggleCompletionAction(protocolId: string) {
  return logCompletionAction(protocolId);
}
