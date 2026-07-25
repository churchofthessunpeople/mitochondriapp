/**
 * Shared ZIP place cache — geocode + elevation + WMM + artificial EM.
 * One lookup per ZIP per ~30 days (not per user session).
 *
 * Cold lookups return after geocode (fast path). Elevation / WMM / artificial
 * EM fill in via `after()` so onboarding and ZIP save stay responsive.
 */

import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { zipPlaceCache } from "@/db/schema";
import type { ArtificialEmSnapshot } from "@/lib/artificial-em";
import {
  artificialEmNeedsRefresh,
  fetchArtificialEmQuick,
} from "@/lib/artificial-em";
import { geocodeUsZip, type GeocodedPlace } from "@/lib/geo";
import {
  fetchGeomagFieldQuick,
  formatGeomagDisplay,
  geomagDipoleFallback,
  type GeomagDisplay,
  type GeomagField,
} from "@/lib/geomag";
import {
  fetchElevationMeters,
  formatElevation,
} from "@/lib/place-factors";

/** Refresh external place APIs after this interval. */
export const ZIP_PLACE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function normalizeUsZip(raw: string): string | null {
  const zip = raw.trim().replace(/\s+/g, "");
  const five = zip.match(/^(\d{5})(?:-?\d{4})?$/);
  return five ? five[1]! : null;
}

export function isZipPlaceCacheFresh(
  refreshedAt: Date | null | undefined,
  ttlMs = ZIP_PLACE_CACHE_TTL_MS,
): boolean {
  if (!refreshedAt) return false;
  return Date.now() - refreshedAt.getTime() < ttlMs;
}

export type ZipPlaceResolved = {
  postalCode: string;
  geocode: GeocodedPlace;
  elevationM: number | null;
  geomag: GeomagDisplay | null;
  artificialEm: ArtificialEmSnapshot | null;
  refreshedAt: Date;
  fromCache: boolean;
};

function rowToGeocode(row: typeof zipPlaceCache.$inferSelect): GeocodedPlace {
  return {
    postalCode: row.postalCode,
    latitude: row.latitude,
    longitude: row.longitude,
    placeName: row.placeName,
    state: row.state ?? undefined,
    stateAbbr: row.stateAbbr ?? undefined,
    country: row.country,
    countryCode: row.countryCode,
    timezone: row.timezone,
  };
}

function rowToResolved(
  row: typeof zipPlaceCache.$inferSelect,
): ZipPlaceResolved {
  const geomagRaw = row.geomag as GeomagField | null;
  return {
    postalCode: row.postalCode,
    geocode: rowToGeocode(row),
    elevationM: row.elevationM,
    geomag: geomagRaw ? formatGeomagDisplay(geomagRaw) : null,
    artificialEm: (row.artificialEm as ArtificialEmSnapshot | null) ?? null,
    refreshedAt: row.refreshedAt,
    fromCache: true,
  };
}

export async function getZipPlaceCached(
  rawZip: string,
): Promise<ZipPlaceResolved | null> {
  const code = normalizeUsZip(rawZip);
  if (!code) return null;

  try {
    const [row] = await db
      .select()
      .from(zipPlaceCache)
      .where(eq(zipPlaceCache.postalCode, code))
      .limit(1);
    if (!row || !isZipPlaceCacheFresh(row.refreshedAt)) return null;
    return rowToResolved(row);
  } catch {
    return null;
  }
}

async function fetchZipEnrichment(
  latitude: number,
  longitude: number,
  elevationM?: number | null,
): Promise<{
  elevationM: number | null;
  geomag: GeomagField;
  artificialEm: ArtificialEmSnapshot | null;
}> {
  const elev =
    elevationM !== undefined && elevationM !== null
      ? elevationM
      : await Promise.race([
          fetchElevationMeters(latitude, longitude),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 700)),
        ]);

  const [geomag, artificialEm] = await Promise.all([
    fetchGeomagFieldQuick(latitude, longitude, { elevationM: elev }),
    fetchArtificialEmQuick(latitude, longitude),
  ]);

  return { elevationM: elev, geomag, artificialEm };
}

async function upsertZipPlaceCache(entry: {
  geocode: GeocodedPlace;
  elevationM: number | null;
  geomag: GeomagField;
  artificialEm: ArtificialEmSnapshot | null;
  refreshedAt: Date;
}): Promise<void> {
  const g = entry.geocode;
  await db
    .insert(zipPlaceCache)
    .values({
      postalCode: g.postalCode,
      latitude: g.latitude,
      longitude: g.longitude,
      placeName: g.placeName,
      state: g.state ?? null,
      stateAbbr: g.stateAbbr ?? null,
      timezone: g.timezone,
      country: g.country,
      countryCode: g.countryCode,
      elevationM: entry.elevationM,
      geomag: entry.geomag,
      artificialEm: entry.artificialEm,
      refreshedAt: entry.refreshedAt,
    })
    .onConflictDoUpdate({
      target: zipPlaceCache.postalCode,
      set: {
        latitude: g.latitude,
        longitude: g.longitude,
        placeName: g.placeName,
        state: g.state ?? null,
        stateAbbr: g.stateAbbr ?? null,
        timezone: g.timezone,
        country: g.country,
        countryCode: g.countryCode,
        elevationM: entry.elevationM,
        geomag: entry.geomag,
        artificialEm: entry.artificialEm,
        refreshedAt: entry.refreshedAt,
      },
    });
}

async function enrichAndCacheZipPlace(geocode: GeocodedPlace): Promise<void> {
  const { elevationM, geomag, artificialEm } = await fetchZipEnrichment(
    geocode.latitude,
    geocode.longitude,
  );
  await upsertZipPlaceCache({
    geocode,
    elevationM,
    geomag,
    artificialEm,
    refreshedAt: new Date(),
  });
}

/**
 * Resolve ZIP place data — cache hit when fresh, otherwise geocode immediately
 * and return. Heavy enrichment (elevation, WMM, artificial EM) continues in
 * `after()` and warms the 30-day cache.
 */
export async function resolveZipPlaceData(
  rawZip: string,
): Promise<ZipPlaceResolved> {
  const cached = await getZipPlaceCached(rawZip);
  if (cached) {
    if (artificialEmNeedsRefresh(cached.artificialEm)) {
      after(() => {
        void enrichAndCacheZipPlace(cached.geocode).catch(() => {});
      });
    }
    return cached;
  }

  const geocode = await geocodeUsZip(rawZip);
  const refreshedAt = new Date();
  const geomag = geomagDipoleFallback(geocode.latitude, geocode.longitude);

  // Do not cache the stub for 30 days — only persist after full enrichment.
  after(() => {
    void enrichAndCacheZipPlace(geocode).catch(() => {});
  });

  return {
    postalCode: geocode.postalCode,
    geocode,
    elevationM: null,
    geomag: formatGeomagDisplay(geomag),
    artificialEm: null,
    refreshedAt,
    fromCache: false,
  };
}

/** Magnetism enrichment for Place tab — prefers ZIP cache when available. */
export async function resolveZipMagnetismEnrichment(
  rawZip: string | null | undefined,
  latitude: number,
  longitude: number,
  elevationM?: number | null,
): Promise<{
  geomag: GeomagDisplay;
  artificialEm: ArtificialEmSnapshot | null;
  elevationM: number | null;
  elevationLabel: string | null;
  fromCache: boolean;
}> {
  if (rawZip) {
    const cached = await getZipPlaceCached(rawZip);
    if (cached?.geomag && !artificialEmNeedsRefresh(cached.artificialEm)) {
      return {
        geomag: cached.geomag,
        artificialEm: cached.artificialEm,
        elevationM: cached.elevationM ?? elevationM ?? null,
        elevationLabel:
          cached.elevationM != null
            ? formatElevation(cached.elevationM)
            : elevationM != null
              ? formatElevation(elevationM)
              : null,
        fromCache: true,
      };
    }

    // Geomag cache hit but artificial EM is pre-density schema — refresh EM only.
    if (cached?.geomag && artificialEmNeedsRefresh(cached.artificialEm)) {
      const artificialEm = await fetchArtificialEmQuick(
        cached.geocode.latitude,
        cached.geocode.longitude,
      );
      if (artificialEm) {
        try {
          const code = normalizeUsZip(rawZip);
          if (code) {
            await db
              .update(zipPlaceCache)
              .set({
                artificialEm,
                refreshedAt: new Date(),
              })
              .where(eq(zipPlaceCache.postalCode, code));
          }
        } catch {
          /* keep serving live EM even if cache write fails */
        }
      }
      return {
        geomag: cached.geomag,
        artificialEm: artificialEm ?? cached.artificialEm,
        elevationM: cached.elevationM ?? elevationM ?? null,
        elevationLabel:
          cached.elevationM != null
            ? formatElevation(cached.elevationM)
            : elevationM != null
              ? formatElevation(elevationM)
              : null,
        fromCache: false,
      };
    }

    try {
      const resolved = await resolveZipPlaceData(rawZip);
      if (resolved.geomag) {
        return {
          geomag: resolved.geomag,
          artificialEm: resolved.artificialEm,
          elevationM: resolved.elevationM,
          elevationLabel:
            resolved.elevationM != null
              ? formatElevation(resolved.elevationM)
              : null,
          fromCache: resolved.fromCache,
        };
      }
    } catch {
      /* fall through to coordinate lookup */
    }
  }

  const { elevationM: elev, geomag, artificialEm } = await fetchZipEnrichment(
    latitude,
    longitude,
    elevationM,
  );

  return {
    geomag: formatGeomagDisplay(geomag),
    artificialEm,
    elevationM: elev,
    elevationLabel: elev != null ? formatElevation(elev) : null,
    fromCache: false,
  };
}
