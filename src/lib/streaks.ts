import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { dailyCompletions } from "@/db/schema";

/** Consecutive calendar days (ending today or yesterday) with ≥1 real log. */
export async function getUserStreak(
  userId: string,
  todayIso: string,
): Promise<{ current: number; best: number }> {
  try {
    // Only last ~14 months — full history scan was slow on every Schedule open
    const since = addDays(parseIso(todayIso), -400);
    const sinceIso = formatIso(since);

    const rows = await db
      .select({
        day: dailyCompletions.completedOn,
      })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.isStreakBonus, false),
          gte(dailyCompletions.completedOn, sinceIso),
        ),
      )
      .groupBy(dailyCompletions.completedOn)
      .orderBy(desc(dailyCompletions.completedOn));

    const days = rows.map((r) => r.day);
    if (days.length === 0) return { current: 0, best: 0 };

    const set = new Set(days);
    let current = 0;
    let cursor = parseIso(todayIso);

    // Allow streak to continue if last log was yesterday (not yet logged today)
    if (!set.has(formatIso(cursor))) {
      cursor = addDays(cursor, -1);
    }

    while (set.has(formatIso(cursor))) {
      current += 1;
      cursor = addDays(cursor, -1);
    }

    // Best streak in history
    const sorted = [...days].sort();
    let best = 1;
    let run = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = parseIso(sorted[i - 1]!);
      const cur = parseIso(sorted[i]!);
      const diff =
        (cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
      if (diff === 1) {
        run += 1;
        best = Math.max(best, run);
      } else if (diff !== 0) {
        run = 1;
      }
    }
    best = Math.max(best, current, sorted.length ? 1 : 0);

    return { current, best };
  } catch {
    return { current: 0, best: 0 };
  }
}

/** True if user already received streak bonus today */
export async function hasStreakBonusToday(userId: string, todayIso: string) {
  try {
    const [row] = await db
      .select({ id: dailyCompletions.id })
      .from(dailyCompletions)
      .where(
        and(
          eq(dailyCompletions.userId, userId),
          eq(dailyCompletions.completedOn, todayIso),
          eq(dailyCompletions.isStreakBonus, true),
        ),
      )
      .limit(1);
    return Boolean(row);
  } catch {
    return false;
  }
}

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

function formatIso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

// silence unused if tree-shaken
void sql;
