import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { protocols, userFavorites, userScheduleItems } from "@/db/schema";
import { ensureProtocolInDb } from "@/lib/catalog";
import { isCatalogSelectableProtocolId } from "@/lib/scoring";
import {
  remapSunExposureFavoriteId,
  SUN_EXPOSURE_LEGACY_IDS,
  SUN_EXPOSURE_PROTOCOL_ID,
} from "@/lib/sun-exposure";
import {
  COLD_FACE_PLUNGE_LEGACY_ID,
  COLD_THERMOGENESIS_PROTOCOL_ID,
  remapColdThermoFavoriteId,
} from "@/lib/cold-thermo-skin-temp";
import {
  DRINKING_WATER_LEGACY_IDS,
  DRINKING_WATER_PROTOCOL_ID,
  remapDrinkingWaterFavoriteId,
} from "@/lib/drinking-water";
import {
  EXERCISE_LEGACY_IDS,
  EXERCISE_PROTOCOL_ID,
  remapExerciseFavoriteId,
} from "@/lib/exercise";

export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  try {
    const rows = await db
      .select({ protocolId: userFavorites.protocolId })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));
    const ids = rows.map((r) => r.protocolId);

    const legacySun = ids.filter((id) =>
      (SUN_EXPOSURE_LEGACY_IDS as readonly string[]).includes(id),
    );
    if (legacySun.length > 0) {
      await ensureProtocolInDb(SUN_EXPOSURE_PROTOCOL_ID);
      const alreadyHas = ids.includes(SUN_EXPOSURE_PROTOCOL_ID);
      if (!alreadyHas) {
        await db
          .insert(userFavorites)
          .values({
            userId,
            protocolId: SUN_EXPOSURE_PROTOCOL_ID,
          })
          .onConflictDoNothing();
      }
      await db
        .delete(userFavorites)
        .where(
          and(
            eq(userFavorites.userId, userId),
            inArray(userFavorites.protocolId, [...SUN_EXPOSURE_LEGACY_IDS]),
          ),
        );
      await db
        .delete(userScheduleItems)
        .where(
          and(
            eq(userScheduleItems.userId, userId),
            inArray(userScheduleItems.protocolId, [...SUN_EXPOSURE_LEGACY_IDS]),
          ),
        );
    }

    if (ids.includes(COLD_FACE_PLUNGE_LEGACY_ID)) {
      await ensureProtocolInDb(COLD_THERMOGENESIS_PROTOCOL_ID);
      if (!ids.includes(COLD_THERMOGENESIS_PROTOCOL_ID)) {
        await db
          .insert(userFavorites)
          .values({
            userId,
            protocolId: COLD_THERMOGENESIS_PROTOCOL_ID,
          })
          .onConflictDoNothing();
      }
      await db
        .delete(userFavorites)
        .where(
          and(
            eq(userFavorites.userId, userId),
            eq(userFavorites.protocolId, COLD_FACE_PLUNGE_LEGACY_ID),
          ),
        );
      await db
        .delete(userScheduleItems)
        .where(
          and(
            eq(userScheduleItems.userId, userId),
            eq(userScheduleItems.protocolId, COLD_FACE_PLUNGE_LEGACY_ID),
          ),
        );
    }

    const legacyWater = ids.filter((id) =>
      (DRINKING_WATER_LEGACY_IDS as readonly string[]).includes(id),
    );
    if (legacyWater.length > 0) {
      await ensureProtocolInDb(DRINKING_WATER_PROTOCOL_ID);
      if (!ids.includes(DRINKING_WATER_PROTOCOL_ID)) {
        await db
          .insert(userFavorites)
          .values({
            userId,
            protocolId: DRINKING_WATER_PROTOCOL_ID,
          })
          .onConflictDoNothing();
      }
      await db
        .delete(userFavorites)
        .where(
          and(
            eq(userFavorites.userId, userId),
            inArray(userFavorites.protocolId, [...DRINKING_WATER_LEGACY_IDS]),
          ),
        );
      await db
        .delete(userScheduleItems)
        .where(
          and(
            eq(userScheduleItems.userId, userId),
            inArray(userScheduleItems.protocolId, [
              ...DRINKING_WATER_LEGACY_IDS,
            ]),
          ),
        );
    }

    const legacyExercise = ids.filter((id) =>
      (EXERCISE_LEGACY_IDS as readonly string[]).includes(id),
    );
    if (legacyExercise.length > 0) {
      await ensureProtocolInDb(EXERCISE_PROTOCOL_ID);
      if (!ids.includes(EXERCISE_PROTOCOL_ID)) {
        await db
          .insert(userFavorites)
          .values({
            userId,
            protocolId: EXERCISE_PROTOCOL_ID,
          })
          .onConflictDoNothing();
      }
      await db
        .delete(userFavorites)
        .where(
          and(
            eq(userFavorites.userId, userId),
            inArray(userFavorites.protocolId, [...EXERCISE_LEGACY_IDS]),
          ),
        );
      await db
        .delete(userScheduleItems)
        .where(
          and(
            eq(userScheduleItems.userId, userId),
            inArray(userScheduleItems.protocolId, [...EXERCISE_LEGACY_IDS]),
          ),
        );
    }

    const remapped = [
      ...new Set(
        ids
          .map(remapSunExposureFavoriteId)
          .map(remapColdThermoFavoriteId)
          .map(remapDrinkingWaterFavoriteId)
          .map(remapExerciseFavoriteId),
      ),
    ];
    const stale = remapped.filter((id) => !isCatalogSelectableProtocolId(id));
    if (stale.length > 0) {
      await db
        .delete(userFavorites)
        .where(
          and(
            eq(userFavorites.userId, userId),
            inArray(userFavorites.protocolId, stale),
          ),
        );
      await db
        .delete(userScheduleItems)
        .where(
          and(
            eq(userScheduleItems.userId, userId),
            inArray(userScheduleItems.protocolId, stale),
          ),
        );
    }
    return new Set(remapped.filter(isCatalogSelectableProtocolId));
  } catch {
    return new Set();
  }
}

export async function getUserFavoriteProtocols(userId: string) {
  try {
    return await db
      .select({ protocol: protocols })
      .from(userFavorites)
      .innerJoin(protocols, eq(protocols.id, userFavorites.protocolId))
      .where(eq(userFavorites.userId, userId))
      .orderBy(asc(protocols.sortOrder));
  } catch {
    return [];
  }
}
