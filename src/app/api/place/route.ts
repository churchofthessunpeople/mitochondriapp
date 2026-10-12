import { NextResponse } from "next/server";
import { geocodeUsZip } from "@/lib/geo";
import {
  fetchArtificialEmQuick,
  type ArtificialEmSnapshot,
} from "@/lib/artificial-em";
import {
  fetchGeomagFieldQuick,
  formatGeomagDisplay,
  type GeomagField,
} from "@/lib/geomag";
import {
  buildPlaceFactors,
  fetchElevationMeters,
} from "@/lib/place-factors";
import {
  normalizePublicZip,
  type PublicPlaceResult,
} from "@/lib/public-place";
import { getSunTimesForLocalDay } from "@/lib/sun";

export const dynamic = "force-dynamic";

function withDeadline<T>(
  promise: Promise<T>,
  milliseconds: number,
  fallback: T,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), milliseconds);
    }),
  ]);
}

function serializeTime(value: Date | string | null): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function serializeGeomag(
  geomag: ReturnType<typeof formatGeomagDisplay> | null,
) {
  if (!geomag) return null;
  return {
    totalUtLabel: geomag.totalUtLabel,
    totalGaussLabel: geomag.totalGaussLabel,
    inclinationLabel: geomag.inclinationLabel,
    declinationLabel: geomag.declinationLabel,
    summaryLine: geomag.summaryLine,
    model: geomag.model,
    date: geomag.date,
    source: geomag.source,
  };
}

function serializeArtificialEm(
  artificialEm: ArtificialEmSnapshot | null,
) {
  if (!artificialEm) return null;
  return {
    loadScore: artificialEm.loadScore,
    loadLabel: artificialEm.loadLabel,
    summaryLine: artificialEm.summaryLine,
    detailLine: artificialEm.detailLine,
    sources: artificialEm.sources,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter a US ZIP code to find your place." },
      { status: 400 },
    );
  }

  const zip =
    typeof body === "object" &&
    body !== null &&
    "zip" in body &&
    typeof body.zip === "string"
      ? body.zip
      : "";

  try {
    const normalizedZip = normalizePublicZip(zip);
    if (!normalizedZip) {
      throw new Error("Enter a valid US ZIP code (e.g. 90210 or 10001).");
    }
    const place = await geocodeUsZip(normalizedZip);
    const sun = getSunTimesForLocalDay(
      new Date(),
      place.latitude,
      place.longitude,
      place.timezone,
    );

    const [elevationM, geomagRaw, artificialEm] = await Promise.all([
      withDeadline(
        fetchElevationMeters(place.latitude, place.longitude),
        1_200,
        null,
      ),
      withDeadline(
        fetchGeomagFieldQuick(place.latitude, place.longitude),
        2_000,
        null as GeomagField | null,
      ),
      withDeadline(
        fetchArtificialEmQuick(place.latitude, place.longitude),
        3_000,
        null,
      ),
    ]);

    const geomag = geomagRaw ? formatGeomagDisplay(geomagRaw) : null;
    const factors = buildPlaceFactors({
      latitude: place.latitude,
      longitude: place.longitude,
      sun,
      timeZone: place.timezone,
      elevationM,
      geomag,
      artificialEm,
    });

    const result: PublicPlaceResult = {
      postalCode: place.postalCode,
      placeName: place.placeName,
      state: place.state ?? place.stateAbbr ?? "",
      country: place.country,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
      sun: {
        sunrise: serializeTime(sun.sunrise),
        sunset: serializeTime(sun.sunset),
        solarNoon: serializeTime(sun.solarNoon),
        dayLengthHours: sun.dayLengthHours,
      },
      factors: {
        latitudeLabel: factors.latitudeLabel,
        bandLabel: factors.bandLabel,
        uvSeasonLabel: factors.uvSeasonLabel,
        solarNoonLabel: factors.solarNoonLabel,
        elevationLabel: factors.elevationLabel,
        geologyLabel: factors.geologyLabel,
        geologyDetail: factors.geologyDetail,
        geomag: serializeGeomag(factors.geomag),
        artificialEm: serializeArtificialEm(factors.artificialEm),
      },
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Place lookup failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
