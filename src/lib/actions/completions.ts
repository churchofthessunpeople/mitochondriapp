"use server";

import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols, users, type TimeOfDay } from "@/db/schema";
import { getUserDayStats } from "@/lib/data";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import { revalidateApp } from "@/lib/revalidate-app";
import {
  bestSunriseTier,
  formatSunriseMultiplier,
  isSunriseKeystoneProtocol,
  maxLogsPerDay,
  pointsForLog,
  streakBonusPoints,
  type SunriseTier,
} from "@/lib/scoring";
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
  revalidateApp();
}

export type CompletionResult = {
  action: "added" | "removed";
  points: number;
  streakBonus?: number;
  dayPoints: number;
  streak: { current: number; best: number };
  count: number;
  /** Best morning-light multiplier for the day (1 = none) */
  sunriseMultiplier: number;
  sunriseTierLabel: string | null;
  /** @deprecated use sunriseMultiplier > 1 */
  sunriseBuffActive: boolean;
};

async function daySnapshot(
  userId: string,
  completedOn: string,
  protocolId: string,
): Promise<
  Pick<
    CompletionResult,
    | "dayPoints"
    | "streak"
    | "count"
    | "sunriseMultiplier"
    | "sunriseTierLabel"
    | "sunriseBuffActive"
  >
> {
  const [stats, streak, buff] = await Promise.all([
    getUserDayStats(userId, completedOn),
    getUserStreak(userId, completedOn),
    getSunriseBuffToday(userId, completedOn),
  ]);
  return {
    dayPoints: stats.points,
    streak,
    count: stats.completionCounts.get(protocolId) ?? 0,
    sunriseMultiplier: buff.multiplier,
    sunriseTierLabel: buff.tier?.shortLabel ?? null,
    sunriseBuffActive: buff.multiplier > 1,
  };
}

export type SunriseBuffState = {
  multiplier: number;
  tier: SunriseTier | null;
};

/** Best morning-light tier logged today (non-streak). */
export async function getSunriseBuffToday(
  userId: string,
  completedOn: string,
): Promise<SunriseBuffState> {
  try {
    const rows = await db
      .select({ protocolId: dailyCompletions.protocolId })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.completedOn, completedOn),
          eq(dailyCompletions.isStreakBonus, false),
        ),
      );

    const tier = bestSunriseTier(rows.map((r) => r.protocolId));
    return {
      multiplier: tier?.multiplier ?? 1,
      tier,
    };
  } catch {
    return { multiplier: 1, tier: null };
  }
}

/** @deprecated use getSunriseBuffToday */
export async function hasSunriseBuffToday(
  userId: string,
  completedOn: string,
): Promise<boolean> {
  const b = await getSunriseBuffToday(userId, completedOn);
  return b.multiplier > 1;
}

/**
 * Recompute pointsEarned for all real logs today with current sunrise buff.
 * Keystone morning-light protocols keep base; others get the best tier mult.
 */
async function recomputeDayPoints(
  userId: string,
  completedOn: string,
  sunriseMultiplier: number,
) {
  const rows = await db
    .select({
      id: dailyCompletions.id,
      protocolId: dailyCompletions.protocolId,
      durationMinutes: dailyCompletions.durationMinutes,
      pointsEarned: dailyCompletions.pointsEarned,
      protocol: protocols,
    })
    .from(dailyCompletions)
    .innerJoin(protocols, eq(protocols.id, dailyCompletions.protocolId))
    .where(
      and(
        eq(dailyCompletions.userId, userId),
        eq(dailyCompletions.completedOn, completedOn),
        eq(dailyCompletions.isStreakBonus, false),
      ),
    );

  for (const row of rows) {
    const next = pointsForLog(row.protocol, row.durationMinutes, {
      sunriseMultiplier,
    });
    if (next !== row.pointsEarned) {
      await db
        .update(dailyCompletions)
        .set({ pointsEarned: next })
        .where(
          and(
            eq(dailyCompletions.id, row.id),
            eq(dailyCompletions.userId, userId),
          ),
        );
    }
  }
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
  const wasKeystone = isSunriseKeystoneProtocol(protocol);

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
      const buff = await getSunriseBuffToday(userId, completedOn);
      await recomputeDayPoints(userId, completedOn, buff.multiplier);
      revalidateLogs();
      const snap = await daySnapshot(userId, completedOn, protocolId);
      return { action: "removed", points: 0, ...snap };
    }
  } else if (count >= max) {
    throw new Error(`Daily limit reached (${max}× for this activity).`);
  }

  const buffBefore = await getSunriseBuffToday(userId, completedOn);
  // Keystones never receive the mult; other logs use best tier so far
  const multForThisLog = wasKeystone ? 1 : buffBefore.multiplier;

  const points = pointsForLog(protocol, options?.durationMinutes, {
    sunriseMultiplier: multForThisLog,
  });

  await db.insert(dailyCompletions).values({
    userId,
    protocolId,
    completedOn,
    timeOfDay: slot,
    durationMinutes: options?.durationMinutes ?? null,
    pointsEarned: points,
    isStreakBonus: false,
  });

  // New/better keystone: retroactively apply best mult to non-keystone logs
  if (wasKeystone) {
    const buffAfter = await getSunriseBuffToday(userId, completedOn);
    await recomputeDayPoints(userId, completedOn, buffAfter.multiplier);
  }

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

  const [row] = await db
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

  if (!row) {
    const snap = await daySnapshot(userId, completedOn, protocolId);
    return { action: "removed", points: 0, ...snap };
  }

  await db
    .delete(dailyCompletions)
    .where(
      and(eq(dailyCompletions.id, row.id), eq(dailyCompletions.userId, userId)),
    );

  const buff = await getSunriseBuffToday(userId, completedOn);
  await recomputeDayPoints(userId, completedOn, buff.multiplier);
  revalidateLogs();
  const snap = await daySnapshot(userId, completedOn, protocolId);
  return { action: "removed", points: 0, ...snap };
}

export async function toggleCompletionAction(protocolId: string) {
  return logCompletionAction(protocolId);
}

/** Toast helper text after logging a keystone */
export function sunriseBoostToast(mult: number, label: string | null): string {
  if (mult <= 1) return "";
  const who = label ? `${label} · ` : "";
  return ` · ${who}${formatSunriseMultiplier(mult)} on other activities today`;
}
