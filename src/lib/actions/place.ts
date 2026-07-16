"use server";

import type { GeomagDisplay } from "@/lib/geomag";
import type { ArtificialEmSnapshot } from "@/lib/artificial-em";
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
  return resolveZipMagnetismEnrichment(
    postalCode,
    latitude,
    longitude,
    elevationM,
  );
}
