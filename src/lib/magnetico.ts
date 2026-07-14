/** Magnetico sleep pad — catalog base × gauss strength multiplier. */

export const MAGNETICO_PROTOCOL_ID = "magnetico-sleep-pad";

export const MAGNETICO_GAUSS_OPTIONS = [5, 10, 20] as const;

export type MagneticoGauss = (typeof MAGNETICO_GAUSS_OPTIONS)[number];

export const DEFAULT_MAGNETICO_GAUSS: MagneticoGauss = 10;

/** Strength multiplier on catalog base points. */
export const MAGNETICO_GAUSS_MULTIPLIERS: Record<MagneticoGauss, number> = {
  5: 1.25,
  10: 1.5,
  20: 2,
};

export function isMagneticoProtocolId(id: string): boolean {
  return id === MAGNETICO_PROTOCOL_ID;
}

export function parseMagneticoGauss(value: unknown): MagneticoGauss {
  const n = typeof value === "string" ? Number(value) : value;
  if (n === 5 || n === 10 || n === 20) return n;
  return DEFAULT_MAGNETICO_GAUSS;
}

export function magneticoGaussMultiplier(gauss: MagneticoGauss): number {
  return MAGNETICO_GAUSS_MULTIPLIERS[gauss];
}

/** Final points: catalog base × gauss strength multiplier. */
export function pointsForMagneticoGauss(
  gauss: MagneticoGauss,
  catalogBase = 10,
): number {
  return Math.max(
    1,
    Math.round(catalogBase * magneticoGaussMultiplier(gauss)),
  );
}

export function formatMagneticoGauss(gauss: MagneticoGauss): string {
  return `${gauss} G`;
}

export function formatMagneticoGaussMultiplier(gauss: MagneticoGauss): string {
  const m = magneticoGaussMultiplier(gauss);
  const s = Number.isInteger(m) ? String(m) : String(m);
  return `${s}×`;
}

export function formatMagneticoLogDetail(
  gauss: MagneticoGauss,
  catalogBase = 10,
): string {
  return `${formatMagneticoGauss(gauss)} · ${formatMagneticoGaussMultiplier(gauss)} · ${pointsForMagneticoGauss(gauss, catalogBase)} pts`;
}
