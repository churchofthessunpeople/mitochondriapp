import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  dailyCompletions,
  userPermanentSkips,
  users,
  type TimeOfDay,
} from "@/db/schema";
import {
  ensureProtocolInDb,
  getMergedCatalogProtocols,
} from "@/lib/catalog";
import { getUserFavoriteIds } from "@/lib/favorites";
import {
  isMagneticoProtocolId,
  parseMagneticoGauss,
} from "@/lib/magnetico";
import {
  isPermanentProtocol,
  isPermanentProtocolMerged,
} from "@/lib/permanent-activities";
import {
  isVariantProtocolId,
  variantBasePoints,
} from "@/lib/protocol-variants";
import {
  isSleepRoomTempProtocolId,
  parseSleepRoomTempF,
} from "@/lib/sleep-room-temp";
import {
  isSleepSpaceProtocolId,
  isSpaceHygieneProtocolId,
  isWorkSpaceProtocolId,
  parseSleepSpaceConfig,
  parseWorkSpaceConfig,
  pointsForSleepSpace,
  pointsForWorkSpace,
} from "@/lib/space-hygiene";
import {
  bestSunriseMultiplier,
  isSunriseKeystoneProtocol,
  pointsForLog,
  streakBonusPoints,
} from "@/lib/scoring";
import { syncStreakBadges } from "@/lib/streak-badges";
import { hasStreakBonusToday, getUserStreak } from "@/lib/streaks";
import { dedupeSingleLogCompletions } from "@/lib/completion-dedupe";

async function sunriseMultiplierForDay(
  userId: string,
  completedOn: string,
): Promise<number> {
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
    ).multiplier;
  } catch {
    return 1;
  }
}

async function userHygienePreferences(userId: string) {
  const [u] = await db
    .select({
      magneticoGauss: users.magneticoGauss,
      sleepRoomTempF: users.sleepRoomTempF,
      sleepSpaceConfig: users.sleepSpaceConfig,
      workSpaceConfig: users.workSpaceConfig,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return {
    magneticoGauss: parseMagneticoGauss(u?.magneticoGauss),
    sleepRoomTempF: parseSleepRoomTempF(u?.sleepRoomTempF),
    sleepConfig: parseSleepSpaceConfig(u?.sleepSpaceConfig),
    workConfig: parseWorkSpaceConfig(u?.workSpaceConfig),
  };
}

/**
 * Insert today's auto-logs for permanent activities on the user's available list.
 * Returns how many new completion rows were added.
 */
export async function ensurePermanentCompletions(
  userId: string,
  completedOn: string,
): Promise<number> {
  try {
    const { migrateLegacySpaceFavoritesForUser } = await import(
      "@/lib/actions/space-hygiene"
    );
    await migrateLegacySpaceFavoritesForUser(userId);
  } catch {
    // Favorites migration is best-effort; continue auto-log.
  }

  const [favoriteIds, catalog] = await Promise.all([
    getUserFavoriteIds(userId),
    getMergedCatalogProtocols(),
  ]);

  const byId = new Map(catalog.map((p) => [p.id, p]));
  const targets = [...favoriteIds].filter((id) => {
    const row = byId.get(id);
    return row != null && isPermanentProtocol(row) && !row.allowsMultiple;
  });
  if (targets.length === 0) return 0;

  await dedupeSingleLogCompletions(userId, completedOn);
  await Promise.all(targets.map((id) => ensureProtocolInDb(id)));

  const needsHygienePrefs = targets.some(
    (id) => isVariantProtocolId(id) || isSpaceHygieneProtocolId(id),
  );
  const [skippedRows, existingRows, buffBefore, hygienePrefs] =
    await Promise.all([
      db
        .select({ protocolId: userPermanentSkips.protocolId })
        .from(userPermanentSkips)
        .where(
          and(
            eq(userPermanentSkips.userId, userId),
            eq(userPermanentSkips.completedOn, completedOn),
            inArray(userPermanentSkips.protocolId, targets),
          ),
        ),
      db
        .select({ protocolId: dailyCompletions.protocolId })
        .from(dailyCompletions)
        .where(
          and(
            eq(dailyCompletions.userId, userId),
            eq(dailyCompletions.completedOn, completedOn),
            eq(dailyCompletions.isStreakBonus, false),
            inArray(dailyCompletions.protocolId, targets),
          ),
        ),
      sunriseMultiplierForDay(userId, completedOn),
      needsHygienePrefs
        ? userHygienePreferences(userId)
        : Promise.resolve(null),
    ]);

  const skipped = new Set(skippedRows.map((r) => r.protocolId));
  const existing = new Set(existingRows.map((r) => r.protocolId));

  let inserted = 0;
  let streakAwarded = false;

  for (const protocolId of targets) {
    if (skipped.has(protocolId) || existing.has(protocolId)) continue;
    const protocol = byId.get(protocolId);
    if (!protocol) continue;

    const slot: TimeOfDay | null =
      protocol.lockedTimeOfDay ?? protocol.timeOfDay ?? null;
    const multForThisLog = isSunriseKeystoneProtocol(protocol)
      ? 1
      : buffBefore;

    const isMagnetico = isMagneticoProtocolId(protocolId);
    const isSleepTemp = isSleepRoomTempProtocolId(protocolId);
    let variantValue: number | null = null;
    let basePoints: number | undefined;

    if (isSleepSpaceProtocolId(protocolId) && hygienePrefs) {
      basePoints = pointsForSleepSpace(hygienePrefs.sleepConfig, {
        magneticoGauss: hygienePrefs.magneticoGauss,
        sleepRoomTempF: hygienePrefs.sleepRoomTempF,
      });
      if (basePoints <= 0) continue;
    } else if (isWorkSpaceProtocolId(protocolId) && hygienePrefs) {
      basePoints = pointsForWorkSpace(hygienePrefs.workConfig);
      if (basePoints <= 0) continue;
    } else if (isMagnetico || isSleepTemp) {
      variantValue = isMagnetico
        ? hygienePrefs!.magneticoGauss
        : hygienePrefs!.sleepRoomTempF;
      basePoints =
        variantValue != null
          ? variantBasePoints(protocolId, variantValue, protocol.points)
          : undefined;
    }

    const points = pointsForLog(protocol, null, {
      sunriseMultiplier: multForThisLog,
      basePoints,
    });

    await db.insert(dailyCompletions).values({
      userId,
      protocolId,
      completedOn,
      timeOfDay: slot,
      durationMinutes: null,
      variantValue,
      sunriseBuffMultiplier: null,
      pointsEarned: points,
      isStreakBonus: false,
    });
    inserted += 1;
    existing.add(protocolId);

    if (!streakAwarded && !(await hasStreakBonusToday(userId, completedOn))) {
      const { current } = await getUserStreak(userId, completedOn);
      const streakBonus = streakBonusPoints(Math.max(current, 1));
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
        streakAwarded = true;
      }
    }
  }

  if (inserted > 0) {
    const streak = await getUserStreak(userId, completedOn);
    await syncStreakBadges(
      userId,
      Math.max(streak.current, streak.best),
    );
  }

  return inserted;
}

export async function recordPermanentSkip(
  userId: string,
  protocolId: string,
  completedOn: string,
): Promise<void> {
  if (!(await isPermanentProtocolMerged(protocolId))) return;
  await db
    .insert(userPermanentSkips)
    .values({ userId, protocolId, completedOn })
    .onConflictDoNothing();
}

export async function clearPermanentSkip(
  userId: string,
  protocolId: string,
  completedOn: string,
): Promise<void> {
  await db
    .delete(userPermanentSkips)
    .where(
      and(
        eq(userPermanentSkips.userId, userId),
        eq(userPermanentSkips.protocolId, protocolId),
        eq(userPermanentSkips.completedOn, completedOn),
      ),
    );
}
