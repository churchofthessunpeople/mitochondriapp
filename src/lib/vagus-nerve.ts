/**
 * Vagus nerve stimulation — cold face immersion, baking soda water,
 * castor oil navel, and tuning forks as flat-point modes.
 *
 * Labels / points can be overridden via content/activities.json `options`.
 */

import type { ActivityModeOption } from "@/lib/protocol-meta";

export const VAGUS_NERVE_PROTOCOL_ID = "vagus-nerve-stimulation";

/** Retired into Vagus nerve stimulation. */
export const VAGUS_NERVE_LEGACY_IDS = [
  "castor-oil-navel",
  "baking-soda-water",
  "cold-face-plunge",
  "tuning-forks",
] as const;

export type VagusMode =
  | "cold_face_immersion"
  | "baking_soda_water"
  | "castor_oil_navel"
  | "tuning_forks";

export const VAGUS_MODE_OPTIONS: {
  id: VagusMode;
  label: string;
  detail: string;
  points: number;
}[] = [
  {
    id: "cold_face_immersion",
    label: "Cold face immersion",
    detail: "3 rounds of cold water on face or brief head immersion",
    points: 5,
  },
  {
    id: "baking_soda_water",
    label: "Baking soda water",
    detail: "¼ tsp sodium bicarbonate in a glass — ≥2 h from meals",
    points: 4,
  },
  {
    id: "castor_oil_navel",
    label: "Castor oil navel",
    detail: "Organic cold-pressed castor oil drops in the belly button",
    points: 6,
  },
  {
    id: "tuning_forks",
    label: "Tuning forks",
    detail: "40 Hz / C128 metal forks — parasympathetic bone-contact circuit",
    points: 5,
  },
];

const MODE_INDEX: Record<VagusMode, number> = {
  cold_face_immersion: 0,
  baking_soda_water: 1,
  castor_oil_navel: 2,
  tuning_forks: 3,
};

const MODE_BY_INDEX: VagusMode[] = [
  "cold_face_immersion",
  "baking_soda_water",
  "castor_oil_navel",
  "tuning_forks",
];

export function isVagusNerveProtocolId(id: string): boolean {
  return id === VAGUS_NERVE_PROTOCOL_ID;
}

export function encodeVagusVariant(mode: VagusMode): number {
  return MODE_INDEX[mode] ?? 0;
}

export function decodeVagusVariant(variantValue: unknown): VagusMode | null {
  if (typeof variantValue !== "number" || !Number.isFinite(variantValue)) {
    return null;
  }
  const v = Math.trunc(variantValue);
  if (v < 0 || v > MODE_BY_INDEX.length - 1) return null;
  return MODE_BY_INDEX[v] ?? null;
}

export function parseVagusMode(value: unknown): VagusMode {
  const decoded = decodeVagusVariant(value);
  if (decoded) return decoded;
  if (typeof value === "string") {
    if ((VAGUS_MODE_OPTIONS as { id: string }[]).some((o) => o.id === value)) {
      return value as VagusMode;
    }
  }
  return "cold_face_immersion";
}

/** Merge content overlay options onto built-in modes (ids stay fixed). */
export function resolveVagusOptions(
  options?: ActivityModeOption[] | null,
): typeof VAGUS_MODE_OPTIONS {
  if (!options?.length) return VAGUS_MODE_OPTIONS;
  const byId = new Map(options.map((o) => [o.id, o]));
  return VAGUS_MODE_OPTIONS.map((def) => {
    const o = byId.get(def.id);
    if (!o) return def;
    return {
      id: def.id,
      label: o.label?.trim() || def.label,
      detail: o.detail?.trim() || def.detail,
      points:
        typeof o.points === "number" && Number.isFinite(o.points)
          ? o.points
          : def.points,
    };
  });
}

export function vagusModePoints(
  mode: VagusMode,
  options?: ActivityModeOption[] | null,
): number {
  return resolveVagusOptions(options).find((o) => o.id === mode)?.points ?? 5;
}

export function vagusModeLabel(
  mode: VagusMode,
  options?: ActivityModeOption[] | null,
): string {
  return resolveVagusOptions(options).find((o) => o.id === mode)?.label ?? mode;
}

export function formatVagusLabel(
  variantValue: unknown,
  options?: ActivityModeOption[] | null,
): string | null {
  const mode = decodeVagusVariant(variantValue);
  if (!mode) return null;
  return `${vagusModeLabel(mode, options)} · ${vagusModePoints(mode, options)} pts`;
}

export function remapVagusFavoriteId(id: string): string {
  if ((VAGUS_NERVE_LEGACY_IDS as readonly string[]).includes(id)) {
    return VAGUS_NERVE_PROTOCOL_ID;
  }
  return id;
}
