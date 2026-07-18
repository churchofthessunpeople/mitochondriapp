"use server";

import { auth } from "@/auth";
import type { GeomagDisplay } from "@/lib/geomag";
import type { ArtificialEmSnapshot } from "@/lib/artificial-em";
import { AUTH_RATE, consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { resolveZipMagnetismEnrichment } from "@/lib/zip-place-cache";

export type PlaceMagnetismEnrichment = {
  geomag: GeomagDisplay;
  artificialEm: ArtificialEmSnapshot | null;
  elevationM: number | null;
  elevationLabel: string | null;
  fromCache: boolean;
};

/** WMM + artificial EM for Place — uses shared ZIP cache when possible. */
export async function enrichPlaceMagnetismAction(
  latitude: number,
  longitude: number,
  elevationM?: number | null,
  postalCode?: string | null,
): Promise<PlaceMagnetismEnrichment> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const ip = await getClientIp();
  const limit = await consumeRateLimit(
    `place-enrich:${session.user.id}:${ip}`,
    30,
    AUTH_RATE.login.windowMs,
  );
  if (!limit.ok) {
    throw new Error(
      `Too many place lookups. Try again in ${limit.retryAfterSec}s.`,
    );
  }

  return resolveZipMagnetismEnrichment(
    postalCode,
    latitude,
    longitude,
    elevationM,
  );
}
