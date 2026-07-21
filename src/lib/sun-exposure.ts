/**
 * Daytime sun exposure — logged into solar-relative slots
 * (morning / solar noon / afternoon) with duration in 15-minute blocks.
 * UV-by-ZIP weighting is stubbed for later.
 */

import type { TimeOfDay } from "@/db/schema";
import { formatTimeInZone, type SunTimes } from "@/lib/sun";
import { displayTimeToHm } from "@/lib/time-hm";

export const SUN_EXPOSURE_PROTOCOL_ID = "sun-exposure";

/** Legacy catalog ids replaced by sun-exposure. */
export const SUN_EXPOSURE_LEGACY_IDS = [
  "morning-natural-light",
  "midday-sun-skin",
] as const;

export type SunExposureSlot = "morning" | "noon" | "afternoon";

export type SunExposureLogInput = {
  slot: SunExposureSlot;
  /** Local wall-clock HH:mm when the session started (optional, for future UV). */
  startHm?: string;
};

export type SunExposureSlotDef = {
  id: SunExposureSlot;
  label: string;
  /** Static fallback when Place sun times are unavailable */
  clockLabel: string;
  /** Completions.timeOfDay for this slot (enum has no noon yet) */
  timeOfDay: TimeOfDay;
};

/** Minutes before solar noon that the solar-noon slot begins. */
export const SUN_EXPOSURE_NOON_LEAD_MINUTES = 60;
/** Minutes after solar noon that the solar-noon slot ends. */
export const SUN_EXPOSURE_NOON_TRAIL_MINUTES = 120;

/** Fallback solar noon when Place sun times are missing. */
export const SUN_EXPOSURE_FALLBACK_SOLAR_NOON_HM = "12:00";

export const SUN_EXPOSURE_SLOTS: readonly SunExposureSlotDef[] = [
  {
    id: "morning",
    label: "Morning sun",
    clockLabel: "Sunrise – 1h before solar noon",
    timeOfDay: "morning",
  },
  {
    id: "noon",
    label: "Solar noon",
    clockLabel: "1h before – 2h after solar noon",
    timeOfDay: "afternoon",
  },
  {
    id: "afternoon",
    label: "Afternoon sun",
    clockLabel: "2h after solar noon – sunset",
    timeOfDay: "evening",
  },
] as const;

const SLOT_INDEX: Record<SunExposureSlot, number> = {
  morning: 0,
  noon: 1,
  afternoon: 2,
};

const SLOT_BY_INDEX: SunExposureSlot[] = ["morning", "noon", "afternoon"];

/** Pack slot into variant_value (legacy logs may carry extra modifier bits). */
export function encodeSunExposureVariant(input: SunExposureLogInput): number {
  return SLOT_INDEX[input.slot] ?? 0;
}

export function decodeSunExposureVariant(
  variantValue: unknown,
): SunExposureLogInput | null {
  if (typeof variantValue !== "number" || !Number.isFinite(variantValue)) {
    return null;
  }
  const slot = SLOT_BY_INDEX[Math.trunc(variantValue) & 0b11];
  if (!slot) return null;
  return { slot };
}

export function isSunExposureProtocolId(
  protocolId: string | null | undefined,
): boolean {
  return protocolId === SUN_EXPOSURE_PROTOCOL_ID;
}

export function sunExposureSlotDef(
  slot: SunExposureSlot,
): SunExposureSlotDef {
  return SUN_EXPOSURE_SLOTS.find((s) => s.id === slot) ?? SUN_EXPOSURE_SLOTS[0]!;
}

export function timeOfDayForSunSlot(slot: SunExposureSlot): TimeOfDay {
  return sunExposureSlotDef(slot).timeOfDay;
}

function hmToMinutes(hm: string): number | null {
  const m = hm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function minutesToHm(totalMins: number): string {
  const wrapped = ((Math.round(totalMins) % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function shortDisplayTime(hm: string): string {
  const mins = hmToMinutes(hm);
  if (mins == null) return hm;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m === 0
    ? `${h12} ${ap}`
    : `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

export function sunriseHmFromSun(
  sun: SunTimes | null | undefined,
  timeZone: string,
): string {
  if (!sun?.sunrise) return "06:00";
  return displayTimeToHm(formatTimeInZone(sun.sunrise, timeZone)) ?? "06:00";
}

export function sunsetHmFromSun(
  sun: SunTimes | null | undefined,
  timeZone: string,
): string {
  if (!sun?.sunset) return "18:00";
  return displayTimeToHm(formatTimeInZone(sun.sunset, timeZone)) ?? "18:00";
}

export function solarNoonHmFromSun(
  sun: SunTimes | null | undefined,
  timeZone: string,
): string {
  if (!sun?.solarNoon) return SUN_EXPOSURE_FALLBACK_SOLAR_NOON_HM;
  return (
    displayTimeToHm(formatTimeInZone(sun.solarNoon, timeZone)) ??
    SUN_EXPOSURE_FALLBACK_SOLAR_NOON_HM
  );
}

export type SunExposureSlotBounds = {
  sunriseMins: number;
  sunsetMins: number;
  solarNoonMins: number;
  /** Start of solar-noon slot (1h before solar noon). */
  noonStartMins: number;
  /** End of solar-noon slot / start of afternoon (2h after solar noon). */
  noonEndMins: number;
};

/** Local-minute bounds for today's sun-exposure slots. */
export function sunExposureSlotBounds(
  sun?: SunTimes | null,
  timeZone = "UTC",
): SunExposureSlotBounds {
  const sunriseMins = hmToMinutes(sunriseHmFromSun(sun, timeZone))!;
  const sunsetMins = hmToMinutes(sunsetHmFromSun(sun, timeZone))!;
  const solarNoonMins = hmToMinutes(solarNoonHmFromSun(sun, timeZone))!;
  return {
    sunriseMins,
    sunsetMins,
    solarNoonMins,
    noonStartMins: solarNoonMins - SUN_EXPOSURE_NOON_LEAD_MINUTES,
    noonEndMins: solarNoonMins + SUN_EXPOSURE_NOON_TRAIL_MINUTES,
  };
}

/** Human-readable window for a slot (uses place sunrise / solar noon / sunset). */
export function sunExposureSlotClockLabel(
  slot: SunExposureSlot,
  sun?: SunTimes | null,
  timeZone = "UTC",
): string {
  const b = sunExposureSlotBounds(sun, timeZone);
  const rise = shortDisplayTime(minutesToHm(b.sunriseMins));
  const set = shortDisplayTime(minutesToHm(b.sunsetMins));
  const noonStart = shortDisplayTime(minutesToHm(b.noonStartMins));
  const noonEnd = shortDisplayTime(minutesToHm(b.noonEndMins));
  switch (slot) {
    case "morning":
      return `${rise} – ${noonStart}`;
    case "noon":
      return `${noonStart} – ${noonEnd}`;
    case "afternoon":
      return `${noonEnd} – ${set}`;
  }
}

export type SunExposureSlotContext = {
  sun?: SunTimes | null;
  timeZone?: string;
};

/** Map local hour (0–23) to a sun slot. Outside daylight → nearest edge. */
export function sunSlotFromLocalHour(
  hour: number,
  ctx?: SunExposureSlotContext,
): SunExposureSlot {
  const h = ((hour % 24) + 24) % 24;
  const hm = `${String(h).padStart(2, "0")}:00`;
  return sunSlotFromLocalHm(hm, ctx);
}

/**
 * Parse HH:mm → slot using solar-relative windows:
 * morning = sunrise → 1h before solar noon
 * noon = 1h before → 2h after solar noon
 * afternoon = 2h after solar noon → sunset
 */
export function sunSlotFromLocalHm(
  hm: string,
  ctx?: SunExposureSlotContext,
): SunExposureSlot {
  const mins = hmToMinutes(hm);
  if (mins == null) return "noon";

  const tz = ctx?.timeZone ?? "UTC";
  const b = sunExposureSlotBounds(ctx?.sun, tz);

  if (mins >= b.sunriseMins && mins < b.noonStartMins) return "morning";
  if (mins >= b.noonStartMins && mins < b.noonEndMins) return "noon";
  if (mins >= b.noonEndMins && mins < b.sunsetMins) return "afternoon";
  if (mins < b.sunriseMins) return "morning";
  return "afternoon";
}

export function formatSunExposureLabel(
  variantValue: unknown,
  durationMinutes?: number | null,
): string | null {
  const decoded = decodeSunExposureVariant(variantValue);
  if (!decoded) return null;
  const def = sunExposureSlotDef(decoded.slot);
  const parts = [def.label];
  if (durationMinutes != null && durationMinutes > 0) {
    parts.push(`${durationMinutes} min`);
  }
  return parts.join(" · ");
}

/**
 * Future: scale points by place UV index for the slot.
 * Stub returns 1 until ZIP UV rating is wired into Place.
 */
export function sunExposureUvFactor(_opts: {
  slot: SunExposureSlot;
  /** Clear-sky or forecast UV index at place (optional) */
  uvIndex?: number | null;
}): number {
  void _opts;
  return 1;
}

/** Effective base points for one sun-exposure log (before duration blocks). */
export function sunExposureBasePoints(
  catalogBase: number,
  opts?: { slot?: SunExposureSlot; uvIndex?: number | null },
): number {
  const uv = sunExposureUvFactor({
    slot: opts?.slot ?? "noon",
    uvIndex: opts?.uvIndex,
  });
  return Math.max(1, Math.round(catalogBase * uv));
}

export function remapSunExposureFavoriteId(protocolId: string): string {
  if (
    (SUN_EXPOSURE_LEGACY_IDS as readonly string[]).includes(protocolId)
  ) {
    return SUN_EXPOSURE_PROTOCOL_ID;
  }
  return protocolId;
}
