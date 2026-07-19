"use server";

import { auth } from "@/auth";
import { acknowledgeCelebrations } from "@/lib/achievements";
import {
  STREAK_BADGE_KEYS,
  type StreakBadgeKey,
} from "@/lib/streak-badges";

function isStreakBadgeKey(key: string): key is StreakBadgeKey {
  return (STREAK_BADGE_KEYS as readonly string[]).includes(key);
}

/** Persist that the user saw the morning achievement celebration. */
export async function acknowledgeCelebrationsAction(input: {
  level: number | null;
  badgeKeys: string[];
}): Promise<{ ok: true }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const badgeKeys = input.badgeKeys.filter(isStreakBadgeKey);
  const level =
    typeof input.level === "number" &&
    Number.isFinite(input.level) &&
    input.level > 0
      ? Math.floor(input.level)
      : null;

  await acknowledgeCelebrations(userId, { level, badgeKeys });
  return { ok: true };
}
