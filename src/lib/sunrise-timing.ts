import { formatTimeInZone, type SunTimes } from "@/lib/sun";

export const SUNRISE_OPTIMAL_WINDOW_MINUTES = 15;

function asDate(date: Date | string | null | undefined): Date | null {
  if (date == null) return null;
  if (date instanceof Date) return date;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Signed minutes from official sunrise (negative = before). */
export function minutesFromSunrise(
  viewedAt: Date,
  sunrise: Date,
): number {
  return Math.round((viewedAt.getTime() - sunrise.getTime()) / 60_000);
}

export function minutesBeyondOptimalWindow(offsetMinutes: number): number {
  return Math.max(
    0,
    Math.abs(offsetMinutes) - SUNRISE_OPTIMAL_WINDOW_MINUTES,
  );
}

export function isInSunriseOptimalWindow(offsetMinutes: number): boolean {
  return minutesBeyondOptimalWindow(offsetMinutes) === 0;
}

/** Full catalog base points inside ±15 min; −1 pt per minute outside (min 1). */
export function pointsForSunriseViewTiming(
  basePoints: number,
  offsetMinutes: number | null | undefined,
): number {
  if (offsetMinutes == null) return basePoints;
  const beyond = minutesBeyondOptimalWindow(offsetMinutes);
  return Math.max(1, basePoints - beyond);
}

/** Session scoring: max penalty from start or end vs ±15 min sunrise window. */
export function pointsForSunriseSessionTiming(
  basePoints: number,
  startOffset: number | null | undefined,
  endOffset?: number | null | undefined,
): number {
  if (startOffset == null) return basePoints;
  if (endOffset == null) {
    return pointsForSunriseViewTiming(basePoints, startOffset);
  }
  const beyond = Math.max(
    minutesBeyondOptimalWindow(startOffset),
    minutesBeyondOptimalWindow(endOffset),
  );
  return Math.max(1, basePoints - beyond);
}

export function isSunriseSessionOptimal(
  startOffset: number,
  endOffset: number,
): boolean {
  return (
    minutesBeyondOptimalWindow(startOffset) === 0 &&
    minutesBeyondOptimalWindow(endOffset) === 0
  );
}

function formatShortSunriseOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "at sunrise";
  const abs = Math.abs(offsetMinutes);
  const dir = offsetMinutes < 0 ? "before" : "after";
  return `${abs} min ${dir}`;
}

/** Offset-based session label for history when clock times are unavailable. */
export function formatSunriseSessionOffsetMinutes(
  startOffset: number,
  endOffset: number,
): string {
  const range = `${formatShortSunriseOffset(startOffset)} – ${formatShortSunriseOffset(endOffset)}`;
  if (isSunriseSessionOptimal(startOffset, endOffset)) {
    return `${range} (optimal)`;
  }
  const beyond = Math.max(
    minutesBeyondOptimalWindow(startOffset),
    minutesBeyondOptimalWindow(endOffset),
  );
  return `${range} (${beyond} min outside optimal)`;
}

export function formatSunriseSessionHm(
  startOffset: number,
  endOffset: number,
  sunrise: Date,
  timeZone: string,
): string {
  const start = new Date(sunrise.getTime() + startOffset * 60_000);
  const end = new Date(sunrise.getTime() + endOffset * 60_000);
  return `${formatTimeInZone(start, timeZone)} – ${formatTimeInZone(end, timeZone)}`;
}

/** Local HH:mm for start/end of the ±15 min optimal window. */
export function optimalWindowHm(
  sunrise: Date | string,
  timeZone: string,
): { startHm: string; endHm: string } {
  const rise = asDate(sunrise);
  if (!rise) throw new Error("Invalid sunrise");
  const start = new Date(
    rise.getTime() - SUNRISE_OPTIMAL_WINDOW_MINUTES * 60_000,
  );
  const end = new Date(
    rise.getTime() + SUNRISE_OPTIMAL_WINDOW_MINUTES * 60_000,
  );
  return {
    startHm: currentLocalHm(timeZone, start),
    endHm: currentLocalHm(timeZone, end),
  };
}

export function formatSunriseWindow(
  sunrise: Date | string | null,
  timeZone: string,
): string | null {
  const rise = asDate(sunrise);
  if (!rise) return null;
  const start = new Date(
    rise.getTime() - SUNRISE_OPTIMAL_WINDOW_MINUTES * 60_000,
  );
  const end = new Date(
    rise.getTime() + SUNRISE_OPTIMAL_WINDOW_MINUTES * 60_000,
  );
  return `${formatTimeInZone(start, timeZone)} – ${formatTimeInZone(end, timeZone)}`;
}

export function formatSunriseOffsetMinutes(offsetMinutes: number): string {
  const beyond = minutesBeyondOptimalWindow(offsetMinutes);
  if (beyond === 0) {
    if (offsetMinutes === 0) return "at sunrise (optimal)";
    if (offsetMinutes < 0) {
      return `${Math.abs(offsetMinutes)} min before sunrise (optimal)`;
    }
    return `${offsetMinutes} min after sunrise (optimal)`;
  }
  const dir = offsetMinutes < 0 ? "before" : "after";
  return `${Math.abs(offsetMinutes)} min ${dir} sunrise (${beyond} min outside optimal)`;
}

/** Local HH:mm for a timezone. */
export function currentLocalHm(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h}:${m}`;
}

/** UTC instant for local HH:mm on a civil date in an IANA timezone. */
export function viewedAtFromLocalHm(
  dateIso: string,
  hm: string,
  timeZone: string,
): Date {
  const m = hm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) throw new Error("Invalid time");
  const targetH = Number(m[1]);
  const targetM = Number(m[2]);
  const [y, mo, d] = dateIso.split("-").map(Number) as [number, number, number];

  const dayStart = Date.UTC(y, mo - 1, d, 0, 0, 0);
  for (let t = dayStart; t < dayStart + 48 * 3_600_000; t += 60_000) {
    const dt = new Date(t);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(dt);
    const get = (type: string) => parts.find((p) => p.type === type)?.value;
    if (
      Number(get("year")) === y &&
      Number(get("month")) === mo &&
      Number(get("day")) === d &&
      Number(get("hour")) === targetH &&
      Number(get("minute")) === targetM
    ) {
      return dt;
    }
  }
  throw new Error("Could not resolve local time");
}

export function computeSunriseViewOffset(
  dateIso: string,
  viewedHm: string,
  timeZone: string,
  sunrise: Date | string | null,
): number | null {
  const rise = asDate(sunrise);
  if (!rise) return null;
  const viewedAt = viewedAtFromLocalHm(dateIso, viewedHm, timeZone);
  return minutesFromSunrise(viewedAt, rise);
}

export type UserSunriseContext = {
  sunrise: Date;
  timeZone: string;
  sun: SunTimes;
};

export function resolveSunriseViewOffset(
  _dateIso: string,
  viewedAtIso: string | undefined,
  ctx: UserSunriseContext | null,
): number {
  if (!ctx) return 0;
  const viewedAt = viewedAtIso ? new Date(viewedAtIso) : new Date();
  if (Number.isNaN(viewedAt.getTime())) return 0;
  return minutesFromSunrise(viewedAt, ctx.sunrise);
}

export function computeSunriseSessionOffsets(
  dateIso: string,
  startHm: string,
  endHm: string,
  timeZone: string,
  sunrise: Date | string | null,
): { startOffset: number; endOffset: number } | null {
  const rise = asDate(sunrise);
  if (!rise) return null;
  const startAt = viewedAtFromLocalHm(dateIso, startHm, timeZone);
  const endAt = viewedAtFromLocalHm(dateIso, endHm, timeZone);
  return {
    startOffset: minutesFromSunrise(startAt, rise),
    endOffset: minutesFromSunrise(endAt, rise),
  };
}

export function resolveSunriseSessionOffsets(
  _dateIso: string,
  startIso: string | undefined,
  endIso: string | undefined,
  ctx: UserSunriseContext | null,
): { startOffset: number; endOffset: number } {
  if (!ctx) return { startOffset: 0, endOffset: 0 };
  const startAt = startIso ? new Date(startIso) : new Date();
  const endAt = endIso ? new Date(endIso) : startAt;
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { startOffset: 0, endOffset: 0 };
  }
  return {
    startOffset: minutesFromSunrise(startAt, ctx.sunrise),
    endOffset: minutesFromSunrise(endAt, ctx.sunrise),
  };
}
