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
import {
  loadContentOverrides,
  mergeProtocolSeed,
  mergeProtocols,
  isCustomProtocolId,
  getCustomProtocolSeed,
  isProtocolDeleted,
} from "@/lib/content-overrides";

export function seedToProtocol(seed: ProtocolSeed): Protocol {
  return {
    ...seed,
    active: true,
    createdAt: new Date(),
  };
}

/** Full active catalog from local seeds (no admin overrides). */
export function getCatalogProtocols(): Protocol[] {
  return PROTOCOL_SEEDS.map(seedToProtocol).sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}

/** Catalog with admin overrides applied (preferred for app reads). */
export async function getMergedCatalogProtocols(): Promise<Protocol[]> {
  const overrides = await loadContentOverrides();
  return mergeProtocols(overrides);
}

export function getCatalogProtocolById(id: string): Protocol | undefined {
  const seed = PROTOCOL_SEEDS.find((s) => s.id === id);
  return seed ? seedToProtocol(seed) : undefined;
}

export async function getMergedCatalogProtocolById(
  id: string,
): Promise<Protocol | undefined> {
  const overrides = await loadContentOverrides();
  if (isProtocolDeleted(overrides, id)) return undefined;

  const seed = PROTOCOL_SEEDS.find((s) => s.id === id);
  if (seed) {
    return seedToProtocol(mergeProtocolSeed(seed, overrides));
  }

  if (isCustomProtocolId(overrides, id)) {
    const custom = getCustomProtocolSeed(id, overrides);
    return custom ? seedToProtocol(custom) : undefined;
  }

  return undefined;
}

function protocolRowValues(row: Protocol) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    points: row.points,
    category: row.category,
    timeOfDay: row.timeOfDay,
    lockedTimeOfDay: row.lockedTimeOfDay,
    allowsMultiple: row.allowsMultiple,
    maxPerDay: row.maxPerDay,
    durationEnabled: row.durationEnabled,
    referenceMinutes: row.referenceMinutes,
    maxDurationMinutes: row.maxDurationMinutes,
    sortOrder: row.sortOrder,
    active: true,
  };
}

function protocolRowSet(row: Protocol) {
  return {
    name: row.name,
    description: row.description,
    points: row.points,
    category: row.category,
    timeOfDay: row.timeOfDay,
    lockedTimeOfDay: row.lockedTimeOfDay,
    allowsMultiple: row.allowsMultiple,
    maxPerDay: row.maxPerDay,
    durationEnabled: row.durationEnabled,
    referenceMinutes: row.referenceMinutes,
    maxDurationMinutes: row.maxDurationMinutes,
    sortOrder: row.sortOrder,
    active: true,
  };
}

async function upsertProtocolRow(row: Protocol) {
  await db
    .insert(protocols)
    .values(protocolRowValues(row))
    .onConflictDoUpdate({
      target: protocols.id,
      set: protocolRowSet(row),
    });
}

/**
 * Upsert a single seed into Neon for FK integrity (favorites / completions).
 * Prefer this on hot paths — full catalog sync is for background only.
 */
export async function ensureProtocolInDb(protocolId: string): Promise<boolean> {
  const row = await getMergedCatalogProtocolById(protocolId);
  if (!row) return false;
  try {
    await upsertProtocolRow(row);
    return true;
  } catch (e) {
    console.warn("[catalog] single protocol sync failed", protocolId, e);
    return false;
  }
}

/**
 * Ensure protocol FK rows exist in Neon.
 * Skips when every catalog id is already present (normal case after seed).
 * Missing rows are upserted in parallel.
 */
export const ensureCatalogSyncedToDb = cache(async () => {
  try {
    const list = await getMergedCatalogProtocols();
    if (list.length === 0) return;

    const existing = await db
      .select({ id: protocols.id })
      .from(protocols);
    const have = new Set(existing.map((r) => r.id));
    const missing = list.filter((p) => !have.has(p.id));
    if (missing.length === 0) return;

    await Promise.all(missing.map((row) => upsertProtocolRow(row)));
  } catch (e) {
    console.warn("[catalog] sync to DB failed", e);
  }
});
