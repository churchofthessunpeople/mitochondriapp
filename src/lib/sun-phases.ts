/**
 * Clock times for the four-phase sun day at a place, for its local civil day.
 * The UV-B window uses the "shadow shorter than your height" rule, which is a
 * solar elevation above 45°.
 */

import { getSunTimes, solarElevationDeg } from "./sun";

export const UVB_MIN_ELEVATION_DEG = 45;
const SUNRISE_WINDOW_MIN = 90;
const SUNSET_PHASE_MIN = 60;
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export type SunPhaseWindow = { start: string; end: string };

export type UvbSeason =
  | { kind: "ends" | "returns"; date: string }
  | { kind: "all-year" | "never" };

export type SunPhases = {
  sunriseWindow: SunPhaseWindow | null;
  uvaPhase: SunPhaseWindow | null;
  uvbWindow: SunPhaseWindow | null;
  sunsetPhase: SunPhaseWindow | null;
  solarNoon: string | null;
  noonElevationDeg: number | null;
  uvbSeason: UvbSeason;
};

function localCivilDay(now: Date, timeZone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value ?? "1");
    return Date.UTC(get("year"), get("month") - 1, get("day"), 12);
  } catch {
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12);
  }
}

function asDate(value: Date | string | null): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function noonElevation(anchorMs: number, latitude: number, longitude: number): number | null {
  const noon = asDate(getSunTimes(new Date(anchorMs), latitude, longitude).solarNoon);
  return noon ? solarElevationDeg(noon, latitude, longitude) : null;
}

/** Instant between `from` and `to` where elevation crosses `target` (elevation is monotonic there). */
function crossing(
  from: Date,
  to: Date,
  target: number,
  latitude: number,
  longitude: number,
): Date {
  let lo = from.getTime();
  let hi = to.getTime();
  const rising =
    solarElevationDeg(to, latitude, longitude) > solarElevationDeg(from, latitude, longitude);
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const above = solarElevationDeg(new Date(mid), latitude, longitude) >= target;
    if (above === rising) hi = mid;
    else lo = mid;
  }
  return new Date((lo + hi) / 2);
}

function windowOf(start: Date, end: Date): SunPhaseWindow | null {
  return end.getTime() > start.getTime()
    ? { start: start.toISOString(), end: end.toISOString() }
    : null;
}

function isoDay(anchorMs: number): string {
  return new Date(anchorMs).toISOString().slice(0, 10);
}

export function computeSunPhases(
  now: Date,
  latitude: number,
  longitude: number,
  timeZone: string,
): SunPhases {
  const anchor = localCivilDay(now, timeZone);
  const times = getSunTimes(new Date(anchor), latitude, longitude);
  const sunrise = asDate(times.sunrise);
  const sunset = asDate(times.sunset);
  const noon = asDate(times.solarNoon);
  const noonElevationDeg = noon ? solarElevationDeg(noon, latitude, longitude) : null;
  const hasUvb = noonElevationDeg != null && noonElevationDeg >= UVB_MIN_ELEVATION_DEG;

  let uvbSeason: UvbSeason = { kind: hasUvb ? "all-year" : "never" };
  for (let day = 1; day <= 366; day++) {
    const elevation = noonElevation(anchor + day * DAY_MS, latitude, longitude);
    if (elevation != null && elevation >= UVB_MIN_ELEVATION_DEG !== hasUvb) {
      uvbSeason = { kind: hasUvb ? "ends" : "returns", date: isoDay(anchor + day * DAY_MS) };
      break;
    }
  }

  if (!sunrise || !sunset || !noon) {
    return {
      sunriseWindow: null,
      uvaPhase: null,
      uvbWindow: null,
      sunsetPhase: null,
      solarNoon: noon?.toISOString() ?? null,
      noonElevationDeg,
      uvbSeason,
    };
  }

  const uvb = hasUvb
    ? {
        start: crossing(sunrise, noon, UVB_MIN_ELEVATION_DEG, latitude, longitude),
        end: crossing(noon, sunset, UVB_MIN_ELEVATION_DEG, latitude, longitude),
      }
    : null;
  const sunriseEnd = new Date(sunrise.getTime() + SUNRISE_WINDOW_MIN * MINUTE_MS);

  return {
    sunriseWindow: windowOf(sunrise, sunriseEnd),
    uvaPhase: windowOf(sunriseEnd, uvb?.start ?? noon),
    uvbWindow: uvb ? windowOf(uvb.start, uvb.end) : null,
    sunsetPhase: windowOf(new Date(sunset.getTime() - SUNSET_PHASE_MIN * MINUTE_MS), sunset),
    solarNoon: noon.toISOString(),
    noonElevationDeg,
    uvbSeason,
  };
}
