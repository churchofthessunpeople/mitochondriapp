"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { regions, users } from "@/db/schema";
import { findNearestRegion, geocodeUsZip } from "@/lib/geo";
import { listRegions } from "@/lib/regions";
import { AUTH_RATE, consumeRateLimit, getClientIp } from "@/lib/rate-limit";

function revalidateLocation() {
  revalidatePath("/place");
  revalidatePath("/today");
  revalidatePath("/account");
  revalidatePath("/region");
  revalidatePath("/schedule");
}

export async function setUserRegionAction(regionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [region] = await db
    .select()
    .from(regions)
    .where(eq(regions.id, regionId))
    .limit(1);

  if (!region?.active) throw new Error("Region not found");

  await db
    .update(users)
    .set({
      regionId: region.id,
      timezone: region.timezone,
      // Manual region pick: use region centroid for sun unless ZIP already set
      latitude: region.latitude,
      longitude: region.longitude,
      placeLabel: region.locality
        ? `${region.locality}, ${region.country}`
        : region.name,
      postalCode: null,
    })
    .where(eq(users.id, session.user.id));

  revalidateLocation();
}

export type ZipFormState = {
  error?: string;
  success?: string;
  placeLabel?: string;
  nearestRegionName?: string;
  distanceKm?: number;
};

/**
 * US ZIP → lat/lng + timezone + nearest curated lifestyle region.
 */
export async function setLocationFromZipAction(
  _prev: ZipFormState,
  formData: FormData,
): Promise<ZipFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const ip = await getClientIp();
  const limit = await consumeRateLimit(
    `zip-geo:${ip}`,
    20,
    AUTH_RATE.login.windowMs,
  );
  if (!limit.ok) {
    return {
      error: `Too many lookups. Try again in ${limit.retryAfterSec}s.`,
    };
  }

  const zip = String(formData.get("zip") ?? "").trim();
  if (!zip) return { error: "Enter a US ZIP code." };

  try {
    const place = await geocodeUsZip(zip);
    const catalog = await listRegions();
    // Prefer US metros for US ZIPs so Dallas never snaps to Miami/El Salvador
    const nearest = findNearestRegion(
      place.latitude,
      place.longitude,
      catalog,
      {
        preferCountry: "United States",
        maxDistanceKm: 600,
      },
    );

    const placeLabel = [place.placeName, place.stateAbbr || place.state]
      .filter(Boolean)
      .join(", ");

    await db
      .update(users)
      .set({
        postalCode: place.postalCode,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
        placeLabel,
        regionId: nearest?.region.id ?? null,
      })
      .where(eq(users.id, session.user.id));

    revalidateLocation();

    const dist =
      nearest != null ? Math.round(nearest.distanceKm) : undefined;

    return {
      success: nearest
        ? `Located ${placeLabel}. Sun times use your ZIP; lifestyle score from nearest rated place: ${nearest.region.name} (${dist} km).`
        : `Located ${placeLabel}. Sun times updated.`,
      placeLabel,
      nearestRegionName: nearest?.region.name,
      distanceKm: nearest?.distanceKm,
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not look up that ZIP.",
    };
  }
}

export async function clearUserLocationAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({
      postalCode: null,
      latitude: null,
      longitude: null,
      placeLabel: null,
      regionId: null,
    })
    .where(eq(users.id, session.user.id));

  revalidateLocation();
}
