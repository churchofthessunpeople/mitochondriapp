/**
 * Curated starter pack for new-user onboarding.
 * Low-equipment, high-leverage protocols — not the full catalog.
 * Keep IDs aligned with active entries in content/activities.json.
 */
/** Light + Water + Magnetism first, then supporting habits. */
export const STARTER_PROTOCOL_IDS = [
  "drinking-water",
  "seafood-meal",
  "barefoot-earth",
  "sun-exposure",
  "sunset-viewing",
  "blue-light-hygiene",
  "screen-light-hygiene",
  "sleep-space",
  "exercise",
  "vagus-nerve-stimulation",
] as const;

export type StarterProtocolId = (typeof STARTER_PROTOCOL_IDS)[number];
