import type { PublicSource } from "./public-content";
import type { SunPhases } from "./sun-phases";

export type PublicSunTimes = {
  sunrise: string | null;
  sunset: string | null;
  solarNoon: string | null;
  dayLengthHours: number | null;
};

export type PublicGeomag = {
  totalUtLabel: string;
  totalGaussLabel: string;
  inclinationLabel: string;
  declinationLabel: string;
  summaryLine: string;
  model: string;
  date: string;
  source: string;
};

export type PublicArtificialEm = {
  loadScore: number;
  loadLabel: string;
  summaryLine: string;
  detailLine: string;
  sources: string[];
};

export type PublicBedrock = {
  unitName: string;
  rockLabel: string;
  ageLabel: string | null;
  note: string | null;
  source: string;
};

export type PublicDipZone = {
  inCorridor: boolean;
  corridorSummary: string;
  zone: {
    rank: number;
    name: string;
    nickname: string;
    summary: string;
    distanceKm: number;
  } | null;
  mitigation: readonly string[];
  source: PublicSource;
};

export type PublicVolcano = {
  /** Closest volcano active since `activeSinceYear`, if within `radiusKm`. */
  nearest: {
    name: string;
    country: string;
    lastEruptionYear: number;
    rock: string | null;
    distanceKm: number;
  } | null;
  radiusKm: number;
  activeSinceYear: number;
  note: string | null;
  source: string;
};

export type PublicPlaceFactors = {
  latitudeLabel: string;
  bandLabel: string;
  uvSeasonLabel: string;
  solarNoonLabel: string;
  elevationLabel: string | null;
  geologyLabel: string;
  volcano: PublicVolcano;
  bedrock: PublicBedrock | null;
  dipZone: PublicDipZone | null;
  geomag: PublicGeomag | null;
  artificialEm: PublicArtificialEm | null;
};

export type PublicPlaceResult = {
  postalCode: string;
  placeName: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  sun: PublicSunTimes;
  sunPhases: SunPhases;
  factors: PublicPlaceFactors;
};

export function normalizePublicZip(raw: string): string | null {
  const value = raw.trim().replace(/\s+/g, "");
  const match = value.match(/^(\d{5})(?:-?\d{4})?$/);
  return match?.[1] ?? null;
}

export function formatPublicPlaceLabel(place: {
  placeName: string;
  state?: string | null;
}): string {
  return [place.placeName, place.state].filter(Boolean).join(", ");
}
