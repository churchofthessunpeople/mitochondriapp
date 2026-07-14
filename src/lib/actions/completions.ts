"use server";

import { and, desc, eq } from "drizzle-orm";
import { after } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols, users, type TimeOfDay } from "@/db/schema";
import { getCatalogProtocolById } from "@/lib/catalog";
import { getUserDayStats } from "@/lib/data";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import {
  clearPermanentSkip,
  ensurePermanentCompletions,
  recordPermanentSkip,
} from "@/lib/permanent-completions";
import { isPermanentProtocolId } from "@/lib/permanent-activities";
import { revalidatePath } from "next/cache";
import {
  bestSunriseMultiplier,
  computeSunriseMultiplier,
  isSunriseKeystoneProtocol,
  pointsForLog,
  streakBonusPoints,
  sunriseTierForProtocolId,
  type SunriseModifiers,
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

/**
 * Don't block (or refetch) the /app shell after each tap — the client already
 * applies the action snapshot. History day pages catch up in the background.
 */
function scheduleHistoryRevalidate() {
  after(() => {
    revalidatePath("/history", "layout");
  });
}

export type CompletionResult = {
  action: "added" | "removed";
  points: number;
  streakBonus?: number;
  dayPoints: number;
  streak: { current: number; best: number };
  count: number;
  /** Sum of logged minutes today for timed activities */
  durationMinutesTotal: number;
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
    | "durationMinutesTotal"
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
    durationMinutesTotal: stats.completionDurations.get(protocolId) ?? 0,
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
      .select({
        protocolId: dailyCompletions.protocolId,
        sunriseBuffMultiplier: dailyCompletions.sunriseBuffMultiplier,
      })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.completedOn, completedOn),
          eq(dailyCompletions.isStreakBonus, false),
        ),
      );

    return bestSunriseMultiplier(
      rows.map((r) => ({
        protocolId: r.protocolId,
        multiplier: r.sunriseBuffMultiplier,
      })),
    );
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
  options?: {
    timeOfDay?: TimeOfDay | null;
    durationMinutes?: number | null;
    sunriseModifiers?: SunriseModifiers;
  },
): Promise<CompletionResult> {
  const userId = await requireUser();
  const completedOn = await userToday(userId);

  // Local seeds are source of truth — skip full catalog upsert on every tap
  const protocol = getCatalogProtocolById(protocolId);
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
      if (isPermanentProtocolId(protocolId)) {
        await recordPermanentSkip(userId, protocolId, completedOn);
      }
      const buff = await getSunriseBuffToday(userId, completedOn);
      await recomputeDayPoints(userId, completedOn, buff.multiplier);
      scheduleHistoryRevalidate();
      const snap = await daySnapshot(userId, completedOn, protocolId);
      return { action: "removed", points: 0, ...snap };
    }
  }

  if (isPermanentProtocolId(protocolId)) {
    await clearPermanentSkip(userId, protocolId, completedOn);
  }

  const buffBefore = await getSunriseBuffToday(userId, completedOn);
  // Keystones never receive the mult; other logs use best tier so far
  const multForThisLog = wasKeystone ? 1 : buffBefore.multiplier;

  const points = pointsForLog(protocol, options?.durationMinutes, {
    sunriseMultiplier: multForThisLog,
  });

  const tier = wasKeystone ? sunriseTierForProtocolId(protocolId) : null;
  const sunriseBuffMultiplier =
    wasKeystone && tier
      ? options?.sunriseModifiers
        ? computeSunriseMultiplier(tier, options.sunriseModifiers)
        : tier.multiplier
      : null;

  await db.insert(dailyCompletions).values({
    userId,
    protocolId,
    completedOn,
    timeOfDay: slot,
    durationMinutes: options?.durationMinutes ?? null,
    sunriseBuffMultiplier,
    pointsEarned: points,
    isStreakBonus: false,
  });

  // New/better keystone: retroactively apply best mult to non-keystone logs
  let buffAfter = buffBefore;
  if (wasKeystone) {
    buffAfter = await getSunriseBuffToday(userId, completedOn);
    await recomputeDayPoints(userId, completedOn, buffAfter.multiplier);
  }

  let streakBonus = 0;
  let streak = await getUserStreak(userId, completedOn);
  if (count === 0 && !(await hasStreakBonusToday(userId, completedOn))) {
    const streakDays = Math.max(streak.current, 1);
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
      // First log of the day may bump current streak
      streak = await getUserStreak(userId, completedOn);
    }
  }

  scheduleHistoryRevalidate();
  const stats = await getUserDayStats(userId, completedOn);
  return {
    action: "added",
    points,
    streakBonus,
    dayPoints: stats.points,
    streak,
    count: stats.completionCounts.get(protocolId) ?? 0,
    durationMinutesTotal: stats.completionDurations.get(protocolId) ?? 0,
    sunriseMultiplier: buffAfter.multiplier,
    sunriseTierLabel: buffAfter.tier?.shortLabel ?? null,
    sunriseBuffActive: buffAfter.multiplier > 1,
  };
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

  if (isPermanentProtocolId(protocolId)) {
    await recordPermanentSkip(userId, protocolId, completedOn);
  }

  const buff = await getSunriseBuffToday(userId, completedOn);
  await recomputeDayPoints(userId, completedOn, buff.multiplier);
  scheduleHistoryRevalidate();
  const snap = await daySnapshot(userId, completedOn, protocolId);
  return { action: "removed", points: 0, ...snap };
}

export async function toggleCompletionAction(protocolId: string) {
  return logCompletionAction(protocolId);
}

/** Re-log a permanent activity after skipping tonight, or refresh auto-logs. */
export async function logPermanentTonightAction(
  protocolId: string,
): Promise<CompletionResult> {
  const userId = await requireUser();
  const completedOn = await userToday(userId);
  if (!isPermanentProtocolId(protocolId)) {
    return logCompletionAction(protocolId);
  }
  await clearPermanentSkip(userId, protocolId, completedOn);
  return logCompletionAction(protocolId);
}

export { ensurePermanentCompletions };
