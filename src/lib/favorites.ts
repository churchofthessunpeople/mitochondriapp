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

    const remapped = [
      ...new Set(ids.map(remapSunExposureFavoriteId)),
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
