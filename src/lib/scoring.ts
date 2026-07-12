import type { Protocol } from "@/db/schema";

/**
 * Morning light tiers (best wins for the day).
 * Kruse: true sunrise over the horizon is the keystone signal.
 */
export type SunriseTierId = "horizon" | "open_sky" | "outside";

export type SunriseTier = {
  id: SunriseTierId;
  /** Multiplier on non-keystone logs that day */
  multiplier: number;
  /** Higher = better (used to pick best of day) */
  rank: number;
  /** Protocol id in catalog */
  protocolId: string;
  /** Short label for banners */
  shortLabel: string;
  /** One-line description for check-in */
  description: string;
};

export const SUNRISE_TIERS: readonly SunriseTier[] = [
  {
    id: "horizon",
    multiplier: 2,
    rank: 3,
    protocolId: "sunrise-horizon",
    shortLabel: "Horizon sunrise",
    description:
      "Saw the sun come up over the horizon (eyes to the disk, no glass)",
  },
  {
    id: "open_sky",
    multiplier: 1.5,
    rank: 2,
    protocolId: "sunrise-open-sky",
    shortLabel: "Open-sky light",
    description: "Outside under decent open skies in the morning",
  },
  {
    id: "outside",
    multiplier: 1.25,
    rank: 1,
    protocolId: "sunrise-outside",
    shortLabel: "Outside morning",
    description: "Outside in the morning with limited sky view (trees, streets, overcast)",
  },
] as const;

/** Legacy protocol ids still count toward a tier if present in older DBs */
const LEGACY_SUNRISE_PROTOCOL_TIER: Record<string, SunriseTierId> = {
  "sunrise-grounding": "horizon",
  "no-sunglasses-sunrise": "open_sky",
};

const TIER_BY_ID = Object.fromEntries(
  SUNRISE_TIERS.map((t) => [t.id, t]),
) as Record<SunriseTierId, SunriseTier>;

/** @deprecated use tier multipliers — kept for any external refs */
export const SUNRISE_MULTIPLIER = 1.5;

export function sunriseTierById(id: SunriseTierId): SunriseTier {
  return TIER_BY_ID[id];
}

export function sunriseTierForProtocolId(
  protocolId: string,
): SunriseTier | null {
  const direct = SUNRISE_TIERS.find((t) => t.protocolId === protocolId);
  if (direct) return direct;
  const legacy = LEGACY_SUNRISE_PROTOCOL_TIER[protocolId];
  return legacy ? TIER_BY_ID[legacy] : null;
}

/** Keystone morning-light logs that unlock a day multiplier (not barefoot, etc.). */
export function isSunriseKeystoneProtocol(protocol: {
  id?: string | null;
}): boolean {
  return protocol.id
    ? sunriseTierForProtocolId(protocol.id) != null
    : false;
}

/**
 * Sunrise *slot* activity (scheduling / phase). Prefer keystone checks for buffs.
 * Locked-to-sunrise protocols and named keystones.
 */
export function isSunriseProtocol(
  protocol: Pick<Protocol, "timeOfDay" | "lockedTimeOfDay"> & { id?: string },
): boolean {
  if (protocol.id && isSunriseKeystoneProtocol({ id: protocol.id })) return true;
  return (
    protocol.lockedTimeOfDay === "sunrise" || protocol.timeOfDay === "sunrise"
  );
}

/** Pick best tier from a list of protocol ids logged today. */
export function bestSunriseTier(
  protocolIds: string[],
): SunriseTier | null {
  let best: SunriseTier | null = null;
  for (const id of protocolIds) {
    const tier = sunriseTierForProtocolId(id);
    if (!tier) continue;
    if (!best || tier.rank > best.rank) best = tier;
  }
  return best;
}

export function formatSunriseMultiplier(mult: number): string {
  // 2 → "2×", 1.5 → "1.5×", 1.25 → "1.25×"
  const s = Number.isInteger(mult) ? String(mult) : String(mult);
  return `${s}×`;
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
  > & { id?: string | null },
  durationMinutes?: number | null,
  opts?: {
    /** Best sunrise multiplier for the day (1 = none) */
    sunriseMultiplier?: number;
    /** @deprecated prefer sunriseMultiplier */
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

  const mult =
    opts?.sunriseMultiplier != null
      ? opts.sunriseMultiplier
      : opts?.sunriseBuffActive
        ? SUNRISE_MULTIPLIER
        : 1;

  // Keystone sunrise logs earn base only; they unlock the buff for others
  if (mult > 1 && !isSunriseKeystoneProtocol(protocol)) {
    pts = Math.max(1, Math.round(pts * mult));
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

export function sunriseBuffLabel(multiplier = SUNRISE_MULTIPLIER): string {
  return `${formatSunriseMultiplier(multiplier)} morning light boost`;
}
