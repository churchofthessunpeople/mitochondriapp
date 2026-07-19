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

async function userVariantPreferences(userId: string) {
  const [u] = await db
    .select({
      magneticoGauss: users.magneticoGauss,
      sleepRoomTempF: users.sleepRoomTempF,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return {
    magneticoGauss: parseMagneticoGauss(u?.magneticoGauss),
    sleepRoomTempF: parseSleepRoomTempF(u?.sleepRoomTempF),
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

  const [skippedRows, existingRows, buffBefore, variantPrefs] =
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
      targets.some(isVariantProtocolId)
        ? userVariantPreferences(userId)
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
    const variantValue = isMagnetico
      ? variantPrefs!.magneticoGauss
      : isSleepTemp
        ? variantPrefs!.sleepRoomTempF
        : null;
    const points = pointsForLog(protocol, null, {
      sunriseMultiplier: multForThisLog,
      basePoints:
        variantValue != null
          ? variantBasePoints(protocolId, variantValue, protocol.points)
          : undefined,
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
