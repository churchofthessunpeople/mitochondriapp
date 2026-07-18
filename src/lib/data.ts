import { and, desc, eq, gte, inArray, lte, sql, sum } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { dailyCompletions, protocols, users } from "@/db/schema";
import type { Protocol } from "@/db/schema";
import { isSunriseKeystoneProtocolId } from "@/lib/scoring";

/**
 * Activity list from local seed-data.ts (source of truth).
 * Syncs definitions into Neon for FKs, then returns the local catalog.
 */
export const getActiveProtocols = cache(async (): Promise<Protocol[]> => {
  // Reads are local/merged — do not block on Neon FK sync.
  const { getMergedCatalogProtocols } = await import("@/lib/catalog");
  const { scheduleCatalogSync } = await import("@/lib/catalog-sync");
  scheduleCatalogSync();
  return getMergedCatalogProtocols();
});

export async function getCompletionsForUserDay(userId: string, date: string) {
  try {
    return await db
      .select()
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.completedOn, date),
        ),
      );
  } catch {
    return [];
  }
}

export async function getUserDayStats(userId: string, date: string) {
  const completions = await getCompletionsForUserDay(userId, date);
  const real = completions.filter((c) => !c.isStreakBonus);
  const bonus = completions
    .filter((c) => c.isStreakBonus)
    .reduce((a, c) => a + c.pointsEarned, 0);
  const points = completions.reduce((acc, c) => acc + c.pointsEarned, 0);
  const counts = new Map<string, number>();
  const durationTotals = new Map<string, number>();
  for (const c of real) {
    counts.set(c.protocolId, (counts.get(c.protocolId) ?? 0) + 1);
    if (c.durationMinutes && c.durationMinutes > 0) {
      if (!isSunriseKeystoneProtocolId(c.protocolId)) {
        durationTotals.set(
          c.protocolId,
          (durationTotals.get(c.protocolId) ?? 0) + c.durationMinutes,
        );
      }
    }
  }
  return {
    completions,
    completedIds: new Set(real.map((c) => c.protocolId)),
    completionCounts: counts,
    completionDurations: durationTotals,
    points,
    activityPoints: points - bonus,
    streakBonus: bonus,
    count: real.length,
  };
}

export async function getUserHistory(userId: string, days = 30) {
  try {
    const rows = await db
      .select({
        completedOn: dailyCompletions.completedOn,
        points: sum(dailyCompletions.pointsEarned).mapWith(Number),
        count: sql<number>`count(*) filter (where ${dailyCompletions.isStreakBonus} = false)::int`,
      })
      .from(dailyCompletions)
      .where(eq(dailyCompletions.userId, userId))
      .groupBy(dailyCompletions.completedOn)
      .orderBy(desc(dailyCompletions.completedOn))
      .limit(days);

    return rows.map((r) => ({
      date: r.completedOn,
      points: r.points ?? 0,
      count: r.count ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getDayDetail(userId: string, date: string) {
  try {
    const { getCatalogProtocolById } = await import("@/lib/catalog");
    const rows = await db
      .select({
        completion: dailyCompletions,
        protocol: protocols,
      })
      .from(dailyCompletions)
      .leftJoin(protocols, eq(protocols.id, dailyCompletions.protocolId))
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.completedOn, date),
        ),
      )
      .orderBy(desc(dailyCompletions.createdAt));

    // Prefer local catalog names/points if present
    return rows.map((r) => {
      const fromCatalog = getCatalogProtocolById(r.completion.protocolId);
      return {
        completion: r.completion,
        protocol: fromCatalog ?? r.protocol,
      };
    });
  } catch {
    return [];
  }
}

type LeaderboardOpts = {
  limit?: number;
  /** Inclusive lower bound (YYYY-MM-DD) */
  fromDate?: string;
  /** Inclusive upper bound (YYYY-MM-DD) — use yesterday so daily caches exclude in-progress today */
  toDate?: string;
  /** Exact calendar day (YYYY-MM-DD) */
  onDate?: string;
  userIds?: string[];
};

function utcDateOffset(daysFromToday: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

/** Last fully closed UTC day (excludes in-progress today). */
function leaderboardThroughDate(): string {
  return utcDateOffset(-1);
}

export async function getLeaderboardPeriod(opts: LeaderboardOpts = {}) {
  const limit = opts.limit ?? 25;
  try {
    const conditions = [eq(users.showOnLeaderboard, true)];
    if (opts.onDate) {
      conditions.push(eq(dailyCompletions.completedOn, opts.onDate));
    } else {
      if (opts.fromDate) {
        conditions.push(gte(dailyCompletions.completedOn, opts.fromDate));
      }
      if (opts.toDate) {
        conditions.push(lte(dailyCompletions.completedOn, opts.toDate));
      }
    }
    if (opts.userIds && opts.userIds.length > 0) {
      conditions.push(inArray(dailyCompletions.userId, opts.userIds));
    }

    const rows = await db
      .select({
        userId: dailyCompletions.userId,
        name: users.displayName,
        username: users.username,
        totalPoints: sum(dailyCompletions.pointsEarned).mapWith(Number),
        totalActions: sql<number>`count(*) filter (where ${dailyCompletions.isStreakBonus} = false)::int`,
      })
      .from(dailyCompletions)
      .innerJoin(users, eq(users.id, dailyCompletions.userId))
      .where(and(...conditions))
      .groupBy(dailyCompletions.userId, users.displayName, users.username)
      .orderBy(desc(sum(dailyCompletions.pointsEarned)))
      .limit(limit);

    return rows.map((r, index) => ({
      rank: index + 1,
      userId: r.userId,
      name: r.name || r.username || "Mitochondriac",
      username: r.username,
      totalPoints: r.totalPoints ?? 0,
      totalActions: r.totalActions ?? 0,
    }));
  } catch {
    return [];
  }
}

/** Lifetime through yesterday (UTC) — excludes today's in-progress logs. */
export async function getLeaderboard(limit = 20) {
  return getLeaderboardPeriod({
    limit,
    toDate: leaderboardThroughDate(),
  });
}

/** Closed UTC day (yesterday) — fits daily-cached boards. */
export async function getDailyLeaderboard(limit = 20) {
  return getLeaderboardPeriod({
    limit,
    onDate: leaderboardThroughDate(),
  });
}

/** Last 7 closed UTC days ending yesterday. */
export async function getWeeklyLeaderboard(limit = 20) {
  const toDate = leaderboardThroughDate();
  return getLeaderboardPeriod({
    limit,
    fromDate: utcDateOffset(-7),
    toDate,
  });
}

/** Last 30 closed UTC days ending yesterday. */
export async function getMonthlyLeaderboard(limit = 20) {
  const toDate = leaderboardThroughDate();
  return getLeaderboardPeriod({
    limit,
    fromDate: utcDateOffset(-30),
    toDate,
  });
}

export async function getUserTotalPoints(userId: string) {
  try {
    const [row] = await db
      .select({
        total: sum(dailyCompletions.pointsEarned).mapWith(Number),
      })
      .from(dailyCompletions)
      .where(eq(dailyCompletions.userId, userId));
    return row?.total ?? 0;
  } catch {
    return 0;
  }
}
