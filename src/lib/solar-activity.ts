/**
 * Recent solar flare and geomagnetic activity from NOAA SWPC public feeds.
 * Parsing and summary only, so the client can share types and labels.
 * Educational context — not an official space-weather warning service.
 */

export type SolarFlare = {
  /** GOES class at peak, e.g. "M1.2" or "X2.1" */
  flareClass: string;
  /** Peak 0.1–0.8 nm X-ray flux, W/m² */
  peakFlux: number;
  beginTime: string | null;
  peakTime: string;
  endTime: string | null;
  ongoing: boolean;
};

export type SolarKp = {
  value: number;
  time: string;
};

export type SolarActivity = {
  generatedAt: string;
  /** Largest X-class flare in the alert window, if any */
  alertFlare: SolarFlare | null;
  largestFlare24h: SolarFlare | null;
  largestFlare7d: SolarFlare | null;
  /** M- and X-class flares in the past 7 days */
  significantFlareCount7d: number;
  kp: SolarKp | null;
  maxKp24h: number | null;
};

/** X1 — NOAA R3 "Strong" radio blackout and above. */
export const LARGE_FLARE_MIN_FLUX = 1e-4;
const SIGNIFICANT_FLARE_MIN_FLUX = 1e-5;
const HOUR_MS = 60 * 60 * 1000;
const ALERT_WINDOW_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * 24 * HOUR_MS;

const CLASS_BASE_FLUX: Record<string, number> = {
  A: 1e-8,
  B: 1e-7,
  C: 1e-6,
  M: 1e-5,
  X: 1e-4,
};

export function flareClassToFlux(flareClass: string): number | null {
  const match = flareClass
    .trim()
    .toUpperCase()
    .match(/^([ABCMX])(\d+(?:\.\d+)?)?$/);
  if (!match) return null;
  return CLASS_BASE_FLUX[match[1]] * Number(match[2] ?? 1);
}

export function radioBlackoutLevel(
  peakFlux: number,
): { scale: string; label: string } | null {
  if (peakFlux >= 2e-3) return { scale: "R5", label: "Extreme" };
  if (peakFlux >= 1e-3) return { scale: "R4", label: "Severe" };
  if (peakFlux >= 1e-4) return { scale: "R3", label: "Strong" };
  if (peakFlux >= 5e-5) return { scale: "R2", label: "Moderate" };
  if (peakFlux >= 1e-5) return { scale: "R1", label: "Minor" };
  return null;
}

export function kpLabel(kp: number): string {
  const level = Math.round(kp);
  if (level >= 9) return "G5 extreme storm";
  if (level >= 8) return "G4 severe storm";
  if (level >= 7) return "G3 strong storm";
  if (level >= 6) return "G2 moderate storm";
  if (level >= 5) return "G1 minor storm";
  if (level >= 4) return "Active";
  return "Quiet";
}

/** SWPC timestamps sometimes omit the UTC suffix. */
function toIso(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function parseFlares(raw: unknown): SolarFlare[] {
  if (!Array.isArray(raw)) return [];
  const flares: SolarFlare[] = [];

  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const peakTime = toIso(record.max_time);
    const flareClass =
      typeof record.max_class === "string" ? record.max_class.trim() : "";
    if (!peakTime || !flareClass) continue;

    const measured = record.max_xrlong;
    const peakFlux =
      typeof measured === "number" && measured > 0
        ? measured
        : flareClassToFlux(flareClass);
    if (peakFlux == null) continue;

    const endTime = toIso(record.end_time);
    flares.push({
      flareClass,
      peakFlux,
      beginTime: toIso(record.begin_time),
      peakTime,
      endTime,
      ongoing: endTime == null,
    });
  }

  return flares;
}

/** Accepts both the object-row and the older header-plus-array-row Kp formats. */
export function parseKp(raw: unknown): SolarKp[] {
  if (!Array.isArray(raw)) return [];
  const readings: SolarKp[] = [];

  for (const row of raw) {
    let time: string | null = null;
    let value: number | null = null;

    if (Array.isArray(row)) {
      time = toIso(row[0]);
      value = Number(row[1]);
    } else if (typeof row === "object" && row !== null) {
      const record = row as Record<string, unknown>;
      time = toIso(record.time_tag);
      value = Number(record.Kp ?? record.kp);
    }

    if (time && value != null && Number.isFinite(value)) {
      readings.push({ time, value });
    }
  }

  return readings.sort((a, b) => a.time.localeCompare(b.time));
}

function largestFlare(flares: SolarFlare[]): SolarFlare | null {
  return flares.reduce<SolarFlare | null>(
    (best, flare) => (!best || flare.peakFlux > best.peakFlux ? flare : best),
    null,
  );
}

/** The latest-flare feed repeats events already in the 7-day list. */
function dedupeFlares(flares: SolarFlare[]): SolarFlare[] {
  const byEvent = new Map<string, SolarFlare>();
  for (const flare of flares) {
    const key = flare.beginTime ?? flare.peakTime;
    const existing = byEvent.get(key);
    if (
      !existing ||
      flare.peakFlux > existing.peakFlux ||
      (flare.peakFlux === existing.peakFlux && !flare.ongoing)
    ) {
      byEvent.set(key, flare);
    }
  }
  return [...byEvent.values()];
}

export function summarizeSolarActivity(opts: {
  flares: SolarFlare[];
  kp: SolarKp[];
  now: Date;
}): SolarActivity {
  const nowMs = opts.now.getTime();
  const ageMs = (iso: string) => nowMs - new Date(iso).getTime();

  const flares = dedupeFlares(opts.flares);
  const week = flares.filter((flare) => ageMs(flare.peakTime) <= WEEK_MS);
  const day = week.filter((flare) => ageMs(flare.peakTime) <= ALERT_WINDOW_MS);
  const largestFlare24h = largestFlare(day);

  const kpDay = opts.kp.filter((reading) => ageMs(reading.time) <= ALERT_WINDOW_MS);

  return {
    generatedAt: opts.now.toISOString(),
    alertFlare:
      largestFlare24h && largestFlare24h.peakFlux >= LARGE_FLARE_MIN_FLUX
        ? largestFlare24h
        : null,
    largestFlare24h,
    largestFlare7d: largestFlare(week),
    significantFlareCount7d: week.filter(
      (flare) => flare.peakFlux >= SIGNIFICANT_FLARE_MIN_FLUX,
    ).length,
    kp: opts.kp.at(-1) ?? null,
    maxKp24h: kpDay.length
      ? Math.max(...kpDay.map((reading) => reading.value))
      : null,
  };
}

export function isSolarActivity(value: unknown): value is SolarActivity {
  return (
    typeof value === "object" &&
    value !== null &&
    "generatedAt" in value &&
    typeof value.generatedAt === "string" &&
    "significantFlareCount7d" in value &&
    typeof value.significantFlareCount7d === "number"
  );
}
