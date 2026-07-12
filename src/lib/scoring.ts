import type { Protocol } from "@/db/schema";

/** Points for one log event, optionally scaled by duration. */
export function pointsForLog(
  protocol: Pick<
    Protocol,
    | "points"
    | "durationEnabled"
    | "referenceMinutes"
    | "maxDurationMinutes"
  >,
  durationMinutes?: number | null,
): number {
  if (!protocol.durationEnabled || !durationMinutes || durationMinutes <= 0) {
    return protocol.points;
  }

  const ref = Math.max(1, protocol.referenceMinutes || 10);
  const maxMin = Math.max(ref, protocol.maxDurationMinutes || 60);
  const mins = Math.min(Math.max(1, Math.round(durationMinutes)), maxMin);
  const scaled = Math.round((protocol.points * mins) / ref);
  return Math.max(1, scaled);
}

export function maxLogsPerDay(
  protocol: Pick<Protocol, "allowsMultiple" | "maxPerDay">,
): number {
  if (!protocol.allowsMultiple) return 1;
  return Math.max(1, protocol.maxPerDay || 5);
}

/** Streak bonus points for maintaining N consecutive active days (cap 7). */
export function streakBonusPoints(streakDays: number): number {
  if (streakDays < 2) return 0;
  return Math.min(7, streakDays);
}
