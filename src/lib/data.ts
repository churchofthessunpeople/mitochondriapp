import { and, desc, eq, gte, inArray, sql, sum } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { dailyCompletions, protocols, users } from "@/db/schema";
import type { Protocol } from "@/db/schema";
import {
  ensureCatalogSyncedToDb,
  getCatalogProtocols,
} from "@/lib/catalog";

/**
 * Activity list from local seed-data.ts (source of truth).
 * Syncs definitions into Neon for FKs, then returns the local catalog.
 */
export const getActiveProtocols = cache(async (): Promise<Protocol[]> => {
  await ensureCatalogSyncedToDb();
  return getCatalogProtocols();
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
      durationTotals.set(
        c.protocolId,
        (durationTotals.get(c.protocolId) ?? 0) + c.durationMinutes,
      );
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
  fromDate?: string;
  userIds?: string[];
};

export async function getLeaderboardPeriod(opts: LeaderboardOpts = {}) {
  const limit = opts.limit ?? 25;
  try {
    const conditions = [eq(users.showOnLeaderboard, true)];
    if (opts.fromDate) {
      conditions.push(gte(dailyCompletions.completedOn, opts.fromDate));
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

export async function getLeaderboard(limit = 20) {
  return getLeaderboardPeriod({ limit });
}

export async function getWeeklyLeaderboard(limit = 20) {
  const from = new Date();
  from.setDate(from.getDate() - 7);
  return getLeaderboardPeriod({
    limit,
    fromDate: from.toISOString().slice(0, 10),
  });
}

/** Weekly ranking by light-category protocol points (not total points). */
export async function getWeeklyLightLeaderboard(limit = 20) {
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const fromDate = from.toISOString().slice(0, 10);
  const lightIds = getCatalogProtocols()
    .filter((p) => p.category === "light")
    .map((p) => p.id);
  if (lightIds.length === 0) return [];
  try {
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
      .where(
        and(
          eq(users.showOnLeaderboard, true),
          gte(dailyCompletions.completedOn, fromDate),
          inArray(dailyCompletions.protocolId, lightIds),
          eq(dailyCompletions.isStreakBonus, false),
        ),
      )
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

export async function getMonthlyLeaderboard(limit = 20) {
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return getLeaderboardPeriod({
    limit,
    fromDate: from.toISOString().slice(0, 10),
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
