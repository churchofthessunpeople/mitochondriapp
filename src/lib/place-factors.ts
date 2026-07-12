/**
 * Place context for Kruse-aligned lifestyle UX (educational framework).
 * Facts + simple labels — not medical advice.
 */

import { formatDistanceKm } from "@/lib/geo";
import { magnetismScoreFromLocation } from "@/lib/region-scoring";
import { formatTimeInZone, type SunTimes } from "@/lib/sun";

export type PlaceFactors = {
  latitude: number;
  longitude: number;
  /** e.g. 25.8°N */
  latitudeLabel: string;
  /** e.g. Subtropical */
  bandLabel: string;
  /** e.g. Long UV season (most of year) */
  uvSeasonLabel: string;
  /** Local solar noon clock time */
  solarNoonLabel: string;
  elevationM: number | null;
  /** e.g. 12 ft (4 m) */
  elevationLabel: string | null;
  nearestVolcano: string;
  nearestVolcanoKm: number;
  /** Primary: system name */
  geologyLabel: string;
  /** Secondary: distance + why we show it */
  geologyDetail: string;
};

/** Latitude climate band (aligned with sun-score bands). */
export function latitudeBand(latitude: number): {
  bandLabel: string;
  uvSeasonLabel: string;
} {
  const a = Math.abs(latitude);
  if (a <= 12) {
    return {
      bandLabel: "Deep tropics",
      uvSeasonLabel: "Year-round strong UV potential",
    };
  }
  if (a <= 23.5) {
    return {
      bandLabel: "Tropics",
      uvSeasonLabel: "Year-round UV season",
    };
  }
  if (a <= 35) {
    return {
      bandLabel: "Subtropical",
      uvSeasonLabel: "Long UV season (most of year)",
    };
  }
  if (a <= 48) {
    return {
      bandLabel: "Mid-latitude",
      uvSeasonLabel: "Seasonal UV — peak late spring–early fall",
    };
  }
  return {
    bandLabel: "High latitude",
    uvSeasonLabel: "Short UV season — long dark winters",
  };
}

export function formatLatitude(latitude: number): string {
  const hemi = latitude >= 0 ? "N" : "S";
  return `${Math.abs(latitude).toFixed(1)}°${hemi}`;
}

export function formatElevation(meters: number): string {
  const ft = Math.round(meters * 3.28084);
  const m = Math.round(meters);
  if (Math.abs(m) < 5) return `~sea level (${m} m)`;
  return `${ft.toLocaleString()} ft (${m.toLocaleString()} m)`;
}

/**
 * Elevation via free APIs (no key). Cached by rounded coords.
 * Fails soft — null if network/API unavailable.
 */
export async function fetchElevationMeters(
  latitude: number,
  longitude: number,
): Promise<number | null> {
  // ~1 km buckets so nearby ZIPs share cache entries
  const lat = Math.round(latitude * 100) / 100;
  const lng = Math.round(longitude * 100) / 100;
  const cache = { next: { revalidate: 60 * 60 * 24 * 30 } as const };

  try {
    const res = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`,
      {
        ...cache,
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (res.ok) {
      const data = (await res.json()) as {
        results?: Array<{ elevation?: number }>;
      };
      const el = data.results?.[0]?.elevation;
      if (typeof el === "number" && Number.isFinite(el)) return el;
    }
  } catch {
    /* try fallback */
  }

  try {
    const res = await fetch(
      `https://api.opentopodata.org/v1/srtm90m?locations=${lat},${lng}`,
      {
        ...cache,
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{ elevation?: number | null }>;
    };
    const el = data.results?.[0]?.elevation;
    return typeof el === "number" && Number.isFinite(el) ? el : null;
  } catch {
    return null;
  }
}

export function buildPlaceFactors(opts: {
  latitude: number;
  longitude: number;
  sun: SunTimes;
  timeZone: string;
  elevationM?: number | null;
}): PlaceFactors {
  const { latitude, longitude, sun, timeZone } = opts;
  const { bandLabel, uvSeasonLabel } = latitudeBand(latitude);
  const mag = magnetismScoreFromLocation(latitude, longitude);
  const elevationM =
    opts.elevationM === undefined ? null : opts.elevationM;

  return {
    latitude,
    longitude,
    latitudeLabel: formatLatitude(latitude),
    bandLabel,
    uvSeasonLabel,
    solarNoonLabel: formatTimeInZone(sun.solarNoon, timeZone),
    elevationM,
    elevationLabel:
      elevationM != null ? formatElevation(elevationM) : null,
    nearestVolcano: mag.nearestName,
    nearestVolcanoKm: mag.nearestKm,
    // Clearest for users: this is the closest catalog anchor, not "under your feet"
    geologyLabel: mag.nearestName,
    geologyDetail: `${formatDistanceKm(mag.nearestKm)} away · nearest free-flowing magma system in our model (drives magnetism score)`,
  };
}

export async function buildPlaceFactorsWithElevation(opts: {
  latitude: number;
  longitude: number;
  sun: SunTimes;
  timeZone: string;
}): Promise<PlaceFactors> {
  const elevationM = await fetchElevationMeters(opts.latitude, opts.longitude);
  return buildPlaceFactors({ ...opts, elevationM });
}

/** Short copy for the current sun phase (Today protocol hint). */
export function sunPhaseHint(
  phase: "night" | "sunrise" | "day" | "sunset",
): string {
  switch (phase) {
    case "sunrise":
      return "Sunrise window — prioritize outdoor morning light before screens.";
    case "sunset":
      return "Sunset window — dim indoor LEDs; get last natural light if you can.";
    case "night":
      return "Night phase — protect darkness; avoid bright overhead light.";
    case "day":
    default:
      return "Day phase — outdoor light and movement when possible.";
  }
}
