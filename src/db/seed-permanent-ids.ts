/**
 * Thin id list for client-safe permanent checks — avoid importing full seed-data.
 * Keep in sync with `permanent: true` rows in seed-data.ts.
 */
export const SEED_PERMANENT_PROTOCOL_IDS = [
  "air-tube-headphones",
  "magnetico-sleep-pad",
  "breaker-off-bedroom",
  "breaker-off-office",
  "dark-bedroom",
  "cool-bedroom-sleep",
] as const;

export const SEED_PERMANENT_ID_SET = new Set<string>(SEED_PERMANENT_PROTOCOL_IDS);
