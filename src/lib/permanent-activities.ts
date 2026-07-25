/**
 * Permanent activities — once on the user's available list, auto-log each day
 * until removed or skipped for a specific night.
 *
 * Base flags live in seed-data.ts (ids mirrored in seed-permanent-ids.ts for
 * client-safe imports); admin overlays in content/ can promote/demote.
 *
 * Client-safe: no catalog-server / fs imports.
 */

import { SEED_PERMANENT_ID_SET } from "@/db/seed-permanent-ids";

export type CatalogProtocol = {
  id: string;
  permanent?: boolean | null;
};

/** @deprecated Prefer isPermanentProtocol when you have the merged row. */
export function isPermanentProtocolId(id: string): boolean {
  return SEED_PERMANENT_ID_SET.has(id);
}

/** Uses merged catalog row (includes admin overrides). */
export function isPermanentProtocol(p: CatalogProtocol): boolean {
  if (p.permanent === true) return true;
  if (p.permanent === false) return false;
  return SEED_PERMANENT_ID_SET.has(p.id);
}

export function buildPermanentProtocolIds(
  protocols: readonly CatalogProtocol[],
): string[] {
  return protocols.filter((p) => isPermanentProtocol(p)).map((p) => p.id);
}
