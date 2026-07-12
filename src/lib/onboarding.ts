/**
 * Curated starter pack for new-user onboarding.
 * Low-equipment, high-leverage protocols — not the full catalog.
 */
export const STARTER_PROTOCOL_IDS = [
  "morning-natural-light",
  "sunrise-grounding",
  "barefoot-earth",
  "mineralized-water",
  "midday-sun-skin",
  "sunset-viewing",
  "blue-light-hygiene",
  "dark-bedroom",
  "morning-movement",
  "phone-away-sleep",
] as const;

export type StarterProtocolId = (typeof STARTER_PROTOCOL_IDS)[number];
