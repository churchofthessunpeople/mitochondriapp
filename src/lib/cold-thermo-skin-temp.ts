/** Cold thermogenesis — skin temp; 50°F optimal; warmer = diminishing base. */

export const COLD_THERMOGENESIS_PROTOCOL_ID = "cold-thermogenesis";

export const OPTIMAL_COLD_THERMO_SKIN_TEMP_F = 50;

/** Skin-temp settings in 5°F steps at or above the ~50°F target. */
export const COLD_THERMO_SKIN_TEMP_OPTIONS = [50, 55, 60, 65, 70] as const;

export type ColdThermoSkinTempF = (typeof COLD_THERMO_SKIN_TEMP_OPTIONS)[number];

/** Base points lost per 5°F step above optimal (on catalog base). */
export const COLD_THERMO_SKIN_TEMP_STEP_PENALTY = 2;

export function isColdThermoProtocolId(id: string): boolean {
  return id === COLD_THERMOGENESIS_PROTOCOL_ID;
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

export function formatColdThermoSkinTemp(tempF: number): string {
  return `${Math.round(tempF)}°F skin`;
}
