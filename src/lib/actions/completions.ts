"use server";

import { and, desc, eq } from "drizzle-orm";
import { after } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, protocols, users, type TimeOfDay } from "@/db/schema";
import { getMergedCatalogProtocolById } from "@/lib/catalog";
import { getUserDayStats } from "@/lib/data";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import {
  clearPermanentSkip,
  ensurePermanentCompletions,
  recordPermanentSkip,
} from "@/lib/permanent-completions";
import { getSunriseBuffToday } from "@/lib/sunrise-buff";
import { isPermanentProtocolMerged } from "@/lib/permanent-activities";
import {
  isColdThermoProtocolId,
  OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  parseColdThermoSkinTempF,
} from "@/lib/cold-thermo-skin-temp";
import {
  encodeMovementSettingVariant,
  isMovementSettingProtocolId,
  movementSettingBasePoints,
  parseMovementSetting,
  type MovementSetting,
} from "@/lib/movement-setting";
import {
  isMagneticoProtocolId,
  parseMagneticoGauss,
} from "@/lib/magnetico";
import {
  isVariantProtocolId,
  variantBasePoints,
} from "@/lib/protocol-variants";
import { parseSleepRoomTempF, isSleepRoomTempProtocolId } from "@/lib/sleep-room-temp";
import {
  encodeSunExposureVariant,
  isSunExposureProtocolId,
  sunExposureBasePoints,
  timeOfDayForSunSlot,
  type SunExposureLogInput,
} from "@/lib/sun-exposure";
import {
  effectiveSunriseBoostMultiplier,
  encodeSunriseEndOffset,
  pointsForSunriseKeystoneLog,
  sunriseSkyFromModifiers,
} from "@/lib/sunrise-keystone-points";
import {
  resolveSunriseSessionOffsets,
  resolveSunriseViewOffset,
} from "@/lib/sunrise-timing";
import { getUserSunriseForDate } from "@/lib/sunrise-timing-server";
import { revalidatePath } from "next/cache";
import {
  isSunriseKeystoneProtocol,
  isSunriseKeystoneProtocolId,
  pointsForLog,
  streakBonusPoints,
  sunriseTierForProtocolId,
  type SunriseModifiers,
} from "@/lib/scoring";
import { syncStreakBadges } from "@/lib/streak-badges";
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
      variantValue: dailyCompletions.variantValue,
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
    let basePoints: number | undefined;
    if (isSunriseKeystoneProtocolId(row.protocolId)) {
      basePoints = pointsForSunriseKeystoneLog(
        row.protocol.points,
        row.variantValue,
        row.durationMinutes,
      );
    } else {
      basePoints = variantBasePoints(
        row.protocolId,
        row.variantValue,
        row.protocol.points,
      );
    }
    const next = pointsForLog(row.protocol, row.durationMinutes, {
      sunriseMultiplier,
      basePoints,
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
    /** ISO timestamp when morning light viewing started (defaults to now). */
    viewedAtStart?: string;
    /** ISO timestamp when morning light viewing ended (defaults to start). */
    viewedAtEnd?: string;
    /** @deprecated use viewedAtStart */
    viewedAt?: string;
    /** Optional skin surface temp (°F) for cold thermogenesis logs. */
    skinTempF?: number | null;
    /** Daytime sun exposure dialog answers. */
    sunExposure?: SunExposureLogInput;
    /** Movement / exercise environment (sunlight, outside, indoors). */
    movementSetting?: MovementSetting;
  },
): Promise<CompletionResult> {
  const userId = await requireUser();
  const completedOn = await userToday(userId);

  // Local seeds are source of truth — skip full catalog upsert on every tap
  const protocol = await getMergedCatalogProtocolById(protocolId);
  if (!protocol) throw new Error("Activity not found");

  const slot =
    (isSunExposureProtocolId(protocolId) && options?.sunExposure
      ? timeOfDayForSunSlot(options.sunExposure.slot)
      : null) ??
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
      if (await isPermanentProtocolMerged(protocolId)) {
        await recordPermanentSkip(userId, protocolId, completedOn);
      }
      const buff = await getSunriseBuffToday(userId, completedOn);
      await recomputeDayPoints(userId, completedOn, buff.multiplier);
      scheduleHistoryRevalidate();
      const snap = await daySnapshot(userId, completedOn, protocolId);
      return { action: "removed", points: 0, ...snap };
    }
  }

  if (await isPermanentProtocolMerged(protocolId)) {
    await clearPermanentSkip(userId, protocolId, completedOn);
  }

  const buffBefore = await getSunriseBuffToday(userId, completedOn);
  // Keystones never receive the mult; other logs use best tier so far
  const multForThisLog = wasKeystone ? 1 : buffBefore.multiplier;

  let variantValue: number | null = null;
  let durationMinutes: number | null = options?.durationMinutes ?? null;
  let basePoints: number | undefined;
  if (isSunriseKeystoneProtocol(protocol)) {
    const sunriseCtx = await getUserSunriseForDate(userId, completedOn);
    const sky = sunriseSkyFromModifiers(options?.sunriseModifiers);
    const hasSession =
      options?.viewedAtStart != null || options?.viewedAtEnd != null;
    if (hasSession) {
      const { startOffset, endOffset } = resolveSunriseSessionOffsets(
        completedOn,
        options?.viewedAtStart,
        options?.viewedAtEnd,
        sunriseCtx,
      );
      variantValue = startOffset;
      durationMinutes = encodeSunriseEndOffset(endOffset, sky);
    } else {
      variantValue = resolveSunriseViewOffset(
        completedOn,
        options?.viewedAt,
        sunriseCtx,
      );
      durationMinutes = null;
    }
    basePoints = pointsForSunriseKeystoneLog(
      protocol.points,
      variantValue,
      durationMinutes,
    );
  } else if (isColdThermoProtocolId(protocolId)) {
    variantValue = parseColdThermoSkinTempF(
      options?.skinTempF ?? OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
    );
    basePoints = variantBasePoints(protocolId, variantValue, protocol.points);
  } else if (isSunExposureProtocolId(protocolId)) {
    const sun = options?.sunExposure;
    if (!sun) throw new Error("Sun exposure details required");
    variantValue = encodeSunExposureVariant(sun);
    basePoints = sunExposureBasePoints(protocol.points, { slot: sun.slot });
  } else if (isMovementSettingProtocolId(protocolId)) {
    const setting = parseMovementSetting(
      options?.movementSetting ?? "outside",
    );
    variantValue = encodeMovementSettingVariant(setting);
    basePoints = movementSettingBasePoints(setting, protocol.points);
  } else if (isVariantProtocolId(protocolId)) {
    const [u] = await db
      .select({
        magneticoGauss: users.magneticoGauss,
        sleepRoomTempF: users.sleepRoomTempF,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const rawVariant = isMagneticoProtocolId(protocolId)
      ? u?.magneticoGauss
      : isSleepRoomTempProtocolId(protocolId)
        ? u?.sleepRoomTempF
        : null;
    variantValue =
      rawVariant != null
        ? isMagneticoProtocolId(protocolId)
          ? parseMagneticoGauss(rawVariant)
          : parseSleepRoomTempF(rawVariant)
        : null;
    basePoints =
      variantValue != null
        ? variantBasePoints(protocolId, variantValue, protocol.points)
        : undefined;
  }

  const points = pointsForLog(protocol, options?.durationMinutes, {
    sunriseMultiplier: multForThisLog,
    basePoints,
  });

  const tier = wasKeystone ? sunriseTierForProtocolId(protocolId) : null;
  const sunriseBuffMultiplier =
    wasKeystone && tier
      ? options?.sunriseModifiers
        ? effectiveSunriseBoostMultiplier(
            tier,
            options.sunriseModifiers,
            variantValue,
            durationMinutes,
          )
        : tier.multiplier
      : null;

  await db.insert(dailyCompletions).values({
    userId,
    protocolId,
    completedOn,
    timeOfDay: slot,
    durationMinutes: isSunriseKeystoneProtocol(protocol)
      ? durationMinutes
      : (options?.durationMinutes ?? null),
    variantValue,
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
  await syncStreakBadges(
    userId,
    Math.max(streak.current, streak.best),
  );

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

      if (await isPermanentProtocolMerged(protocolId)) {
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
  if (!(await isPermanentProtocolMerged(protocolId))) {
    return logCompletionAction(protocolId);
  }
  await clearPermanentSkip(userId, protocolId, completedOn);

  const existing = await db
    .select({ pointsEarned: dailyCompletions.pointsEarned })
    .from(dailyCompletions)
    .where(
      and(
        eq(dailyCompletions.userId, userId),
        eq(dailyCompletions.protocolId, protocolId),
        eq(dailyCompletions.completedOn, completedOn),
        eq(dailyCompletions.isStreakBonus, false),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const snap = await daySnapshot(userId, completedOn, protocolId);
    return {
      action: "added",
      points: existing[0]!.pointsEarned,
      ...snap,
    };
  }

  return logCompletionAction(protocolId);
}
