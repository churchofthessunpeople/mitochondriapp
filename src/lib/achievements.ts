import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { userBadges, users } from "@/db/schema";
import { formatLevelLabel, levelFromXp } from "@/lib/levels";
import {
  STREAK_BADGES,
  type StreakBadgeKey,
} from "@/lib/streak-badges";

export type PendingBadgeCelebration = {
  key: StreakBadgeKey;
  label: string;
  shortLabel: string;
  days: number;
  description: string;
  streakDays: number;
};

export type PendingCelebrations = {
  /** New level reached (null if none) */
  level: number | null;
  badges: PendingBadgeCelebration[];
};

export function hasPendingCelebrations(p: PendingCelebrations): boolean {
  return p.level != null || p.badges.length > 0;
}

/**
 * Resolve level/badge celebrations that haven't been shown yet.
 * Bootstraps celebratedLevel on first run so existing progress isn't replayed.
 */
export async function resolvePendingCelebrations(
  userId: string,
  lifetimePoints: number,
): Promise<PendingCelebrations> {
  const currentLevel = levelFromXp(lifetimePoints).level;

  const [u] = await db
    .select({ celebratedLevel: users.celebratedLevel })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  let celebratedLevel = u?.celebratedLevel ?? 0;

  // First load after feature ships: adopt current progress silently
  // so historical levels/badges are not replayed as new wins.
  if (celebratedLevel === 0) {
    const now = new Date();
    await db
      .update(users)
      .set({ celebratedLevel: currentLevel })
      .where(eq(users.id, userId));
    try {
      await db
        .update(userBadges)
        .set({ celebratedAt: now })
        .where(
          and(
            eq(userBadges.userId, userId),
            isNull(userBadges.celebratedAt),
          ),
        );
    } catch {
      /* table may not exist yet */
    }
    return { level: null, badges: [] };
  }

  const level =
    currentLevel > celebratedLevel ? currentLevel : null;

  let badgeRows: {
    badgeKey: string;
    streakDays: number;
  }[] = [];
  try {
    badgeRows = await db
      .select({
        badgeKey: userBadges.badgeKey,
        streakDays: userBadges.streakDays,
      })
      .from(userBadges)
      .where(
        and(
          eq(userBadges.userId, userId),
          isNull(userBadges.celebratedAt),
        ),
      );
  } catch {
    badgeRows = [];
  }

  const badges: PendingBadgeCelebration[] = [];
  for (const row of badgeRows) {
    const def = STREAK_BADGES.find((b) => b.key === row.badgeKey);
    if (!def) continue;
    badges.push({
      key: def.key,
      label: def.label,
      shortLabel: def.shortLabel,
      days: def.days,
      description: def.description,
      streakDays: row.streakDays,
    });
  }

  // Stable order: week → month → year
  badges.sort((a, b) => a.days - b.days);

  return { level, badges };
}

/** Mark pending celebrations as seen after the popup is dismissed. */
export async function acknowledgeCelebrations(
  userId: string,
  opts: {
    level: number | null;
    badgeKeys: StreakBadgeKey[];
  },
): Promise<void> {
  if (opts.level != null && opts.level > 0) {
    const [u] = await db
      .select({ celebratedLevel: users.celebratedLevel })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const prev = u?.celebratedLevel ?? 0;
    if (opts.level > prev) {
      await db
        .update(users)
        .set({ celebratedLevel: opts.level })
        .where(eq(users.id, userId));
    }
  }

  if (opts.badgeKeys.length > 0) {
    await db
      .update(userBadges)
      .set({ celebratedAt: new Date() })
      .where(
        and(
          eq(userBadges.userId, userId),
          inArray(userBadges.badgeKey, opts.badgeKeys),
          isNull(userBadges.celebratedAt),
        ),
      );
  }
}

export function celebrationHeadline(pending: PendingCelebrations): string {
  if (pending.level != null && pending.badges.length > 0) {
    return "New achievements";
  }
  if (pending.level != null) {
    return formatLevelLabel(pending.level);
  }
  if (pending.badges.length === 1) {
    return pending.badges[0]!.label;
  }
  return "New badges";
}
