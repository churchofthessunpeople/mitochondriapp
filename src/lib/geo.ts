/**
 * Geocoding + distance helpers for ZIP → location assignment.
 */

export type GeocodedPlace = {
  postalCode: string;
  latitude: number;
  longitude: number;
  placeName: string;
  state?: string;
  stateAbbr?: string;
  country: string;
  countryCode: string;
  timezone: string;
};

/** Great-circle distance in kilometers */
export function haversineKm(
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
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(0)} km`;
  const mi = km * 0.621371;
  return `${Math.round(km)} km (${Math.round(mi)} mi)`;
}

/** US state abbreviation → primary IANA timezone (good enough for ZIP centroids) */
const US_STATE_TZ: Record<string, string> = {
  AL: "America/Chicago",
  AK: "America/Anchorage",
  AZ: "America/Phoenix",
  AR: "America/Chicago",
  CA: "America/Los_Angeles",
  CO: "America/Denver",
  CT: "America/New_York",
  DE: "America/New_York",
  FL: "America/New_York",
  GA: "America/New_York",
  HI: "Pacific/Honolulu",
  ID: "America/Boise",
  IL: "America/Chicago",
  IN: "America/Indiana/Indianapolis",
  IA: "America/Chicago",
  KS: "America/Chicago",
  KY: "America/New_York",
  LA: "America/Chicago",
  ME: "America/New_York",
  MD: "America/New_York",
  MA: "America/New_York",
  MI: "America/Detroit",
  MN: "America/Chicago",
  MS: "America/Chicago",
  MO: "America/Chicago",
  MT: "America/Denver",
  NE: "America/Chicago",
  NV: "America/Los_Angeles",
  NH: "America/New_York",
  NJ: "America/New_York",
  NM: "America/Denver",
  NY: "America/New_York",
  NC: "America/New_York",
  ND: "America/Chicago",
  OH: "America/New_York",
  OK: "America/Chicago",
  OR: "America/Los_Angeles",
  PA: "America/New_York",
  RI: "America/New_York",
  SC: "America/New_York",
  SD: "America/Chicago",
  TN: "America/Chicago",
  TX: "America/Chicago",
  UT: "America/Denver",
  VT: "America/New_York",
  VA: "America/New_York",
  WA: "America/Los_Angeles",
  WV: "America/New_York",
  WI: "America/Chicago",
  WY: "America/Denver",
  DC: "America/New_York",
  PR: "America/Puerto_Rico",
};

/**
 * Geocode a US ZIP via Zippopotam.us (no API key).
 * Accepts 5-digit or ZIP+4 (uses first 5).
 */
export async function geocodeUsZip(rawZip: string): Promise<GeocodedPlace> {
  const zip = rawZip.trim().replace(/\s+/g, "");
  const five = zip.match(/^(\d{5})(?:-?\d{4})?$/);
  if (!five) {
    throw new Error("Enter a valid US ZIP code (e.g. 90210 or 10001).");
  }

  const code = five[1]!;
  const res = await fetch(`https://api.zippopotam.us/us/${code}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (res.status === 404) {
    throw new Error(`ZIP ${code} was not found.`);
  }
  if (!res.ok) {
    throw new Error(`Lookup lookup failed (${res.status}). Try again.`);
  }

  const data = (await res.json()) as {
    "post code"?: string;
    country?: string;
    "country abbreviation"?: string;
    places?: Array<{
      "place name"?: string;
      state?: string;
      "state abbreviation"?: string;
      latitude?: string;
      longitude?: string;
    }>;
  };

  const place = data.places?.[0];
  if (!place?.latitude || !place?.longitude) {
    throw new Error("No location data for that ZIP.");
  }

  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates for that ZIP.");
  }

  const stateAbbr = place["state abbreviation"] ?? "";
  const timezone = US_STATE_TZ[stateAbbr] ?? "America/New_York";
  const placeName = place["place name"] ?? code;
  const state = place.state ?? stateAbbr;

  return {
    postalCode: code,
    latitude,
    longitude,
    placeName,
    state,
    stateAbbr,
    country: data.country ?? "United States",
    countryCode: data["country abbreviation"] ?? "US",
    timezone,
  };
}

export function findNearestRegion<
  T extends { id: string; latitude: number; longitude: number },
>(
  lat: number,
  lng: number,
  regions: T[],
): { region: T; distanceKm: number } | null {
  if (regions.length === 0) return null;
  let best: T | null = null;
  let bestKm = Infinity;
  for (const r of regions) {
    const km = haversineKm(lat, lng, r.latitude, r.longitude);
    if (km < bestKm) {
      bestKm = km;
      best = r;
    }
  }
  return best ? { region: best, distanceKm: bestKm } : null;
}
