import { haversineKm } from "@/lib/geo";
import {
  INCLINATION_DROP_MITIGATION,
  INCLINATION_DROP_ZONES,
  NA_INCLINATION_DECAY_CORRIDOR,
  type InclinationDropZoneDef,
} from "@/lib/inclination-drop-zones.data";

export type InclinationDropZoneMatch = {
  id: string;
  rank: number;
  name: string;
  subtitle: string;
  distanceKm: number;
  coordinatesLabel: string;
  hazardSummary: string;
};

export type InclinationZoneContext = {
  inDecayCorridor: boolean;
  decayCorridorLabel: string;
  decayCorridorSummary: string;
  matchedZones: InclinationDropZoneMatch[];
  nearestZone: InclinationDropZoneMatch | null;
  summaryLine: string;
  detailLine: string;
  mitigationLines: readonly string[];
};

function formatCoords(lat: number, lng: number): string {
  const latHemi = lat >= 0 ? "N" : "S";
  const lngHemi = lng <= 0 ? "W" : "E";
  return `${Math.abs(lat).toFixed(1)}°${latHemi}, ${Math.abs(lng).toFixed(1)}°${lngHemi}`;
}

function zoneToMatch(
  zone: InclinationDropZoneDef,
  distanceKm: number,
): InclinationDropZoneMatch {
  return {
    id: zone.id,
    rank: zone.rank,
    name: zone.name,
    subtitle: zone.subtitle,
    distanceKm,
    coordinatesLabel: formatCoords(zone.latitude, zone.longitude),
    hazardSummary: zone.hazardSummary,
  };
}

export function inInclinationDecayCorridor(latitude: number, longitude: number): boolean {
  return (
    latitude >= NA_INCLINATION_DECAY_CORRIDOR.south &&
    latitude <= NA_INCLINATION_DECAY_CORRIDOR.north &&
    longitude >= NA_INCLINATION_DECAY_CORRIDOR.west &&
    longitude <= NA_INCLINATION_DECAY_CORRIDOR.east
  );
}

/**
 * Match ZIP lat/lng to April 2026 NA inclination-drop education zones.
 * Returns null when outside all tracked zones and the decay corridor.
 */
export function lookupInclinationDropZones(
  latitude: number,
  longitude: number,
): InclinationZoneContext | null {
  const inDecayCorridor = inInclinationDecayCorridor(latitude, longitude);

  const matchedZones = INCLINATION_DROP_ZONES.map((zone) => {
    const distanceKm = haversineKm(
      latitude,
      longitude,
      zone.latitude,
      zone.longitude,
    );
    return distanceKm <= zone.radiusKm
      ? zoneToMatch(zone, Math.round(distanceKm))
      : null;
  })
    .filter((match): match is InclinationDropZoneMatch => match != null)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  if (!inDecayCorridor && matchedZones.length === 0) {
    return null;
  }

  const nearestZone = matchedZones[0] ?? null;

  let summaryLine: string;
  let detailLine: string;

  if (nearestZone) {
    summaryLine = `#${nearestZone.rank} · ${nearestZone.name}`;
    detailLine = `${nearestZone.subtitle} · ${nearestZone.hazardSummary}`;
    if (inDecayCorridor) {
      detailLine += ` Inside the ${NA_INCLINATION_DECAY_CORRIDOR.label} decay corridor.`;
    }
  } else {
    summaryLine = `Inside NA decay corridor (${NA_INCLINATION_DECAY_CORRIDOR.label})`;
    detailLine = NA_INCLINATION_DECAY_CORRIDOR.summary;
  }

  return {
    inDecayCorridor,
    decayCorridorLabel: NA_INCLINATION_DECAY_CORRIDOR.label,
    decayCorridorSummary: NA_INCLINATION_DECAY_CORRIDOR.summary,
    matchedZones,
    nearestZone,
    summaryLine,
    detailLine,
    mitigationLines: INCLINATION_DROP_MITIGATION,
  };
}
