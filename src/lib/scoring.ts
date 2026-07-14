import type { Protocol } from "@/db/schema";

/**
 * Morning light tiers (best wins for the day).
 * Kruse: true sunrise over the horizon is the keystone signal.
 */
export type SunriseTierId = "horizon" | "open_sky" | "outside";

export type SunriseSkinExposure = "full" | "partial";
export type SunriseSunglasses = "none" | "worn";

/** Answers from the morning-light check-in that adjust the day boost. */
export type SunriseModifiers = {
  grounded: boolean;
  skin: SunriseSkinExposure;
  sunglasses: SunriseSunglasses;
};

export type SunriseTier = {
  id: SunriseTierId;
  /** Max multiplier when tier + skin + eyes + grounding are ideal */
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
      "Saw the sun come up over the horizon (eyes to the disk, no glass). Up to 2× with exposed skin, no sunglasses, and grounding.",
  },
  {
    id: "open_sky",
    multiplier: 1.5,
    rank: 2,
    protocolId: "sunrise-open-sky",
    shortLabel: "Open-sky light",
    description: "Outside under decent open skies in the morning. Up to 1.5× day boost.",
  },
  {
    id: "outside",
    multiplier: 1.25,
    rank: 1,
    protocolId: "sunrise-outside",
    shortLabel: "Outside morning",
    description:
      "Outside in the morning with limited sky view (trees, streets, overcast). Up to 1.25× day boost.",
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

/** Penalties subtracted from the tier max (e.g. sunglasses: 2× → 1.5×). */
export const SUNRISE_MODIFIER_PENALTIES = {
  sunglasses: 0.5,
  partialSkin: 0.25,
  notGrounded: 0.25,
} as const;

/** Compute day boost from tier + grounding / skin / sunglasses answers. */
export function computeSunriseMultiplier(
  tier: Pick<SunriseTier, "multiplier">,
  modifiers: SunriseModifiers,
): number {
  let mult = tier.multiplier;
  if (modifiers.sunglasses === "worn") mult -= SUNRISE_MODIFIER_PENALTIES.sunglasses;
  if (modifiers.skin === "partial") mult -= SUNRISE_MODIFIER_PENALTIES.partialSkin;
  if (!modifiers.grounded) mult -= SUNRISE_MODIFIER_PENALTIES.notGrounded;
  return Math.max(1, Math.round(mult * 100) / 100);
}

export function sunriseMultiplierForLog(
  protocolId: string,
  modifiers?: SunriseModifiers | null,
  storedMultiplier?: number | null,
): number {
  if (storedMultiplier != null && storedMultiplier > 0) return storedMultiplier;
  const tier = sunriseTierForProtocolId(protocolId);
  if (!tier) return 1;
  if (modifiers) return computeSunriseMultiplier(tier, modifiers);
  return tier.multiplier;
}

export function describeSunriseModifiers(modifiers: SunriseModifiers): string {
  const parts: string[] = [];
  if (modifiers.grounded) parts.push("grounded");
  parts.push(modifiers.skin === "full" ? "mostly exposed skin" : "partial skin");
  parts.push(
    modifiers.sunglasses === "none" ? "no sunglasses" : "sunglasses",
  );
  return parts.join(" · ");
}

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

/** Pick best tier from a list of protocol ids logged today (rank only). */
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

/** Pick best stored/effective multiplier across keystone logs. */
export function bestSunriseMultiplier(
  entries: { protocolId: string; multiplier?: number | null }[],
): { multiplier: number; tier: SunriseTier | null } {
  let bestMult = 1;
  let bestTier: SunriseTier | null = null;
  for (const entry of entries) {
    const tier = sunriseTierForProtocolId(entry.protocolId);
    if (!tier) continue;
    const mult = sunriseMultiplierForLog(
      entry.protocolId,
      null,
      entry.multiplier,
    );
    const better =
      mult > bestMult ||
      (mult === bestMult && tier.rank > (bestTier?.rank ?? -1));
    if (better) {
      bestMult = mult;
      bestTier = tier;
    }
  }
  return { multiplier: bestMult, tier: bestTier };
}

export function formatSunriseMultiplier(mult: number): string {
  // 2 → "2×", 1.5 → "1.5×", 1.25 → "1.25×"
  const s = Number.isInteger(mult) ? String(mult) : String(mult);
  return `${s}×`;
}

export const DURATION_BLOCK_MINUTES = 15;

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
    const maxMin = Math.max(
      DURATION_BLOCK_MINUTES,
      protocol.maxDurationMinutes || 180,
    );
    const mins = Math.min(
      Math.max(1, Math.round(durationMinutes)),
      maxMin,
    );
    const blocks = mins / DURATION_BLOCK_MINUTES;
    pts = Math.max(1, Math.round(protocol.points * blocks));
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

/** Max logs per day. Multi-log activities are uncapped; single-log stay toggle (0/1). */
export function maxLogsPerDay(
  protocol: Pick<Protocol, "allowsMultiple" | "maxPerDay">,
): number {
  if (!protocol.allowsMultiple) return 1;
  return Number.MAX_SAFE_INTEGER;
}

/** Streak bonus points for maintaining N consecutive active days (cap 7). */
export function streakBonusPoints(streakDays: number): number {
  if (streakDays < 2) return 0;
  return Math.min(7, streakDays);
}

export function sunriseBuffLabel(multiplier = SUNRISE_MULTIPLIER): string {
  return `${formatSunriseMultiplier(multiplier)} morning light boost`;
}
