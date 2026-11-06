/**
 * Clock times for the four-phase sun day at a place, for its local civil day.
 * The UV-B window uses the "shadow shorter than your height" rule, which is a
 * solar elevation above 45°. Everything here is geometry (sun angle) only:
 * clouds, ozone, altitude and air quality are not modelled.
 */

import { getSunTimes, solarElevationDeg } from "./sun";
import { uvForecastAt, type UvForecast } from "./uv-forecast";

export const UVB_MIN_ELEVATION_DEG = 45;
/** Fallback "low sun" angle for the UV-A start when the sun never sets. */
const UVA_START_FALLBACK_DEG = 10;
const SUNRISE_WINDOW_MIN = 90;
const SUNSET_PHASE_MIN = 60;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
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
  /** Modelled clear-sky UV index at solar noon (altitude-adjusted). */
  noonUvIndex: number | null;
  uvbSeason: UvbSeason;
  /** Days per year the solar-noon sun reaches 45 degrees (UV-B possible). */
  uvbDaysPerYear: number;
  /** Local civil day these windows belong to, `YYYY-MM-DD`. */
  day: string;
};

export type SunPhaseId =
  | "night"
  | "sunrise"
  | "uva"
  | "uvb"
  | "daylight"
  | "sunset";

export type SunNow = {
  phase: SunPhaseId;
  elevationDeg: number;
  /** UV index right now: the real forecast when available, else the sun-angle model. */
  uvIndex: number;
  /** Cloudless-sky UV index right now (for "clouds are cutting UV" context). */
  clearSkyUvIndex: number;
  uvSource: "forecast" | "model";
  /** When the current phase ends (null if not determinable). */
  until: string | null;
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

/** `YYYY-MM-DD` of the place's local civil day for an instant. */
export function localDayKey(now: Date, timeZone: string): string {
  return isoDay(localCivilDay(now, timeZone));
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

/**
 * Modelled clear-sky UV index from solar elevation, used when no real UV
 * forecast is available. UVI ≈ 12.5 · cos(SZA)^2.42 (typical ozone ~300 DU),
 * scaled for altitude (+6% per 1,000 m) and Earth–Sun distance (±3.3% over the
 * year, closest in early January). Good to roughly ±30%; clouds and ozone
 * swing the real value more than that.
 */
export function clearSkyUvIndex(
  elevationDeg: number,
  altitudeM = 0,
  at?: Date,
): number {
  if (elevationDeg <= 0) return 0;
  const mu = Math.sin((elevationDeg * Math.PI) / 180);
  const altitude = 1 + 0.06 * (Math.max(0, altitudeM) / 1000);
  let distance = 1;
  if (at) {
    const startOfYear = Date.UTC(at.getUTCFullYear(), 0, 0);
    const dayOfYear = (at.getTime() - startOfYear) / DAY_MS;
    distance = 1 + 0.0334 * Math.cos((2 * Math.PI * (dayOfYear - 3)) / 365.25);
  }
  return 12.5 * Math.pow(mu, 2.42) * altitude * distance;
}

export function computeSunPhases(
  now: Date,
  latitude: number,
  longitude: number,
  timeZone: string,
  altitudeM = 0,
): SunPhases {
  const anchor = localCivilDay(now, timeZone);
  const times = getSunTimes(new Date(anchor), latitude, longitude);
  const sunrise = asDate(times.sunrise);
  const sunset = asDate(times.sunset);
  const noon = asDate(times.solarNoon);
  const noonElevationDeg = noon ? solarElevationDeg(noon, latitude, longitude) : null;
  const hasUvb = noonElevationDeg != null && noonElevationDeg >= UVB_MIN_ELEVATION_DEG;
  const noonUvIndex =
    noonElevationDeg != null && noon
      ? clearSkyUvIndex(noonElevationDeg, altitudeM, noon)
      : null;
  const day = isoDay(anchor);

  let uvbSeason: UvbSeason = { kind: hasUvb ? "all-year" : "never" };
  let seasonFound = false;
  // Days in the next 365 whose solar-noon sun reaches 45 degrees.
  let uvbDays = 0;
  for (let d = 0; d < 365; d++) {
    const elevation = noonElevation(anchor + d * DAY_MS, latitude, longitude);
    const up = elevation != null && elevation >= UVB_MIN_ELEVATION_DEG;
    if (up) uvbDays++;
    if (!seasonFound && d > 0 && elevation != null && up !== hasUvb) {
      uvbSeason = { kind: hasUvb ? "ends" : "returns", date: isoDay(anchor + d * DAY_MS) };
      seasonFound = true;
    }
  }
  const uvbDaysPerYear = uvbDays;

  if (!noon) {
    return {
      sunriseWindow: null,
      uvaPhase: null,
      uvbWindow: null,
      sunsetPhase: null,
      solarNoon: null,
      noonElevationDeg,
      noonUvIndex,
      uvbSeason,
      uvbDaysPerYear,
      day,
    };
  }

  // UV-B: crossings of 45° either side of solar noon. This does not depend on
  // sunrise/sunset existing, so it also works under the midnight sun.
  const uvbStart = hasUvb
    ? crossing(new Date(noon.getTime() - 12 * HOUR_MS), noon, UVB_MIN_ELEVATION_DEG, latitude, longitude)
    : null;
  const uvbEnd = hasUvb
    ? crossing(noon, new Date(noon.getTime() + 12 * HOUR_MS), UVB_MIN_ELEVATION_DEG, latitude, longitude)
    : null;

  // UV-A starts 90 min after sunrise; if the sun never sets, use a low-sun angle.
  const uvaStart = sunrise
    ? new Date(sunrise.getTime() + SUNRISE_WINDOW_MIN * MINUTE_MS)
    : solarElevationDeg(new Date(noon.getTime() - 12 * HOUR_MS), latitude, longitude) <
        UVA_START_FALLBACK_DEG && (noonElevationDeg ?? 0) > UVA_START_FALLBACK_DEG
      ? crossing(
          new Date(noon.getTime() - 12 * HOUR_MS),
          noon,
          UVA_START_FALLBACK_DEG,
          latitude,
          longitude,
        )
      : null;

  return {
    sunriseWindow: sunrise
      ? windowOf(sunrise, new Date(sunrise.getTime() + SUNRISE_WINDOW_MIN * MINUTE_MS))
      : null,
    uvaPhase: uvaStart ? windowOf(uvaStart, uvbStart ?? noon) : null,
    uvbWindow: uvbStart && uvbEnd ? windowOf(uvbStart, uvbEnd) : null,
    sunsetPhase: sunset
      ? windowOf(new Date(sunset.getTime() - SUNSET_PHASE_MIN * MINUTE_MS), sunset)
      : null,
    solarNoon: noon.toISOString(),
    noonElevationDeg,
    noonUvIndex,
    uvbSeason,
    uvbDaysPerYear,
    day,
  };
}

function within(w: SunPhaseWindow | null, t: number): boolean {
  return w != null && t >= Date.parse(w.start) && t < Date.parse(w.end);
}

/**
 * Which phase of the sun day an instant falls in, plus the clear-sky UV index
 * and when the phase ends. Pure, so the client can call it on a timer.
 */
export function sunNow(
  phases: SunPhases,
  at: Date,
  latitude: number,
  longitude: number,
  options: { altitudeM?: number; forecast?: UvForecast | null } = {},
): SunNow {
  const t = at.getTime();
  const elevationDeg = solarElevationDeg(at, latitude, longitude);
  const modelled = clearSkyUvIndex(elevationDeg, options.altitudeM ?? 0, at);
  const real = options.forecast ? uvForecastAt(options.forecast, at) : null;
  // The forecast is hourly, so trust the sun angle for "is the sun up at all".
  const uvIndex = real ? (elevationDeg > 0 ? real.uv : 0) : modelled;
  const clearSkyUv = real ? (elevationDeg > 0 ? real.clearSky : 0) : modelled;
  const uvSource = real ? ("forecast" as const) : ("model" as const);

  const ordered: Array<[SunPhaseId, SunPhaseWindow | null]> = [
    ["uvb", phases.uvbWindow],
    ["sunrise", phases.sunriseWindow],
    ["sunset", phases.sunsetPhase],
    ["uva", phases.uvaPhase],
  ];
  for (const [phase, window] of ordered) {
    if (within(window, t)) return { phase, elevationDeg, uvIndex, clearSkyUvIndex: clearSkyUv, uvSource, until: window!.end };
  }
  // Daylight outside every named phase: the afternoon before the sunset hour
  // (or a low-sun gap under the midnight sun); otherwise night.
  if (elevationDeg > -0.83) {
    const next = [phases.sunsetPhase?.start, phases.uvaPhase?.start]
      .filter((s): s is string => !!s && Date.parse(s) > t)
      .sort()[0];
    return { phase: "daylight", elevationDeg, uvIndex, clearSkyUvIndex: clearSkyUv, uvSource, until: next ?? null };
  }
  return { phase: "night", elevationDeg, uvIndex, clearSkyUvIndex: clearSkyUv, uvSource, until: null };
}
