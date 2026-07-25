import "server-only";

import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

/** Guest rows older than this are deleted (converted accounts keep is_guest=false). */
export const GUEST_TTL_MS = 24 * 60 * 60 * 1000;

export type GuestCleanupResult = {
  deleted: number;
  cutoffIso: string;
};

/**
 * Delete anonymous guest users whose created_at is older than the TTL.
 * Related rows cascade via FKs (completions, favorites, sessions, etc.).
 * Converted accounts are never guests — they are left alone.
 */
export async function purgeExpiredGuests(
  now = new Date(),
): Promise<GuestCleanupResult> {
  const cutoff = new Date(now.getTime() - GUEST_TTL_MS);

  const stale = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.isGuest, true), lt(users.createdAt, cutoff)));

  if (stale.length === 0) {
    return { deleted: 0, cutoffIso: cutoff.toISOString() };
  }

  const ids = stale.map((r) => r.id);
  await db
    .delete(users)
    .where(and(eq(users.isGuest, true), inArray(users.id, ids)));

  return { deleted: ids.length, cutoffIso: cutoff.toISOString() };
}
