/**
 * Curated starter pack for new-user onboarding.
 * Low-equipment, high-leverage protocols — not the full catalog.
 */
/** Light + Water + Magnetism keystones first, then supporting habits. */
export const STARTER_PROTOCOL_IDS = [
  "low-d-hydration",
  "deuterium-aware-meal",
  "barefoot-earth",
  "magnetic-awareness",
  "sun-exposure",
  "sunset-viewing",
  "blue-light-hygiene",
  "sleep-space",
  "reduce-nnemf-block",
  "exercise",
] as const;

export type StarterProtocolId = (typeof STARTER_PROTOCOL_IDS)[number];
