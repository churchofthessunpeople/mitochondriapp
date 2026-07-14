import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { protocols, userFavorites, userScheduleItems } from "@/db/schema";
import { isCatalogSelectableProtocolId } from "@/lib/scoring";

export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  try {
    const rows = await db
      .select({ protocolId: userFavorites.protocolId })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));
    const ids = rows.map((r) => r.protocolId);
    const stale = ids.filter((id) => !isCatalogSelectableProtocolId(id));
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
    return new Set(ids.filter(isCatalogSelectableProtocolId));
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
