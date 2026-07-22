/**
 * Cold thermogenesis — skin temp + session mode (plunge, shower, or face immersion).
 * ~50°F skin is optimal; warmer = diminishing base. Face immersion is a fixed
 * 3-round protocol (no duration picker). Plunge and shower ask for duration.
 */

export const COLD_THERMOGENESIS_PROTOCOL_ID = "cold-thermogenesis";

/** Retired into cold thermogenesis (face immersion mode). */
export const COLD_FACE_PLUNGE_LEGACY_ID = "cold-face-plunge";

export const OPTIMAL_COLD_THERMO_SKIN_TEMP_F = 50;

/** Skin-temp settings in 5°F steps at or above the ~50°F target. */
export const COLD_THERMO_SKIN_TEMP_OPTIONS = [50, 55, 60, 65, 70] as const;

export type ColdThermoSkinTempF = (typeof COLD_THERMO_SKIN_TEMP_OPTIONS)[number];

export type ColdThermoMode = "plunge" | "shower" | "face_immersion";

export type ColdThermoLogInput = {
  mode: ColdThermoMode;
  skinTempF: ColdThermoSkinTempF;
};

export const COLD_THERMO_MODE_OPTIONS: {
  id: ColdThermoMode;
  label: string;
  detail: string;
}[] = [
  {
    id: "plunge",
    label: "Cold plunge",
    detail: "Tub, lake, or immersion — pick duration next",
  },
  {
    id: "shower",
    label: "Cold shower",
    detail: "Cold shower finish or full cold shower — pick duration next",
  },
  {
    id: "face_immersion",
    label: "Face immersion",
    detail: "3 rounds of cold face / head immersion (fixed protocol)",
  },
] as const;

/** Assumed rounds when logging face immersion (no duration picker). */
export const FACE_IMMERSION_ROUNDS = 3;

/**
 * Face immersion awards a fraction of the plunge base so ~50°F ≈ old 5-pt habit
 * when catalog base is 24.
 */
export const FACE_IMMERSION_BASE_FRACTION = 5 / 24;

/** Packed into variant_value: face = temp + 1000, shower = temp + 2000. */
const FACE_VARIANT_OFFSET = 1000;
const SHOWER_VARIANT_OFFSET = 2000;

/** Base points lost per 5°F step above optimal (on catalog base). */
export const COLD_THERMO_SKIN_TEMP_STEP_PENALTY = 2;

export function isColdThermoProtocolId(id: string): boolean {
  return id === COLD_THERMOGENESIS_PROTOCOL_ID;
}

/** Plunge and shower ask for duration; face immersion does not. */
export function isColdThermoTimedMode(mode: ColdThermoMode): boolean {
  return mode === "plunge" || mode === "shower";
}

export function parseColdThermoSkinTempF(value: unknown): ColdThermoSkinTempF {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n === "number" && Number.isFinite(n)) {
    const rounded = Math.round(n);
    if (rounded <= OPTIMAL_COLD_THERMO_SKIN_TEMP_F) {
      return OPTIMAL_COLD_THERMO_SKIN_TEMP_F;
    }
    const max = COLD_THERMO_SKIN_TEMP_OPTIONS.at(-1)!;
    if (rounded >= max) {
      return max;
    }
    if ((COLD_THERMO_SKIN_TEMP_OPTIONS as readonly number[]).includes(rounded)) {
      return rounded as ColdThermoSkinTempF;
    }
    const sorted = [...COLD_THERMO_SKIN_TEMP_OPTIONS].sort(
      (a, b) => Math.abs(a - rounded) - Math.abs(b - rounded),
    );
    return sorted[0] ?? OPTIMAL_COLD_THERMO_SKIN_TEMP_F;
  }
  return OPTIMAL_COLD_THERMO_SKIN_TEMP_F;
}

/**
 * Catalog base at ~50°F skin; −2 pts per 5°F step warmer (min 1).
 * Null/undefined = no skin temp logged → full catalog base.
 */
export function coldThermoSkinTempBasePoints(
  tempF: ColdThermoSkinTempF | null | undefined,
  catalogBase: number,
): number {
  if (tempF == null) return catalogBase;
  const rounded = parseColdThermoSkinTempF(tempF);
  const stepsAbove = Math.max(
    0,
    (rounded - OPTIMAL_COLD_THERMO_SKIN_TEMP_F) / 5,
  );
  return Math.max(
    1,
    catalogBase - stepsAbove * COLD_THERMO_SKIN_TEMP_STEP_PENALTY,
  );
}

/** Base for one face-immersion log (3 rounds, no duration blocks). */
export function coldThermoFaceImmersionBasePoints(
  tempF: ColdThermoSkinTempF,
  catalogBase: number,
): number {
  const plungeBase = coldThermoSkinTempBasePoints(tempF, catalogBase);
  return Math.max(1, Math.round(plungeBase * FACE_IMMERSION_BASE_FRACTION));
}

export function coldThermoBasePoints(
  input: ColdThermoLogInput,
  catalogBase: number,
): number {
  if (input.mode === "face_immersion") {
    return coldThermoFaceImmersionBasePoints(input.skinTempF, catalogBase);
  }
  return coldThermoSkinTempBasePoints(input.skinTempF, catalogBase);
}

export function formatColdThermoSkinTemp(tempF: number): string {
  return `${Math.round(tempF)}°F skin`;
}

export function coldThermoModeLabel(mode: ColdThermoMode): string {
  return (
    COLD_THERMO_MODE_OPTIONS.find((o) => o.id === mode)?.label ?? mode
  );
}

/**
 * Pack mode + skin temp into variant_value.
 * Legacy bare temps (50–70) → cold plunge.
 * Face immersion = temp + 1000; shower = temp + 2000.
 */
export function encodeColdThermoVariant(input: ColdThermoLogInput): number {
  const temp = parseColdThermoSkinTempF(input.skinTempF);
  if (input.mode === "face_immersion") return temp + FACE_VARIANT_OFFSET;
  if (input.mode === "shower") return temp + SHOWER_VARIANT_OFFSET;
  return temp;
}

export function decodeColdThermoVariant(
  variantValue: unknown,
): ColdThermoLogInput | null {
  if (typeof variantValue !== "number" || !Number.isFinite(variantValue)) {
    return null;
  }
  const v = Math.trunc(variantValue);
  if (v >= SHOWER_VARIANT_OFFSET) {
    return {
      mode: "shower",
      skinTempF: parseColdThermoSkinTempF(v - SHOWER_VARIANT_OFFSET),
    };
  }
  if (v >= FACE_VARIANT_OFFSET) {
    return {
      mode: "face_immersion",
      skinTempF: parseColdThermoSkinTempF(v - FACE_VARIANT_OFFSET),
    };
  }
  // Legacy bare temps and plunge packing (also old plunge_shower logs)
  if (v < 40 || v > 80) return null;
  return {
    mode: "plunge",
    skinTempF: parseColdThermoSkinTempF(v),
  };
}

/** Prefer decode; fall back to plunge + parsed temp for legacy callers. */
export function parseColdThermoLogInput(
  variantValue: unknown,
  skinTempFallback?: unknown,
): ColdThermoLogInput {
  const decoded = decodeColdThermoVariant(variantValue);
  if (decoded) return decoded;
  return {
    mode: "plunge",
    skinTempF: parseColdThermoSkinTempF(
      skinTempFallback ?? variantValue ?? OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
    ),
  };
}

export function formatColdThermoLabel(
  variantValue: unknown,
  durationMinutes?: number | null,
): string | null {
  const decoded = decodeColdThermoVariant(variantValue);
  if (!decoded) {
    // Legacy temp-only
    if (typeof variantValue === "number" && Number.isFinite(variantValue)) {
      const temp = parseColdThermoSkinTempF(variantValue);
      const parts = [formatColdThermoSkinTemp(temp)];
      if (durationMinutes != null && durationMinutes > 0) {
        parts.push(`${durationMinutes} min`);
      }
      return parts.join(" · ");
    }
    return null;
  }
  const parts = [
    coldThermoModeLabel(decoded.mode),
    formatColdThermoSkinTemp(decoded.skinTempF),
  ];
  if (decoded.mode === "face_immersion") {
    parts.push(`${FACE_IMMERSION_ROUNDS} rounds`);
  } else if (durationMinutes != null && durationMinutes > 0) {
    parts.push(`${durationMinutes} min`);
  }
  return parts.join(" · ");
}

export function remapColdThermoFavoriteId(protocolId: string): string {
  if (protocolId === COLD_FACE_PLUNGE_LEGACY_ID) {
    return COLD_THERMOGENESIS_PROTOCOL_ID;
  }
  return protocolId;
}
