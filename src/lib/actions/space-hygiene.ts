"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { dailyCompletions, userFavorites, users } from "@/db/schema";
import { getCatalogProtocolById } from "@/lib/catalog";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import { resolveEditableCompletedOn } from "@/lib/editable-day";
import { getUserFavoriteIds } from "@/lib/favorites";
import { parseMagneticoGauss } from "@/lib/magnetico";
import { clearPermanentSkip } from "@/lib/permanent-completions";
import { isSunriseKeystoneProtocol, pointsForLog } from "@/lib/scoring";
import { parseSleepRoomTempF } from "@/lib/sleep-room-temp";
import {
  DEFAULT_SLEEP_SPACE_CONFIG,
  DEFAULT_WORK_SPACE_CONFIG,
  SLEEP_SPACE_PROTOCOL_ID,
  WORK_SPACE_PROTOCOL_ID,
  migrateLegacyFavoritesToSpaceConfigs,
  parseSleepSpaceConfig,
  parseWorkSpaceConfig,
  pointsForSleepSpace,
  pointsForWorkSpace,
  serializeSleepSpaceConfig,
  serializeWorkSpaceConfig,
  type SleepSpaceConfig,
  type WorkSpaceConfig,
} from "@/lib/space-hygiene";
import { getSunriseBuffToday } from "@/lib/sunrise-buff";
import { ensureProtocolInDb } from "@/lib/catalog";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function todayForUser(userId: string) {
  const [u] = await db
    .select({ timezone: users.timezone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return getTodayIsoForTimezone(u?.timezone || "UTC");
}

async function completedOnForUser(
  userId: string,
  requestedIso?: string | null,
) {
  return resolveEditableCompletedOn(await todayForUser(userId), requestedIso);
}

async function refreshSpaceCompletion(
  userId: string,
  protocolId: string,
  completedOn: string,
  basePoints: number,
) {
  const protocol = getCatalogProtocolById(protocolId);
  if (!protocol) return;

  const [row] = await db
    .select({ id: dailyCompletions.id })
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

  if (!row) return;

  if (basePoints <= 0) {
    await db.delete(dailyCompletions).where(eq(dailyCompletions.id, row.id));
    return;
  }

  const buff = await getSunriseBuffToday(userId, completedOn);
  const mult = isSunriseKeystoneProtocol(protocol) ? 1 : buff.multiplier;
  const points = pointsForLog(protocol, null, {
    sunriseMultiplier: mult,
    basePoints,
  });
  await db
    .update(dailyCompletions)
    .set({ pointsEarned: points, variantValue: null })
    .where(eq(dailyCompletions.id, row.id));
}

export async function getSpaceHygienePrefsAction(): Promise<{
  sleepConfig: SleepSpaceConfig;
  workConfig: WorkSpaceConfig;
  magneticoGauss: number;
  sleepRoomTempF: number;
}> {
  const userId = await requireUserId();
  const [u] = await db
    .select({
      sleepSpaceConfig: users.sleepSpaceConfig,
      workSpaceConfig: users.workSpaceConfig,
      magneticoGauss: users.magneticoGauss,
      sleepRoomTempF: users.sleepRoomTempF,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return {
    sleepConfig: parseSleepSpaceConfig(u?.sleepSpaceConfig),
    workConfig: parseWorkSpaceConfig(u?.workSpaceConfig),
    magneticoGauss: parseMagneticoGauss(u?.magneticoGauss),
    sleepRoomTempF: parseSleepRoomTempF(u?.sleepRoomTempF),
  };
}

export async function saveSleepSpaceConfigAction(input: {
  config: SleepSpaceConfig;
  magneticoGauss?: number;
  sleepRoomTempF?: number;
  completedOn?: string | null;
}): Promise<{ dayPoints: number; points: number; logged: boolean }> {
  const userId = await requireUserId();
  const config = parseSleepSpaceConfig(input.config);
  const gauss =
    input.magneticoGauss != null
      ? parseMagneticoGauss(input.magneticoGauss)
      : undefined;
  const tempF =
    input.sleepRoomTempF != null
      ? parseSleepRoomTempF(input.sleepRoomTempF)
      : undefined;

  const patch: Partial<typeof users.$inferInsert> = {
    sleepSpaceConfig: serializeSleepSpaceConfig(config),
  };
  if (gauss != null) patch.magneticoGauss = gauss;
  if (tempF != null) patch.sleepRoomTempF = tempF;

  await db.update(users).set(patch).where(eq(users.id, userId));

  const completedOn = await completedOnForUser(userId, input.completedOn);
  const [u] = await db
    .select({
      magneticoGauss: users.magneticoGauss,
      sleepRoomTempF: users.sleepRoomTempF,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const basePoints = pointsForSleepSpace(config, {
    magneticoGauss: u?.magneticoGauss,
    sleepRoomTempF: u?.sleepRoomTempF,
  });

  await ensureProtocolInDb(SLEEP_SPACE_PROTOCOL_ID);
  await clearPermanentSkip(userId, SLEEP_SPACE_PROTOCOL_ID, completedOn);
  await refreshSpaceCompletion(
    userId,
    SLEEP_SPACE_PROTOCOL_ID,
    completedOn,
    basePoints,
  );

  let logged = false;
  if (basePoints > 0) {
    const [existing] = await db
      .select({ id: dailyCompletions.id })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.protocolId, SLEEP_SPACE_PROTOCOL_ID),
          eq(dailyCompletions.completedOn, completedOn),
          eq(dailyCompletions.isStreakBonus, false),
        ),
      )
      .limit(1);
    if (!existing) {
      const { logPermanentTonightAction } = await import(
        "@/lib/actions/completions"
      );
      await logPermanentTonightAction(SLEEP_SPACE_PROTOCOL_ID, completedOn);
      logged = true;
    } else {
      logged = true;
    }
  }

  const { getUserDayStats } = await import("@/lib/data");
  const stats = await getUserDayStats(userId, completedOn);
  return { dayPoints: stats.points, points: basePoints, logged };
}

export async function saveWorkSpaceConfigAction(input: {
  config: WorkSpaceConfig;
  completedOn?: string | null;
}): Promise<{ dayPoints: number; points: number; logged: boolean }> {
  const userId = await requireUserId();
  const config = parseWorkSpaceConfig(input.config);

  await db
    .update(users)
    .set({ workSpaceConfig: serializeWorkSpaceConfig(config) })
    .where(eq(users.id, userId));

  const completedOn = await completedOnForUser(userId, input.completedOn);
  const basePoints = pointsForWorkSpace(config);

  await ensureProtocolInDb(WORK_SPACE_PROTOCOL_ID);
  await clearPermanentSkip(userId, WORK_SPACE_PROTOCOL_ID, completedOn);
  await refreshSpaceCompletion(
    userId,
    WORK_SPACE_PROTOCOL_ID,
    completedOn,
    basePoints,
  );

  let logged = false;
  if (basePoints > 0) {
    const [existing] = await db
      .select({ id: dailyCompletions.id })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.protocolId, WORK_SPACE_PROTOCOL_ID),
          eq(dailyCompletions.completedOn, completedOn),
          eq(dailyCompletions.isStreakBonus, false),
        ),
      )
      .limit(1);
    if (!existing) {
      const { logPermanentTonightAction } = await import(
        "@/lib/actions/completions"
      );
      await logPermanentTonightAction(WORK_SPACE_PROTOCOL_ID, completedOn);
      logged = true;
    } else {
      logged = true;
    }
  }

  const { getUserDayStats } = await import("@/lib/data");
  const stats = await getUserDayStats(userId, completedOn);
  return { dayPoints: stats.points, points: basePoints, logged };
}

/**
 * One-time-ish migrate: roll legacy permanent favorites into Sleep/Work Space.
 */
export async function migrateLegacySpaceFavoritesForUser(
  userId: string,
): Promise<boolean> {
  const favoriteIds = await getUserFavoriteIds(userId);
  const [u] = await db
    .select({
      sleepSpaceConfig: users.sleepSpaceConfig,
      workSpaceConfig: users.workSpaceConfig,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const result = migrateLegacyFavoritesToSpaceConfigs({
    favoriteIds,
    sleepConfig: parseSleepSpaceConfig(
      u?.sleepSpaceConfig ?? DEFAULT_SLEEP_SPACE_CONFIG,
    ),
    workConfig: parseWorkSpaceConfig(
      u?.workSpaceConfig ?? DEFAULT_WORK_SPACE_CONFIG,
    ),
  });
  if (!result.changed) return false;

  await db
    .update(users)
    .set({
      sleepSpaceConfig: serializeSleepSpaceConfig(result.sleepConfig),
      workSpaceConfig: serializeWorkSpaceConfig(result.workConfig),
    })
    .where(eq(users.id, userId));

  const nextSet = new Set(result.nextFavoriteIds);
  const toRemove = [...favoriteIds].filter((id) => !nextSet.has(id));
  const toAdd = result.nextFavoriteIds.filter((id) => !favoriteIds.has(id));

  if (toRemove.length > 0) {
    const { inArray } = await import("drizzle-orm");
    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          inArray(userFavorites.protocolId, toRemove),
        ),
      );
  }
  for (const protocolId of toAdd) {
    await ensureProtocolInDb(protocolId);
    await db
      .insert(userFavorites)
      .values({ userId, protocolId })
      .onConflictDoNothing();
  }

  return true;
}
