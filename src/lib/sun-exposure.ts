/**
 * Daytime sun exposure — logged into clock slots (morning / noon / afternoon)
 * with duration in 15-minute blocks. UV-by-ZIP weighting is stubbed for later.
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
  clockLabel: string;
  /** Inclusive local hour start */
  startHour: number;
  /** Exclusive local hour end */
  endHour: number;
  /** Completions.timeOfDay for this slot (enum has no noon yet) */
  timeOfDay: TimeOfDay;
};

/** Local noon boundary for the noon sun slot (12 pm). */
export const SUN_EXPOSURE_NOON_START_HM = "12:00";
/** Local start of the afternoon sun slot (4 pm). */
export const SUN_EXPOSURE_AFTERNOON_START_HM = "16:00";

export const SUN_EXPOSURE_SLOTS: readonly SunExposureSlotDef[] = [
  {
    id: "morning",
    label: "Morning sun",
    clockLabel: "Sunrise – 12 pm",
    startHour: 6,
    endHour: 12,
    timeOfDay: "morning",
  },
  {
    id: "noon",
    label: "Noon sun",
    clockLabel: "12 pm – 4 pm",
    startHour: 12,
    endHour: 16,
    timeOfDay: "afternoon",
  },
  {
    id: "afternoon",
    label: "Afternoon sun",
    clockLabel: "4 pm – sunset",
    startHour: 16,
    endHour: 18,
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

/** Human-readable window for a slot (uses place sunrise/sunset when available). */
export function sunExposureSlotClockLabel(
  slot: SunExposureSlot,
  sun?: SunTimes | null,
  timeZone = "UTC",
): string {
  const rise = shortDisplayTime(sunriseHmFromSun(sun, timeZone));
  const set = shortDisplayTime(sunsetHmFromSun(sun, timeZone));
  switch (slot) {
    case "morning":
      return `${rise} – 12 pm`;
    case "noon":
      return "12 pm – 4 pm";
    case "afternoon":
      return `4 pm – ${set}`;
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

/** Parse HH:mm → slot using sunrise–12, 12–4, 4–sunset windows. */
export function sunSlotFromLocalHm(
  hm: string,
  ctx?: SunExposureSlotContext,
): SunExposureSlot {
  const mins = hmToMinutes(hm);
  if (mins == null) return "noon";

  const tz = ctx?.timeZone ?? "UTC";
  const noonStart = hmToMinutes(SUN_EXPOSURE_NOON_START_HM)!;
  const afternoonStart = hmToMinutes(SUN_EXPOSURE_AFTERNOON_START_HM)!;
  const sunriseMins = hmToMinutes(sunriseHmFromSun(ctx?.sun, tz))!;
  const sunsetMins = hmToMinutes(sunsetHmFromSun(ctx?.sun, tz))!;

  if (mins >= sunriseMins && mins < noonStart) return "morning";
  if (mins >= noonStart && mins < afternoonStart) return "noon";
  if (mins >= afternoonStart && mins < sunsetMins) return "afternoon";
  if (mins < sunriseMins) return "morning";
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
