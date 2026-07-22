/**
 * Movement / exercise logs — where the session happened (sunlight, outside, indoors).
 * Stored per completion in variant_value.
 */

import { PROTOCOL_SEEDS } from "@/db/seed-data";
import type { Protocol } from "@/db/schema";

export type MovementSetting = "full_sunlight" | "outside" | "indoors";

export const MOVEMENT_SETTING_OPTIONS: {
  id: MovementSetting;
  label: string;
  detail: string;
}[] = [
  {
    id: "full_sunlight",
    label: "Full sunlight",
    detail: "Direct sun on skin — best daylight stack",
  },
  {
    id: "outside",
    label: "Outside",
    detail: "Outdoor air — shade, clouds, or indirect daylight",
  },
  {
    id: "indoors",
    label: "Indoors",
    detail: "Gym, home, or rebounder indoors",
  },
];

const SETTING_INDEX: Record<MovementSetting, number> = {
  full_sunlight: 0,
  outside: 1,
  indoors: 2,
};

const SETTING_BY_INDEX: MovementSetting[] = [
  "full_sunlight",
  "outside",
  "indoors",
];

/** Base-point multiplier per 15-min block (catalog base). */
const BASE_MULTIPLIER: Record<MovementSetting, number> = {
  full_sunlight: 1,
  outside: 0.85,
  indoors: 0.7,
};

/**
 * Not logged via the old sunlight/outside/indoors picker:
 * - mastic-gum: jaw work, not cardio/strength place
 * - exercise (+ retired parents): dedicated Exercise dialog
 */
const MOVEMENT_SETTING_EXCLUDED_IDS = new Set([
  "mastic-gum",
  "exercise",
  "morning-movement",
  "rebounding",
]);

export function requiresMovementSetting(protocol: {
  id?: string;
  category: string;
  durationEnabled: boolean;
}): boolean {
  if (protocol.id && MOVEMENT_SETTING_EXCLUDED_IDS.has(protocol.id)) {
    return false;
  }
  return protocol.category === "movement" && protocol.durationEnabled;
}

export function encodeMovementSettingVariant(setting: MovementSetting): number {
  return SETTING_INDEX[setting] ?? 0;
}

export function decodeMovementSettingVariant(
  variantValue: unknown,
): MovementSetting | null {
  if (typeof variantValue !== "number" || !Number.isFinite(variantValue)) {
    return null;
  }
  const v = Math.trunc(variantValue);
  if (v < 0 || v > 2) return null;
  return SETTING_BY_INDEX[v] ?? null;
}

export function parseMovementSetting(value: unknown): MovementSetting {
  const decoded = decodeMovementSettingVariant(value);
  if (decoded) return decoded;
  if (typeof value === "string") {
    if (
      (MOVEMENT_SETTING_OPTIONS as { id: string }[]).some((o) => o.id === value)
    ) {
      return value as MovementSetting;
    }
  }
  return "outside";
}

export function movementSettingBasePoints(
  setting: MovementSetting,
  catalogBase: number,
): number {
  const mult = BASE_MULTIPLIER[setting] ?? 1;
  return Math.max(1, Math.round(catalogBase * mult));
}

export function formatMovementSettingLabel(
  variantValue: unknown,
): string | null {
  const setting = decodeMovementSettingVariant(variantValue);
  if (!setting) return null;
  const opt = MOVEMENT_SETTING_OPTIONS.find((o) => o.id === setting);
  return opt?.label ?? setting;
}

export function isMovementSettingProtocol(protocol: Protocol): boolean {
  return requiresMovementSetting(protocol);
}

export function isMovementSettingProtocolId(protocolId: string): boolean {
  const seed = PROTOCOL_SEEDS.find((s) => s.id === protocolId);
  return seed != null && requiresMovementSetting(seed);
}
