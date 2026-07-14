import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { effectiveLocation } from "@/lib/location-effective";
import { getSunTimes } from "@/lib/sun";
import type { UserSunriseContext } from "@/lib/sunrise-timing";

function asDate(date: Date | string | null | undefined): Date | null {
  if (date == null) return null;
  if (date instanceof Date) return date;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Sunrise for a user's effective location on a civil day. */
export async function getUserSunriseForDate(
  userId: string,
  dateIso: string,
): Promise<UserSunriseContext | null> {
  const [u] = await db
    .select({
      latitude: users.latitude,
      longitude: users.longitude,
      postalCode: users.postalCode,
      placeLabel: users.placeLabel,
      timezone: users.timezone,
      travelLatitude: users.travelLatitude,
      travelLongitude: users.travelLongitude,
      travelPostalCode: users.travelPostalCode,
      travelPlaceLabel: users.travelPlaceLabel,
      travelTimezone: users.travelTimezone,
      travelUntil: users.travelUntil,
      elevationM: users.elevationM,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!u) return null;

  const loc = effectiveLocation(u);
  if (loc.latitude == null || loc.longitude == null) return null;

  const [y, m, d] = dateIso.split("-").map(Number) as [number, number, number];
  const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const sun = getSunTimes(anchor, loc.latitude, loc.longitude);
  const rise = asDate(sun.sunrise);
  if (!rise) return null;

  return {
    sunrise: rise,
    timeZone: loc.timezone,
    sun,
  };
}
