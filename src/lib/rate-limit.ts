import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

/**
 * DB-backed fixed window rate limit (works across Vercel instances).
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();

  try {
    const [row] = await db
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.key, key))
      .limit(1);

    if (!row) {
      await db.insert(rateLimits).values({
        key,
        count: 1,
        windowStart: now,
      });
      return { ok: true, remaining: limit - 1 };
    }

    const elapsed = now.getTime() - row.windowStart.getTime();

    if (elapsed >= windowMs) {
      await db
        .update(rateLimits)
        .set({ count: 1, windowStart: now })
        .where(eq(rateLimits.key, key));
      return { ok: true, remaining: limit - 1 };
    }

    if (row.count >= limit) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((windowMs - elapsed) / 1000),
      );
      return { ok: false, retryAfterSec };
    }

    await db
      .update(rateLimits)
      .set({ count: row.count + 1 })
      .where(eq(rateLimits.key, key));

    return { ok: true, remaining: limit - (row.count + 1) };
  } catch {
    // If rate-limit table missing / DB blip, fail open for availability
    return { ok: true, remaining: limit };
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
}

export const AUTH_RATE = {
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  register: { limit: 5, windowMs: 60 * 60 * 1000 },
  passwordChange: { limit: 5, windowMs: 15 * 60 * 1000 },
  emailChange: { limit: 5, windowMs: 15 * 60 * 1000 },
  verifyResend: { limit: 3, windowMs: 60 * 60 * 1000 },
} as const;
