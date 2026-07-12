import { and, desc, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { dailyCompletions, protocols, users } from "@/db/schema";
import { PROTOCOL_SEEDS } from "@/db/seed-data";
import type { Protocol, TimeOfDay } from "@/db/schema";

export async function getActiveProtocols(): Promise<Protocol[]> {
  try {
    const rows = await db
      .select()
      .from(protocols)
      .where(eq(protocols.active, true))
      .orderBy(protocols.sortOrder);

    if (rows.length > 0) return rows;
  } catch {
    // Fall through to seed data when DB is not configured yet.
  }

  return PROTOCOL_SEEDS.map((seed) => ({
    ...seed,
    active: true,
    createdAt: new Date(),
  }));
}

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
  const points = completions.reduce((acc, c) => acc + c.pointsEarned, 0);
  return {
    completions,
    completedIds: new Set(completions.map((c) => c.protocolId)),
    points,
    count: completions.length,
  };
}

export async function getUserHistory(userId: string, days = 14) {
  try {
    const rows = await db
      .select({
        completedOn: dailyCompletions.completedOn,
        points: sum(dailyCompletions.pointsEarned).mapWith(Number),
        count: sql<number>`count(*)::int`,
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

export async function getLeaderboard(limit = 20) {
  try {
    const rows = await db
      .select({
        userId: dailyCompletions.userId,
        name: users.displayName,
        username: users.username,
        totalPoints: sum(dailyCompletions.pointsEarned).mapWith(Number),
        totalActions: sql<number>`count(*)::int`,
      })
      .from(dailyCompletions)
      .innerJoin(users, eq(users.id, dailyCompletions.userId))
      .groupBy(
        dailyCompletions.userId,
        users.displayName,
        users.username,
      )
      .orderBy(desc(sum(dailyCompletions.pointsEarned)))
      .limit(limit);

    return rows.map((r, index) => ({
      rank: index + 1,
      userId: r.userId,
      name: r.name || r.username || "Mitochondriac",
      totalPoints: r.totalPoints ?? 0,
      totalActions: r.totalActions ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function getWeeklyLeaderboard(limit = 20) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const from = weekAgo.toISOString().slice(0, 10);

  try {
    const rows = await db
      .select({
        userId: dailyCompletions.userId,
        name: users.displayName,
        username: users.username,
        totalPoints: sum(dailyCompletions.pointsEarned).mapWith(Number),
        totalActions: sql<number>`count(*)::int`,
      })
      .from(dailyCompletions)
      .innerJoin(users, eq(users.id, dailyCompletions.userId))
      .where(gte(dailyCompletions.completedOn, from))
      .groupBy(
        dailyCompletions.userId,
        users.displayName,
        users.username,
      )
      .orderBy(desc(sum(dailyCompletions.pointsEarned)))
      .limit(limit);

    return rows.map((r, index) => ({
      rank: index + 1,
      userId: r.userId,
      name: r.name || r.username || "Mitochondriac",
      totalPoints: r.totalPoints ?? 0,
      totalActions: r.totalActions ?? 0,
    }));
  } catch {
    return [];
  }
}

export function groupProtocolsByTime(list: Protocol[]) {
  const map = new Map<TimeOfDay, Protocol[]>();
  for (const p of list) {
    const bucket = map.get(p.timeOfDay) ?? [];
    bucket.push(p);
    map.set(p.timeOfDay, bucket);
  }
  return map;
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
