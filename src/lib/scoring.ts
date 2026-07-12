import type { Protocol, TimeOfDay } from "@/db/schema";

/** Completing a sunrise activity multiplies other (non-sunrise) logs that day. */
export const SUNRISE_MULTIPLIER = 1.5;

export function isSunriseProtocol(
  protocol: Pick<Protocol, "timeOfDay" | "lockedTimeOfDay">,
): boolean {
  return (
    protocol.lockedTimeOfDay === "sunrise" || protocol.timeOfDay === "sunrise"
  );
}

/** Points for one log event, optionally scaled by duration and sunrise buff. */
export function pointsForLog(
  protocol: Pick<
    Protocol,
    | "points"
    | "durationEnabled"
    | "referenceMinutes"
    | "maxDurationMinutes"
    | "timeOfDay"
    | "lockedTimeOfDay"
  >,
  durationMinutes?: number | null,
  opts?: {
    /** Day has at least one sunrise protocol completed */
    sunriseBuffActive?: boolean;
  },
): number {
  let pts: number;
  if (!protocol.durationEnabled || !durationMinutes || durationMinutes <= 0) {
    pts = protocol.points;
  } else {
    const ref = Math.max(1, protocol.referenceMinutes || 10);
    const maxMin = Math.max(ref, protocol.maxDurationMinutes || 60);
    const mins = Math.min(Math.max(1, Math.round(durationMinutes)), maxMin);
    pts = Math.round((protocol.points * mins) / ref);
    pts = Math.max(1, pts);
  }

  // Sunrise activities earn base points only; they unlock the buff for others
  if (
    opts?.sunriseBuffActive &&
    !isSunriseProtocol(protocol)
  ) {
    pts = Math.max(1, Math.round(pts * SUNRISE_MULTIPLIER));
  }

  return pts;
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

export function sunriseBuffLabel(): string {
  return `${SUNRISE_MULTIPLIER}× sunrise buff`;
}
