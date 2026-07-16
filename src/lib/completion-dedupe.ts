import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { dailyCompletions } from "@/db/schema";
import { getCatalogProtocols } from "@/lib/catalog";

const MULTI_LOG_IDS = new Set(
  getCatalogProtocols()
    .filter((p) => p.allowsMultiple)
    .map((p) => p.id),
);

const MULTI_LOG_COUNT_IDS = new Set(
  getCatalogProtocols()
    .filter((p) => p.allowsMultiple && !p.durationEnabled)
    .map((p) => p.id),
);

/**
 * Remove duplicate single-log rows (same user / protocol / day).
 * Keeps the earliest row. Multi-log activities are untouched.
 */
export async function dedupeSingleLogCompletions(
  userId: string,
  completedOn: string,
): Promise<number> {
  const singleIds = getCatalogProtocols()
    .filter((p) => !p.allowsMultiple)
    .map((p) => p.id);
  if (singleIds.length === 0) return 0;

  try {
    const rows = await db
      .select({
        id: dailyCompletions.id,
        protocolId: dailyCompletions.protocolId,
        createdAt: dailyCompletions.createdAt,
      })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.completedOn, completedOn),
          eq(dailyCompletions.isStreakBonus, false),
          inArray(dailyCompletions.protocolId, singleIds),
        ),
      )
      .orderBy(dailyCompletions.createdAt);

    const seen = new Set<string>();
    const toDelete: string[] = [];
    for (const row of rows) {
      if (seen.has(row.protocolId)) {
        toDelete.push(row.id);
      } else {
        seen.add(row.protocolId);
      }
    }

    if (toDelete.length === 0) return 0;

    await db
      .delete(dailyCompletions)
      .where(inArray(dailyCompletions.id, toDelete));

    return toDelete.length;
  } catch {
    return 0;
  }
}

export function protocolAllowsMultiple(protocolId: string | null | undefined): boolean {
  if (!protocolId) return true;
  return MULTI_LOG_IDS.has(protocolId);
}

/** Multi-log activities without a timer — show how many times they were logged. */
export function protocolShowsLogCount(
  protocolId: string | null | undefined,
): boolean {
  if (!protocolId) return false;
  return MULTI_LOG_COUNT_IDS.has(protocolId);
}
