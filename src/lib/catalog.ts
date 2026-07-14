/**
 * Activity catalog — local source of truth (like Mitoversity articles).
 *
 * Edit `src/db/seed-data.ts` to add/change activities. Restart the dev server
 * (or redeploy) to pick up changes. Neon is only used for user tracking
 * (favorites, logs, schedule); protocol rows are auto-synced for FKs.
 */

import { cache } from "react";
import { db } from "@/db";
import { protocols, type Protocol } from "@/db/schema";
import { PROTOCOL_SEEDS, type ProtocolSeed } from "@/db/seed-data";

export function seedToProtocol(seed: ProtocolSeed): Protocol {
  return {
    ...seed,
    active: true,
    createdAt: new Date(),
  };
}

/** Full active catalog from local seeds, sorted for display. */
export function getCatalogProtocols(): Protocol[] {
  return PROTOCOL_SEEDS.map(seedToProtocol).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}

export function getCatalogProtocolById(id: string): Protocol | undefined {
  const seed = PROTOCOL_SEEDS.find((s) => s.id === id);
  return seed ? seedToProtocol(seed) : undefined;
}

function protocolUpsertValues(seed: ProtocolSeed) {
  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    points: seed.points,
    category: seed.category,
    timeOfDay: seed.timeOfDay,
    lockedTimeOfDay: seed.lockedTimeOfDay,
    allowsMultiple: seed.allowsMultiple,
    maxPerDay: seed.maxPerDay,
    durationEnabled: seed.durationEnabled,
    referenceMinutes: seed.referenceMinutes,
    maxDurationMinutes: seed.maxDurationMinutes,
    sortOrder: seed.sortOrder,
    active: true,
  };
}

function protocolUpsertSet(seed: ProtocolSeed) {
  return {
    name: seed.name,
    description: seed.description,
    points: seed.points,
    category: seed.category,
    timeOfDay: seed.timeOfDay,
    lockedTimeOfDay: seed.lockedTimeOfDay,
    allowsMultiple: seed.allowsMultiple,
    maxPerDay: seed.maxPerDay,
    durationEnabled: seed.durationEnabled,
    referenceMinutes: seed.referenceMinutes,
    maxDurationMinutes: seed.maxDurationMinutes,
    sortOrder: seed.sortOrder,
    active: true,
  };
}

/**
 * Upsert a single seed into Neon for FK integrity (favorites / completions).
 * Prefer this on hot paths — full catalog sync is for page loads only.
 */
export async function ensureProtocolInDb(protocolId: string): Promise<boolean> {
  const seed = PROTOCOL_SEEDS.find((s) => s.id === protocolId);
  if (!seed) return false;
  try {
    await db
      .insert(protocols)
      .values(protocolUpsertValues(seed))
      .onConflictDoUpdate({
        target: protocols.id,
        set: protocolUpsertSet(seed),
      });
    return true;
  } catch (e) {
    console.warn("[catalog] single protocol sync failed", protocolId, e);
    return false;
  }
}

/**
 * Upsert local catalog into Neon so favorites/completions FKs keep working.
 * Request-scoped (React cache) — runs at most once per server request.
 */
export const ensureCatalogSyncedToDb = cache(async () => {
  try {
    for (const seed of PROTOCOL_SEEDS) {
      await db
        .insert(protocols)
        .values(protocolUpsertValues(seed))
        .onConflictDoUpdate({
          target: protocols.id,
          set: protocolUpsertSet(seed),
        });
    }
  } catch (e) {
    // Don't break the app if DB is briefly unavailable — reads still work from seeds
    console.warn("[catalog] sync to DB failed", e);
  }
});
