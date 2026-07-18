import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

type RateLimitRow = {
  allowed: boolean | number | string;
  count: number;
  window_start: Date | string;
};

function firstRow(result: unknown): RateLimitRow | undefined {
  if (Array.isArray(result)) return result[0] as RateLimitRow | undefined;
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: RateLimitRow[] }).rows[0];
  }
  return undefined;
}

function asBool(v: boolean | number | string): boolean {
  return v === true || v === 1 || v === "t" || v === "true";
}

/**
 * DB-backed fixed window rate limit (works across Vercel instances).
 * Single atomic upsert — concurrent requests cannot race past the cap.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowMs);

  try {
    const result = await db.execute(sql`
      WITH prev AS (
        SELECT count AS prev_count, window_start AS prev_start
        FROM rate_limits
        WHERE key = ${key}
      ),
      upsert AS (
        INSERT INTO rate_limits AS r (key, count, window_start)
        VALUES (${key}, 1, ${now})
        ON CONFLICT (key) DO UPDATE SET
          count = CASE
            WHEN r.window_start <= ${cutoff} THEN 1
            WHEN r.count < ${limit} THEN r.count + 1
            ELSE r.count
          END,
          window_start = CASE
            WHEN r.window_start <= ${cutoff} THEN ${now}
            ELSE r.window_start
          END
        RETURNING count, window_start
      )
      SELECT
        u.count,
        u.window_start,
        (
          CASE
            WHEN p.prev_count IS NULL THEN true
            WHEN p.prev_start <= ${cutoff} THEN true
            WHEN p.prev_count < ${limit} THEN true
            ELSE false
          END
        ) AS allowed
      FROM upsert u
      LEFT JOIN prev p ON true
    `);

    const row = firstRow(result);
    if (!row) return { ok: false, retryAfterSec: 60 };

    const count = Number(row.count);
    const windowStart = new Date(row.window_start);
    const elapsed = Math.max(0, now.getTime() - windowStart.getTime());
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - elapsed) / 1000),
    );

    if (!asBool(row.allowed)) {
      return { ok: false, retryAfterSec };
    }

    return {
      ok: true,
      remaining: Math.max(0, limit - count),
    };
  } catch {
    return { ok: false, retryAfterSec: 60 };
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export const AUTH_RATE = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Guest account creation — tighter than register to limit DB spam. */
  guest: { limit: 8, windowMs: 60 * 60 * 1000 },
  passwordChange: { limit: 5, windowMs: 15 * 60 * 1000 },
  emailChange: { limit: 5, windowMs: 15 * 60 * 1000 },
  verifyResend: { limit: 3, windowMs: 60 * 60 * 1000 },
} as const;
