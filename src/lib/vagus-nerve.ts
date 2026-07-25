/**
 * Vagus nerve stimulation — baking soda water, cold face immersion,
 * and castor oil navel as flat-point modes.
 */

export const VAGUS_NERVE_PROTOCOL_ID = "vagus-nerve-stimulation";

/** Retired into Vagus nerve stimulation. */
export const VAGUS_NERVE_LEGACY_IDS = [
  "castor-oil-navel",
  "baking-soda-water",
  "cold-face-plunge",
] as const;

export type VagusMode =
  | "cold_face_immersion"
  | "baking_soda_water"
  | "castor_oil_navel";

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
];

const MODE_INDEX: Record<VagusMode, number> = {
  cold_face_immersion: 0,
  baking_soda_water: 1,
  castor_oil_navel: 2,
};

const MODE_BY_INDEX: VagusMode[] = [
  "cold_face_immersion",
  "baking_soda_water",
  "castor_oil_navel",
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
  if (v < 0 || v > 2) return null;
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

export function vagusModePoints(mode: VagusMode): number {
  return VAGUS_MODE_OPTIONS.find((o) => o.id === mode)?.points ?? 5;
}

export function vagusModeLabel(mode: VagusMode): string {
  return VAGUS_MODE_OPTIONS.find((o) => o.id === mode)?.label ?? mode;
}

export function formatVagusLabel(variantValue: unknown): string | null {
  const mode = decodeVagusVariant(variantValue);
  if (!mode) return null;
  return `${vagusModeLabel(mode)} · ${vagusModePoints(mode)} pts`;
}

export function remapVagusFavoriteId(id: string): string {
  if ((VAGUS_NERVE_LEGACY_IDS as readonly string[]).includes(id)) {
    return VAGUS_NERVE_PROTOCOL_ID;
  }
  return id;
}
