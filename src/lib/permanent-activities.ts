/**
 * Permanent activities — once on the user's available list, auto-log each day
 * until removed or skipped for a specific night.
 *
 * Flag lives in seed-data.ts (`permanent: true`), not in Neon protocol rows.
 */

import { PROTOCOL_SEEDS } from "@/db/seed-data";

const PERMANENT_IDS = new Set(
  PROTOCOL_SEEDS.filter((s) => s.permanent).map((s) => s.id),
);

export function isPermanentProtocolId(id: string): boolean {
  return PERMANENT_IDS.has(id);
}

export function getPermanentProtocolIds(): readonly string[] {
  return [...PERMANENT_IDS];
}
