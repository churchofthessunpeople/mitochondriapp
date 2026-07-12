/**
 * Transparent 1–5 region scoring for lifestyle / Kruse-aligned comparison.
 * Educational framework only — not medical, legal, or investment advice.
 */

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

/** Active magma / volcanic arc anchors (major living-area relevant systems). */
export const VOLCANIC_HOTSPOTS: { name: string; lat: number; lng: number }[] = [
  // Central America
  { name: "El Salvador volcanic arc", lat: 13.7, lng: -89.2 },
  { name: "Guatemala arc", lat: 14.5, lng: -90.8 },
  { name: "Costa Rica / Nicaragua arc", lat: 10.5, lng: -85.0 },
  // Andes
  { name: "Northern Andes", lat: 0.0, lng: -78.0 },
  { name: "Central Andes Chile", lat: -33.4, lng: -70.6 },
  { name: "Southern Andes", lat: -41.0, lng: -72.5 },
  // Pacific / Ring of Fire
  { name: "Hawaii hotspot", lat: 19.4, lng: -155.3 },
  { name: "Cascades / NW US", lat: 46.2, lng: -122.2 },
  { name: "Mexico volcanic belt", lat: 19.0, lng: -99.0 },
  { name: "Japan arc", lat: 35.4, lng: 138.7 },
  { name: "Philippines arc", lat: 14.6, lng: 121.0 },
  { name: "Indonesia arc", lat: -7.5, lng: 110.0 },
  { name: "New Zealand Taupo", lat: -38.7, lng: 176.1 },
  { name: "Kamchatka", lat: 53.0, lng: 159.0 },
  { name: "Aleutians", lat: 54.0, lng: -166.0 },
  // Atlantic / other
  { name: "Iceland hotspot", lat: 64.1, lng: -21.9 },
  { name: "Italy / Campanian arc", lat: 40.8, lng: 14.4 },
  { name: "Canary Islands", lat: 28.3, lng: -16.6 },
  { name: "East African Rift", lat: -1.3, lng: 36.8 },
  { name: "Azores", lat: 38.7, lng: -27.2 },
];

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
 * Magnetism / geological vitality from distance to active magma / volcanic systems.
 * Closer to free-flowing magma arcs / hotspots → higher.
 */
export function magnetismScoreFromLocation(
  latitude: number,
  longitude: number,
): { score: number; nearestKm: number; nearestName: string } {
  let nearestKm = Infinity;
  let nearestName = "none";

  for (const h of VOLCANIC_HOTSPOTS) {
    const km = haversineKm(latitude, longitude, h.lat, h.lng);
    if (km < nearestKm) {
      nearestKm = km;
      nearestName = h.name;
    }
  }

  let score = 1;
  if (nearestKm <= 250) score = 5;
  else if (nearestKm <= 600) score = 4;
  else if (nearestKm <= 1500) score = 3;
  else if (nearestKm <= 3500) score = 2;
  else score = 1;

  return { score, nearestKm, nearestName };
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
