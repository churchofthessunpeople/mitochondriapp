import { getTodayIsoForTimezone } from "@/lib/date-server";

export type LocationFields = {
  latitude: number | null;
  longitude: number | null;
  postalCode: string | null;
  placeLabel: string | null;
  timezone: string | null;
  travelLatitude?: number | null;
  travelLongitude?: number | null;
  travelPostalCode?: string | null;
  travelPlaceLabel?: string | null;
  travelTimezone?: string | null;
  travelUntil?: string | null;
  elevationM?: number | null;
};

/** Home location, overridden by active travel mode. */
export function effectiveLocation(u: LocationFields) {
  const today = getTodayIsoForTimezone(u.timezone || "UTC");
  const traveling =
    u.travelUntil != null &&
    u.travelUntil >= today &&
    u.travelLatitude != null &&
    u.travelLongitude != null;

  if (traveling) {
    return {
      latitude: u.travelLatitude!,
      longitude: u.travelLongitude!,
      postalCode: u.travelPostalCode ?? null,
      placeLabel: u.travelPlaceLabel
        ? `Travel · ${u.travelPlaceLabel}`
        : "Travel",
      timezone: u.travelTimezone || u.timezone || "UTC",
      isTravel: true as const,
      travelUntil: u.travelUntil!,
      elevationM: null as number | null,
    };
  }

  return {
    latitude: u.latitude,
    longitude: u.longitude,
    postalCode: u.postalCode,
    placeLabel: u.placeLabel,
    timezone: u.timezone || "UTC",
    isTravel: false as const,
    travelUntil: null as string | null,
    elevationM: u.elevationM ?? null,
  };
}
