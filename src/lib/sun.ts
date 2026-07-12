/**
 * Approximate sunrise/sunset for a lat/lng on a civil day.
 * Algorithm: NOAA / Wikipedia "Sunrise equation" (Julian-day form).
 * Longitude is standard east-positive (US ZIPs are negative).
 *
 * Previous bug: formulas mixed west-positive λw with east-positive L,
 * so solar noon landed ~12h off and rise/set appeared inverted
 * (e.g. Dallas "sunrise" 5:34 PM instead of ~6:29 AM).
 */

export type SunTimes = {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  dayLengthHours: number | null;
};

function toJulian(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function fromJulian(j: number): Date {
  return new Date((j - 2440587.5) * 86400000);
}

function rad(d: number) {
  return (d * Math.PI) / 180;
}

function deg(r: number) {
  return (r * 180) / Math.PI;
}

/** Normalize degrees into [0, 360). */
function mod360(x: number): number {
  const m = x % 360;
  return m < 0 ? m + 360 : m;
}

/**
 * @param date any Date; the UTC calendar day of this instant is used as the
 *   civil day anchor (pass local-noon-as-UTC for a specific Y-M-D if needed)
 * @param latitude degrees, north positive
 * @param longitude degrees, east positive (Zippopotam / GeoJSON convention)
 */
export function getSunTimes(
  date: Date,
  latitude: number,
  longitude: number,
): SunTimes {
  const phi = rad(latitude);
  // Wikipedia formulas use west-positive longitude
  const Lw = -longitude;

  // Noon UTC of the given UTC calendar day stabilizes the day index
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const day = new Date(Date.UTC(y, m, d, 12, 0, 0));
  const J = toJulian(day);

  // n = Julian cycle; J* ≈ approximate solar noon
  const n = Math.round(J - 2451545.0 + 0.0008 - Lw / 360);
  const Jstar = n + 2451545.0009 + Lw / 360;

  const M = mod360(357.5291 + 0.98560028 * (Jstar - 2451545));
  const C =
    1.9148 * Math.sin(rad(M)) +
    0.02 * Math.sin(rad(2 * M)) +
    0.0003 * Math.sin(rad(3 * M));
  const lambda = mod360(M + C + 180 + 102.9372);
  const Jtransit =
    Jstar + 0.0053 * Math.sin(rad(M)) - 0.0069 * Math.sin(rad(2 * lambda));

  const delta = Math.asin(Math.sin(rad(lambda)) * Math.sin(rad(23.44)));
  const cosH =
    (Math.sin(rad(-0.83)) - Math.sin(phi) * Math.sin(delta)) /
    (Math.cos(phi) * Math.cos(delta));

  if (cosH > 1) {
    return {
      sunrise: null,
      sunset: null,
      solarNoon: fromJulian(Jtransit),
      dayLengthHours: 0,
    };
  }
  if (cosH < -1) {
    return {
      sunrise: null,
      sunset: null,
      solarNoon: fromJulian(Jtransit),
      dayLengthHours: 24,
    };
  }

  // Hour angle → fraction of a day
  const w0 = Math.acos(cosH);
  const Jrise = Jtransit - deg(w0) / 360;
  const Jset = Jtransit + deg(w0) / 360;
  const sunrise = fromJulian(Jrise);
  const sunset = fromJulian(Jset);
  const dayLengthHours = (Jset - Jrise) * 24;

  return {
    sunrise,
    sunset,
    solarNoon: fromJulian(Jtransit),
    dayLengthHours,
  };
}

/**
 * Sun times for "today" in a given IANA timezone (avoids UTC day-edge mistakes).
 */
export function getSunTimesForLocalDay(
  now: Date,
  latitude: number,
  longitude: number,
  timeZone: string,
): SunTimes {
  let y: number;
  let m: number;
  let d: number;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "01";
    y = Number(get("year"));
    m = Number(get("month"));
    d = Number(get("day"));
  } catch {
    y = now.getUTCFullYear();
    m = now.getUTCMonth() + 1;
    d = now.getUTCDate();
  }
  // Anchor at noon UTC on that civil date so getSunTimes day index is stable
  const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return getSunTimes(anchor, latitude, longitude);
}

export function formatTimeInZone(date: Date | null, timeZone: string): string {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(11, 16) + " UTC";
  }
}

/** Rough phase of day for protocol suggestions using local sun times. */
export function sunPhase(
  now: Date,
  sunrise: Date | null,
  sunset: Date | null,
): "night" | "sunrise" | "day" | "sunset" {
  if (!sunrise || !sunset) return "day";
  const t = now.getTime();
  const rise = sunrise.getTime();
  const set = sunset.getTime();
  const hourMs = 60 * 60 * 1000;
  if (t < rise - hourMs || t > set + hourMs) return "night";
  if (t >= rise - hourMs && t <= rise + 1.5 * hourMs) return "sunrise";
  if (t >= set - 1.5 * hourMs && t <= set + hourMs) return "sunset";
  return "day";
}
