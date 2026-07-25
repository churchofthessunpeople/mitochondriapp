/**
 * Client-safe catalog helpers (seeds only — no fs / Neon).
 *
 * Merged overlays + FK sync: `@/lib/catalog-server`.
 */

import { PROTOCOL_SEEDS, type ProtocolSeed } from "@/db/seed-data";
import type { Protocol } from "@/db/schema";
import { seedToProtocol } from "@/lib/protocol-seed";

export { seedToProtocol };
export type { ProtocolSeed };

/** Full active catalog from local seeds (no admin overlays). */
export function getCatalogProtocols(): Protocol[] {
  return PROTOCOL_SEEDS.filter((s) => !s.retired)
    .map(seedToProtocol)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function getCatalogProtocolById(id: string): Protocol | undefined {
  const seed = PROTOCOL_SEEDS.find((s) => s.id === id);
  return seed ? seedToProtocol(seed) : undefined;
}
