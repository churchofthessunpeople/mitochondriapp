import { ACTIVE_VOLCANOES } from "./active-volcanoes.data";

export type ActiveVolcano = {
  name: string;
  country: string;
  lat: number;
  lng: number;
  lastEruptionYear: number;
  /** Smithsonian major rock type, lowercased, e.g. "basalt / picro-basalt". */
  rock: string | null;
};

export type NearbyActiveVolcano = ActiveVolcano & { distanceKm: number };

/** Beyond this, a volcano is not "local ground" in Kruse's sense of living on it. */
export const ACTIVE_VOLCANO_RADIUS_KM = 150;

export const ACTIVE_VOLCANO_SOURCE = "Smithsonian Global Volcanism Program";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Closest volcano that erupted since ACTIVE_SINCE_YEAR, if within the radius. */
export function nearestActiveVolcano(
  lat: number,
  lng: number,
  volcanoes: readonly ActiveVolcano[] = ACTIVE_VOLCANOES,
): NearbyActiveVolcano | null {
  let best: NearbyActiveVolcano | null = null;
  for (const volcano of volcanoes) {
    const distanceKm = haversineKm(lat, lng, volcano.lat, volcano.lng);
    if (distanceKm <= ACTIVE_VOLCANO_RADIUS_KM && (!best || distanceKm < best.distanceKm)) {
      best = { ...volcano, distanceKm };
    }
  }
  return best;
}

/** Kruse rules out Hawaii: he says its rock froze before the last pole reversal. */
export function isHawaii(lat: number, lng: number): boolean {
  return lat > 18 && lat < 23 && lng > -161 && lng < -154;
}
