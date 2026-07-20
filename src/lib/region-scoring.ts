/**
 * Transparent 1–5 region scoring for lifestyle / Kruse-aligned comparison.
 * Educational framework only — not medical, legal, or investment advice.
 */

import {
  VOLCANIC_ANCHOR_COUNT,
  VOLCANIC_ANCHORS,
  type VolcanicAnchor,
} from "@/lib/volcanic-anchors.data";

export type PolicyFactors = {
  /** BTC is legal tender or officially strategic */
  bitcoinLegalTender?: boolean;
  /** Low friction for holding/using BTC or crypto (no legal tender) */
  cryptoFriendly?: boolean;
  /** State is actively pushing CBDC / digital ID / cash restrictions */
  cbdcPressure?: boolean;
  /** High surveillance / speech restrictions / digital control */
  highSurveillance?: boolean;
  /** Strong outdoor / nature culture */
  outdoorCulture?: boolean;
  /** Open-border / weak rule-of-law stress that harms daily safety protocols */
  borderSecurityStress?: boolean;
  /** Authoritarian or highly extractive fiscal/monetary regime */
  authoritarianEconomy?: boolean;
};

/**
 * Global volcanic / flowing-magma anchors (GVP Holocene + USGS US + system midpoints).
 * @see src/lib/volcanic-anchors.data.ts — regenerate with scripts/build-volcanic-anchors.mjs
 */
export const VOLCANIC_HOTSPOTS: readonly VolcanicAnchor[] = VOLCANIC_ANCHORS;
export { VOLCANIC_ANCHOR_COUNT };

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Sun score from absolute latitude.
 * Equator → 5; polar → 1.
 *
 * |lat| bands (approx):
 *  0–12° → 5  (deep tropics)
 * 12–23.5° → 4  (tropics / near tropics)
 * 23.5–35° → 3  (subtropics)
 * 35–48° → 2  (mid-latitudes, weak winters)
 * 48°+ → 1  (high latitude, long dark winters)
 */
export function sunScoreFromLatitude(latitude: number): number {
  const a = Math.abs(latitude);
  if (a <= 12) return 5;
  if (a <= 23.5) return 4;
  if (a <= 35) return 3;
  if (a <= 48) return 2;
  return 1;
}

/**
 * Magma / volcanic geology influence range (lifestyle proxy, not hazard).
 * Within FULL_KM → full +4 boost (score 5). Beyond ZERO_KM → boost 0 (score 1).
 * Between: inverse-square falloff in 1/r² so distant crust has no effect.
 */
export const MAGMA_FULL_INFLUENCE_KM = 100;
export const MAGMA_ZERO_INFLUENCE_KM = 750;

/**
 * Geology boost 0–4 from distance (km) using inverse-square falloff.
 * boost=0 past ZERO_KM — magma systems at continental range do not help you.
 */
export function magmaGeologyBoostFromKm(nearestKm: number): number {
  if (!Number.isFinite(nearestKm) || nearestKm < 0) return 0;
  if (nearestKm <= MAGMA_FULL_INFLUENCE_KM) return 4;
  if (nearestKm >= MAGMA_ZERO_INFLUENCE_KM) return 0;

  const inv = 1 / (nearestKm * nearestKm);
  const invFull =
    1 / (MAGMA_FULL_INFLUENCE_KM * MAGMA_FULL_INFLUENCE_KM);
  const invZero =
    1 / (MAGMA_ZERO_INFLUENCE_KM * MAGMA_ZERO_INFLUENCE_KM);
  const t = (inv - invZero) / (invFull - invZero);
  return Math.max(0, Math.min(4, 4 * t));
}

/**
 * Magnetism / geological vitality from distance to Holocene volcanoes,
 * US monitored systems, and major arc/hotspot/rift midpoints.
 * Closer to free-flowing magma systems → higher (lifestyle framework, not hazard).
 * Uses 1/r² falloff; beyond ~750 km the boost is zero.
 */
export function magnetismScoreFromLocation(
  latitude: number,
  longitude: number,
): {
  score: number;
  boost: number;
  nearestKm: number;
  nearestName: string;
} {
  let nearestKm = Infinity;
  let nearestName = "none";

  for (const h of VOLCANIC_ANCHORS) {
    const km = haversineKm(latitude, longitude, h.lat, h.lng);
    if (km < nearestKm) {
      nearestKm = km;
      nearestName = h.name;
    }
  }

  const boostRaw = magmaGeologyBoostFromKm(nearestKm);
  const boost = Math.round(boostRaw);
  const score = Math.max(1, Math.min(5, 1 + boost));

  return { score, boost, nearestKm, nearestName };
}

/**
 * Policy / freedom score.
 * Bitcoin legal tender and crypto-friendly environments score up;
 * CBDC pressure, high surveillance, and authoritarian economics score down.
 */
export function policyScoreFromFactors(f: PolicyFactors): number {
  let score = 3; // baseline mixed free-world

  if (f.bitcoinLegalTender) score += 2;
  else if (f.cryptoFriendly) score += 1;

  if (f.outdoorCulture) score += 1;

  if (f.cbdcPressure) score -= 1;
  if (f.highSurveillance) score -= 1;
  if (f.borderSecurityStress) score -= 1;
  if (f.authoritarianEconomy) score -= 1;

  return Math.max(1, Math.min(5, score));
}

/**
 * Composite health rating: equal weight sun + magnetism + policy.
 * Rounded to nearest integer 1–5.
 */
export function compositeHealthRating(
  sun: number,
  magnetism: number,
  policy: number,
): number {
  const avg = (sun + magnetism + policy) / 3;
  return Math.max(1, Math.min(5, Math.round(avg)));
}

export type ScoredLocation = {
  sunScore: number;
  magnetismScore: number;
  policyScore: number;
  healthRating: number;
  nearestVolcano: string;
  nearestVolcanoKm: number;
};

export function scoreLocation(
  latitude: number,
  longitude: number,
  policy: PolicyFactors = {},
): ScoredLocation {
  const sunScore = sunScoreFromLatitude(latitude);
  const mag = magnetismScoreFromLocation(latitude, longitude);
  const policyScore = policyScoreFromFactors(policy);
  const healthRating = compositeHealthRating(
    sunScore,
    mag.score,
    policyScore,
  );

  return {
    sunScore,
    magnetismScore: mag.score,
    policyScore,
    healthRating,
    nearestVolcano: mag.nearestName,
    nearestVolcanoKm: mag.nearestKm,
  };
}
