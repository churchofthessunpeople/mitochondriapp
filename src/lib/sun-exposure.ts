/**
 * Daytime sun exposure — one catalog activity, logged into clock slots
 * (morning / noon / afternoon) with grounded + skin modifiers.
 *
 * UV-by-ZIP weighting is stubbed for later (place UV index).
 */

import type { TimeOfDay } from "@/db/schema";

export const SUN_EXPOSURE_PROTOCOL_ID = "sun-exposure";

/** Legacy catalog ids replaced by sun-exposure. */
export const SUN_EXPOSURE_LEGACY_IDS = [
  "morning-natural-light",
  "midday-sun-skin",
] as const;

export type SunExposureSlot = "morning" | "noon" | "afternoon";
export type SunSkinExposure = "full" | "partial" | "minimal";

export type SunExposureModifiers = {
  grounded: boolean;
  skin: SunSkinExposure;
};

export type SunExposureLogInput = SunExposureModifiers & {
  slot: SunExposureSlot;
  /** Local wall-clock HH:mm when the session started (optional UI). */
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

export const SUN_EXPOSURE_SLOTS: readonly SunExposureSlotDef[] = [
  {
    id: "morning",
    label: "Morning sun",
    clockLabel: "6–10 am",
    startHour: 6,
    endHour: 10,
    timeOfDay: "morning",
  },
  {
    id: "noon",
    label: "Noon sun",
    clockLabel: "10 am–2 pm",
    startHour: 10,
    endHour: 14,
    timeOfDay: "afternoon",
  },
  {
    id: "afternoon",
    label: "Afternoon sun",
    clockLabel: "2–6 pm",
    startHour: 14,
    endHour: 18,
    timeOfDay: "evening",
  },
] as const;

export const SUN_SKIN_OPTIONS: {
  id: SunSkinExposure;
  label: string;
  detail: string;
}[] = [
  {
    id: "full",
    label: "Lots of skin",
    detail: "Arms + legs or more outdoors",
  },
  {
    id: "partial",
    label: "Some skin",
    detail: "Face and forearms, or similar",
  },
  {
    id: "minimal",
    label: "Mostly covered",
    detail: "Eyes to sky; little skin UV",
  },
];

const SLOT_INDEX: Record<SunExposureSlot, number> = {
  morning: 0,
  noon: 1,
  afternoon: 2,
};

const SLOT_BY_INDEX: SunExposureSlot[] = ["morning", "noon", "afternoon"];

const SKIN_INDEX: Record<SunSkinExposure, number> = {
  full: 0,
  partial: 1,
  minimal: 2,
};

const SKIN_BY_INDEX: SunSkinExposure[] = ["full", "partial", "minimal"];

/** Pack slot + grounded + skin into variant_value (stable integer). */
export function encodeSunExposureVariant(input: SunExposureLogInput): number {
  const slot = SLOT_INDEX[input.slot] ?? 0;
  const skin = SKIN_INDEX[input.skin] ?? 0;
  const grounded = input.grounded ? 1 : 0;
  // bits 0–1 slot, bit 2 grounded, bits 3–4 skin
  return slot | (grounded << 2) | (skin << 3);
}

export function decodeSunExposureVariant(
  variantValue: unknown,
): SunExposureLogInput | null {
  if (typeof variantValue !== "number" || !Number.isFinite(variantValue)) {
    return null;
  }
  const v = Math.trunc(variantValue);
  const slot = SLOT_BY_INDEX[v & 0b11];
  const skin = SKIN_BY_INDEX[(v >> 3) & 0b11];
  if (!slot || !skin) return null;
  return {
    slot,
    grounded: ((v >> 2) & 1) === 1,
    skin,
  };
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

/** Map local hour (0–23) to a sun slot. Outside 6–18 → nearest edge. */
export function sunSlotFromLocalHour(hour: number): SunExposureSlot {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 6 && h < 10) return "morning";
  if (h >= 10 && h < 14) return "noon";
  if (h >= 14 && h < 18) return "afternoon";
  if (h < 6) return "morning";
  return "afternoon";
}

/** Parse HH:mm → slot. */
export function sunSlotFromLocalHm(hm: string): SunExposureSlot {
  const [hStr] = hm.split(":");
  const hour = Number(hStr);
  if (!Number.isFinite(hour)) return "noon";
  return sunSlotFromLocalHour(hour);
}

export function formatSunExposureLabel(
  variantValue: unknown,
  durationMinutes?: number | null,
): string | null {
  const decoded = decodeSunExposureVariant(variantValue);
  if (!decoded) return null;
  const def = sunExposureSlotDef(decoded.slot);
  const parts = [def.label];
  if (decoded.grounded) parts.push("grounded");
  if (decoded.skin === "full") parts.push("lots of skin");
  else if (decoded.skin === "partial") parts.push("some skin");
  else parts.push("covered");
  if (durationMinutes != null && durationMinutes > 0) {
    parts.push(`${durationMinutes} min`);
  }
  return parts.join(" · ");
}

/**
 * Quality multiplier on catalog base before duration scaling.
 * Full skin + grounded ≈ 1.0; covered / not grounded slightly less.
 */
export function sunExposureQualityMultiplier(
  modifiers: SunExposureModifiers,
): number {
  let m = 1;
  if (!modifiers.grounded) m *= 0.9;
  if (modifiers.skin === "partial") m *= 0.9;
  if (modifiers.skin === "minimal") m *= 0.75;
  return m;
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
  modifiers: SunExposureModifiers,
  opts?: { slot?: SunExposureSlot; uvIndex?: number | null },
): number {
  const quality = sunExposureQualityMultiplier(modifiers);
  const uv = sunExposureUvFactor({
    slot: opts?.slot ?? "noon",
    uvIndex: opts?.uvIndex,
  });
  return Math.max(1, Math.round(catalogBase * quality * uv));
}

export function remapSunExposureFavoriteId(protocolId: string): string {
  if (
    (SUN_EXPOSURE_LEGACY_IDS as readonly string[]).includes(protocolId)
  ) {
    return SUN_EXPOSURE_PROTOCOL_ID;
  }
  return protocolId;
}
