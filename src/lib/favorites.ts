import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { protocols, userFavorites } from "@/db/schema";

export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  try {
    const rows = await db
      .select({ protocolId: userFavorites.protocolId })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));
    return new Set(rows.map((r) => r.protocolId));
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
