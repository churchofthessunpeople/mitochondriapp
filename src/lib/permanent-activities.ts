/**
 * Permanent activities — once on the user's available list, auto-log each day
 * until removed or skipped for a specific night.
 *
 * Base flags live in seed-data.ts; admin overrides can promote/demote via
 * content_overrides (`permanent: true/false` on protocol patches).
 */

import { PROTOCOL_SEEDS } from "@/db/seed-data";

const SEED_PERMANENT_IDS = new Set(
  PROTOCOL_SEEDS.filter((s) => s.permanent).map((s) => s.id),
);

export type CatalogProtocol = {
  id: string;
  permanent?: boolean | null;
};

/** @deprecated Prefer isPermanentProtocol when you have the merged row. */
export function isPermanentProtocolId(id: string): boolean {
  return SEED_PERMANENT_IDS.has(id);
}

/** Uses merged catalog row (includes admin overrides). */
export function isPermanentProtocol(p: CatalogProtocol): boolean {
  if (p.permanent === true) return true;
  if (p.permanent === false) return false;
  return SEED_PERMANENT_IDS.has(p.id);
}

export function buildPermanentProtocolIds(
  protocols: readonly CatalogProtocol[],
): string[] {
  return protocols.filter((p) => isPermanentProtocol(p)).map((p) => p.id);
}

export async function isPermanentProtocolMerged(
  protocolId: string,
): Promise<boolean> {
  const { getMergedCatalogProtocolById } = await import("@/lib/catalog");
  const row = await getMergedCatalogProtocolById(protocolId);
  return row ? isPermanentProtocol(row as CatalogProtocol) : false;
}

export function getPermanentProtocolIds(): readonly string[] {
  return [...SEED_PERMANENT_IDS];
}
