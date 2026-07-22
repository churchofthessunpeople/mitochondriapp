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
  mergeAllProtocolMeta,
  isCustomProtocolId,
  getCustomProtocolSeed,
  isProtocolDeleted,
} from "@/lib/content-overrides";
import { getProtocolTeaser } from "@/lib/protocol-display";
import { isSunriseKeystoneProtocolId } from "@/lib/scoring";

export function seedToProtocol(seed: ProtocolSeed): Protocol {
  return {
    ...seed,
    active: true,
    createdAt: new Date(),
  };
}

/** Full active catalog from local seeds (no admin overrides). */
export function getCatalogProtocols(): Protocol[] {
  return PROTOCOL_SEEDS.filter((s) => !s.retired)
    .map(seedToProtocol)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
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
  // Morning-light keystones stay loggable even if removed from the catalog UI.
  if (isProtocolDeleted(overrides, id) && !isSunriseKeystoneProtocolId(id)) {
    return undefined;
  }

  const seed = PROTOCOL_SEEDS.find((s) => s.id === id);
  if (seed) {
    const merged = isProtocolDeleted(overrides, id)
      ? seed
      : mergeProtocolSeed(seed, overrides);
    const allMeta = mergeAllProtocolMeta(overrides);
    const teaser = getProtocolTeaser(merged, allMeta);
    return seedToProtocol({ ...merged, description: teaser });
  }

  if (isCustomProtocolId(overrides, id)) {
    const custom = getCustomProtocolSeed(id, overrides);
    if (!custom) return undefined;
    const allMeta = mergeAllProtocolMeta(overrides);
    const teaser = getProtocolTeaser(custom, allMeta);
    return seedToProtocol({ ...custom, description: teaser });
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
 * Ensure protocol FK rows exist in Neon and stay aligned with seeds.
 * Inserts missing ids; updates rows whose catalog fields drifted.
 */
export const ensureCatalogSyncedToDb = cache(async () => {
  try {
    // Include retired seeds so historical FKs and migrations keep resolving.
    const list = [
      ...PROTOCOL_SEEDS.map(seedToProtocol),
      ...(await getMergedCatalogProtocols()).filter(
        (p) => !PROTOCOL_SEEDS.some((s) => s.id === p.id),
      ),
    ];
    if (list.length === 0) return;

    const existing = await db
      .select({
        id: protocols.id,
        name: protocols.name,
        points: protocols.points,
        description: protocols.description,
        maxDurationMinutes: protocols.maxDurationMinutes,
        sortOrder: protocols.sortOrder,
      })
      .from(protocols);
    const have = new Map(existing.map((r) => [r.id, r]));

    const stale = list.filter((p) => {
      const row = have.get(p.id);
      if (!row) return true;
      return (
        row.name !== p.name ||
        row.points !== p.points ||
        row.description !== p.description ||
        row.maxDurationMinutes !== p.maxDurationMinutes ||
        row.sortOrder !== p.sortOrder
      );
    });
    if (stale.length === 0) return;

    await Promise.all(stale.map((row) => upsertProtocolRow(row)));
  } catch (e) {
    console.warn("[catalog] sync to DB failed", e);
  }
});
