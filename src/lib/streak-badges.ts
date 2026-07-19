import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { dailyCompletions, userBadges } from "@/db/schema";

export const STREAK_BADGE_KEYS = [
  "streak_week",
  "streak_month",
  "streak_year",
] as const;

export type StreakBadgeKey = (typeof STREAK_BADGE_KEYS)[number];

export type StreakBadgeDef = {
  key: StreakBadgeKey;
  label: string;
  shortLabel: string;
  days: number;
  description: string;
};

export const STREAK_BADGES: readonly StreakBadgeDef[] = [
  {
    key: "streak_week",
    label: "Week streak",
    shortLabel: "Week",
    days: 7,
    description: "Logged activity 7 days in a row",
  },
  {
    key: "streak_month",
    label: "Month streak",
    shortLabel: "Month",
    days: 30,
    description: "Logged activity 30 days in a row",
  },
  {
    key: "streak_year",
    label: "Year streak",
    shortLabel: "Year",
    days: 365,
    description: "Logged activity 365 days in a row",
  },
] as const;

export type UserBadgeRow = {
  key: StreakBadgeKey;
  earnedAt: Date;
  streakDays: number;
};

export type BadgeStatus = StreakBadgeDef & {
  earned: boolean;
  earnedAt: Date | null;
  streakDays: number | null;
};

/** Longest consecutive active days across full history (badge sync only). */
export async function getUserLongestStreakDays(
  userId: string,
): Promise<number> {
  try {
    const rows = await db
      .select({ day: dailyCompletions.completedOn })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.isStreakBonus, false),
        ),
      )
      .groupBy(dailyCompletions.completedOn)
      .orderBy(asc(dailyCompletions.completedOn));

    if (rows.length === 0) return 0;

    let best = 1;
    let run = 1;
    for (let i = 1; i < rows.length; i++) {
      const prev = parseIso(rows[i - 1]!.day);
      const cur = parseIso(rows[i]!.day);
      const diff =
        (cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
      if (diff === 1) {
        run += 1;
        best = Math.max(best, run);
      } else if (diff !== 0) {
        run = 1;
      }
    }
    return best;
  } catch {
    return 0;
  }
}

/** Award any streak badges the user has earned but not yet stored. */
export async function syncStreakBadges(
  userId: string,
  streakDaysHint?: number,
): Promise<StreakBadgeKey[]> {
  const longest = Math.max(
    streakDaysHint ?? 0,
    await getUserLongestStreakDays(userId),
  );
  if (longest <= 0) return [];

  const earned: StreakBadgeKey[] = [];
  for (const badge of STREAK_BADGES) {
    if (longest < badge.days) continue;
    try {
      const inserted = await db
        .insert(userBadges)
        .values({
          userId,
          badgeKey: badge.key,
          streakDays: longest,
        })
        .onConflictDoNothing()
        .returning({ badgeKey: userBadges.badgeKey });
      if (inserted[0]?.badgeKey === badge.key) {
        earned.push(badge.key);
      }
    } catch {
      /* table may not exist yet during deploy race */
    }
  }
  return earned;
}

export async function listUserBadges(userId: string): Promise<UserBadgeRow[]> {
  try {
    const rows = await db
      .select({
        badgeKey: userBadges.badgeKey,
        earnedAt: userBadges.earnedAt,
        streakDays: userBadges.streakDays,
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    const out: UserBadgeRow[] = [];
    for (const r of rows) {
      if (!isStreakBadgeKey(r.badgeKey)) continue;
      out.push({
        key: r.badgeKey,
        earnedAt: r.earnedAt,
        streakDays: r.streakDays,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function badgeStatusList(
  earned: UserBadgeRow[],
): BadgeStatus[] {
  const byKey = new Map(earned.map((b) => [b.key, b]));
  return STREAK_BADGES.map((def) => {
    const row = byKey.get(def.key);
    return {
      ...def,
      earned: Boolean(row),
      earnedAt: row?.earnedAt ?? null,
      streakDays: row?.streakDays ?? null,
    };
  });
}

function isStreakBadgeKey(key: string): key is StreakBadgeKey {
  return (STREAK_BADGE_KEYS as readonly string[]).includes(key);
}

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}
