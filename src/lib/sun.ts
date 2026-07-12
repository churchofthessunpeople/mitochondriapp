/**
 * Approximate sunrise/sunset (UTC) for a lat/lng on a civil day.
 * Algorithm adapted from NOAA-style solar position equations (good enough for lifestyle UX).
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

/**
 * @param date any Date in the target local calendar day (noon UTC of that Y-M-D is fine)
 * @param latitude degrees
 * @param longitude degrees (east positive)
 */
export function getSunTimes(
  date: Date,
  latitude: number,
  longitude: number,
): SunTimes {
  const lw = rad(-longitude);
  const phi = rad(latitude);

  // Use noon UTC of the given UTC date parts to stabilize day
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const day = new Date(Date.UTC(y, m, d, 12, 0, 0));
  const J = toJulian(day);
  const n = Math.round(J - 2451545 - 0.0009 - longitude / 360);
  const Jstar = 2451545.0009 + longitude / 360 + n;
  const M = (357.5291 + 0.98560028 * (Jstar - 2451545)) % 360;
  const C =
    1.9148 * Math.sin(rad(M)) +
    0.02 * Math.sin(rad(2 * M)) +
    0.0003 * Math.sin(rad(3 * M));
  const lambda = (M + 102.9372 + C + 180) % 360;
  const Jtransit = Jstar + 0.0053 * Math.sin(rad(M)) - 0.0069 * Math.sin(rad(2 * lambda));
  const delta = Math.asin(Math.sin(rad(lambda)) * Math.sin(rad(23.44)));
  const cosH =
    (Math.sin(rad(-0.83)) - Math.sin(phi) * Math.sin(delta)) /
    (Math.cos(phi) * Math.cos(delta));

  if (cosH > 1) {
    return { sunrise: null, sunset: null, solarNoon: fromJulian(Jtransit), dayLengthHours: 0 };
  }
  if (cosH < -1) {
    return {
      sunrise: null,
      sunset: null,
      solarNoon: fromJulian(Jtransit),
      dayLengthHours: 24,
    };
  }

  const w0 = Math.acos(cosH);
  const Jrise = Jtransit - deg(w0) / 360;
  const Jset = Jtransit + deg(w0) / 360;
  const sunrise = fromJulian(Jrise);
  const sunset = fromJulian(Jset);
  const dayLengthHours = (Jset - Jrise) * 24;

  return { sunrise, sunset, solarNoon: fromJulian(Jtransit), dayLengthHours };
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
