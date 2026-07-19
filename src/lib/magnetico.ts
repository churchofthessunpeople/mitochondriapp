/** Magnetico sleep pad — flat points by gauss strength (no multipliers). */

export const MAGNETICO_PROTOCOL_ID = "magnetico-sleep-pad";

export const MAGNETICO_GAUSS_OPTIONS = [5, 10, 20] as const;

export type MagneticoGauss = (typeof MAGNETICO_GAUSS_OPTIONS)[number];

export const DEFAULT_MAGNETICO_GAUSS: MagneticoGauss = 10;

/** Flat points by pad strength — multipliers are reserved for sunlight day boost. */
export const MAGNETICO_GAUSS_POINTS: Record<MagneticoGauss, number> = {
  5: 10,
  10: 25,
  20: 50,
};

export function isMagneticoProtocolId(id: string): boolean {
  return id === MAGNETICO_PROTOCOL_ID;
}

export function parseMagneticoGauss(value: unknown): MagneticoGauss {
  const n = typeof value === "string" ? Number(value) : value;
  if (n === 5 || n === 10 || n === 20) return n;
  return DEFAULT_MAGNETICO_GAUSS;
}

/** Points for the selected gauss rating (catalog base ignored). */
export function pointsForMagneticoGauss(
  gauss: MagneticoGauss,
  _catalogBase = 10,
): number {
  void _catalogBase;
  return MAGNETICO_GAUSS_POINTS[gauss];
}

export function formatMagneticoGauss(gauss: MagneticoGauss): string {
  return `${gauss} G`;
}

export function formatMagneticoLogDetail(
  gauss: MagneticoGauss,
  catalogBase = 10,
): string {
  return `${formatMagneticoGauss(gauss)} · ${pointsForMagneticoGauss(gauss, catalogBase)} pts`;
}
