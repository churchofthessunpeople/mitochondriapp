import { cache } from "react";
import { db } from "@/db";
import { contentOverrides, type Protocol, type ProtocolCategory } from "@/db/schema";
import { PROTOCOL_SEEDS, type ProtocolSeed } from "@/db/seed-data";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  MITO_PILLAR_LABEL,
  MITOVERSITY_ENTRIES,
  type MitoEntry,
  type MitoPillar,
} from "@/lib/mitoversity";
import {
  PROTOCOL_META_BASE,
  type EquipmentNeed,
  type ProtocolMeta,
} from "@/lib/protocol-meta";
import { LWM_PILLARS, type LwmPillarMeta } from "@/lib/lwm";
import { TIME_OF_DAY_META, TIME_OF_DAY_ORDER } from "@/lib/time-of-day";
import type { TimeOfDay } from "@/db/schema";
import { seedToProtocol } from "@/lib/catalog";
import { getProtocolTeaser } from "@/lib/protocol-display";
import { buildPermanentProtocolIds } from "@/lib/permanent-activities";

export type OverrideMap = Map<string, unknown>;

export const REGISTRY_CUSTOM_PROTOCOLS = "registry:custom-protocol-ids";
export const REGISTRY_CUSTOM_MITO = "registry:custom-mito-ids";

export const contentKey = {
  protocol: (id: string) => `protocol:${id}`,
  protocolMeta: (id: string) => `protocol-meta:${id}`,
  mito: (id: string) => `mito:${id}`,
  category: (id: string) => `category:${id}`,
  copy: (id: string) => `copy:${id}`,
} as const;

export function getRegistryIds(overrides: OverrideMap, registryKey: string): string[] {
  const value = overrides.get(registryKey);
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function isCustomProtocolId(overrides: OverrideMap, id: string): boolean {
  return getRegistryIds(overrides, REGISTRY_CUSTOM_PROTOCOLS).includes(id);
}

export function isCustomMitoId(overrides: OverrideMap, id: string): boolean {
  return getRegistryIds(overrides, REGISTRY_CUSTOM_MITO).includes(id);
}

export function getCustomProtocolSeed(
  id: string,
  overrides: OverrideMap,
): ProtocolSeed | null {
  const raw = overrides.get(contentKey.protocol(id));
  if (!raw || typeof raw !== "object") return null;
  const patch = raw as ProtocolOverride & Partial<ProtocolSeed>;
  if (
    typeof patch.name !== "string" ||
    typeof patch.description !== "string" ||
    typeof patch.points !== "number" ||
    typeof patch.category !== "string" ||
    typeof patch.timeOfDay !== "string" ||
    typeof patch.allowsMultiple !== "boolean" ||
    typeof patch.durationEnabled !== "boolean" ||
    typeof patch.referenceMinutes !== "number" ||
    typeof patch.maxDurationMinutes !== "number" ||
    typeof patch.sortOrder !== "number"
  ) {
    return null;
  }
  return {
    id,
    name: patch.name,
    description: patch.description,
    points: patch.points,
    category: patch.category as ProtocolCategory,
    timeOfDay: patch.timeOfDay as TimeOfDay,
    lockedTimeOfDay:
      patch.lockedTimeOfDay === undefined
        ? null
        : (patch.lockedTimeOfDay as TimeOfDay | null),
    allowsMultiple: patch.allowsMultiple,
    maxPerDay: typeof patch.maxPerDay === "number" ? patch.maxPerDay : 1,
    durationEnabled: patch.durationEnabled,
    referenceMinutes: patch.referenceMinutes,
    maxDurationMinutes: patch.maxDurationMinutes,
    sortOrder: patch.sortOrder,
    permanent: patch.permanent === true,
  };
}

function customMitoEntryFromOverride(
  id: string,
  overrides: OverrideMap,
): MitoEntry | null {
  const raw = overrides.get(contentKey.mito(id));
  if (!raw || typeof raw !== "object") return null;
  const patch = raw as MitoEntryOverride & Partial<MitoEntry>;
  if (
    patch.deleted === true ||
    patch.hidden === true ||
    typeof patch.title !== "string" ||
    typeof patch.summary !== "string" ||
    typeof patch.pillar !== "string" ||
    !Array.isArray(patch.sections)
  ) {
    return null;
  }
  return {
    id,
    title: patch.title,
    summary: patch.summary,
    pillar: patch.pillar as MitoPillar,
    sections: patch.sections,
    relatedProtocolIds: patch.relatedProtocolIds,
  };
}

export type ProtocolOverride = Partial<
  ProtocolSeed & { active?: boolean; permanent?: boolean; deleted?: boolean }
>;

export type ProtocolMetaOverride = Partial<ProtocolMeta>;

export type MitoEntryOverride = Partial<MitoEntry> & {
  hidden?: boolean;
  deleted?: boolean;
};

export function isProtocolDeleted(
  overrides: OverrideMap,
  id: string,
): boolean {
  const patch = overrides.get(contentKey.protocol(id)) as
    | ProtocolOverride
    | undefined;
  return patch?.deleted === true || patch?.active === false;
}

export function isMitoDeleted(overrides: OverrideMap, id: string): boolean {
  const patch = overrides.get(contentKey.mito(id)) as
    | MitoEntryOverride
    | undefined;
  return patch?.deleted === true || patch?.hidden === true;
}

export type CategoryOverride = Partial<{ label: string; blurb: string }>;

export type CopyOverride = string;

/** Load all overrides once per server request. */
export const loadContentOverrides = cache(async (): Promise<OverrideMap> => {
  try {
    const rows = await db.select().from(contentOverrides);
    return new Map(rows.map((r) => [r.key, r.value]));
  } catch {
    return new Map();
  }
});

function mergeRecord<T extends object>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object") return base;
  return { ...base, ...(patch as Partial<T>) };
}

export function mergeProtocolSeed(
  seed: ProtocolSeed,
  overrides: OverrideMap,
): ProtocolSeed {
  const patch = overrides.get(contentKey.protocol(seed.id)) as
    | ProtocolOverride
    | undefined;
  if (!patch) return seed;
  return mergeRecord(seed, patch);
}

export function mergeProtocols(
  overrides: OverrideMap,
  seeds: readonly ProtocolSeed[] = PROTOCOL_SEEDS,
): Protocol[] {
  const allMeta = mergeAllProtocolMeta(overrides);
  const out: Protocol[] = [];
  for (const seed of seeds) {
    if (seed.retired) continue;
    if (isProtocolDeleted(overrides, seed.id)) continue;
    const merged = mergeProtocolSeed(seed, overrides);
    const teaser = getProtocolTeaser(merged, allMeta);
    out.push(seedToProtocol({ ...merged, description: teaser }));
  }
  for (const id of getRegistryIds(overrides, REGISTRY_CUSTOM_PROTOCOLS)) {
    if (seeds.some((seed) => seed.id === id)) continue;
    if (isProtocolDeleted(overrides, id)) continue;
    const custom = getCustomProtocolSeed(id, overrides);
    if (!custom) continue;
    const teaser = getProtocolTeaser(custom, allMeta);
    out.push(seedToProtocol({ ...custom, description: teaser }));
  }
  return out.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}

export function mergeProtocolMeta(
  protocolId: string,
  overrides: OverrideMap,
): ProtocolMeta {
  const base = PROTOCOL_META_BASE[protocolId] ?? { equipment: "none" as const };
  const patch = overrides.get(contentKey.protocolMeta(protocolId));
  return mergeRecord(base, patch);
}

export function mergeAllProtocolMeta(
  overrides: OverrideMap,
): Record<string, ProtocolMeta> {
  const ids = new Set([
    ...Object.keys(PROTOCOL_META_BASE),
    ...PROTOCOL_SEEDS.map((s) => s.id),
    ...getRegistryIds(overrides, REGISTRY_CUSTOM_PROTOCOLS),
  ]);
  const out: Record<string, ProtocolMeta> = {};
  for (const id of ids) {
    const merged = mergeProtocolMeta(id, overrides);
    out[id] = {
      ...merged,
      articleId: merged.articleId ?? PROTOCOL_META_BASE[id]?.articleId,
    };
  }
  return out;
}

export function mergeMitoEntry(
  entry: MitoEntry,
  overrides: OverrideMap,
): MitoEntry {
  const patch = overrides.get(contentKey.mito(entry.id)) as
    | MitoEntryOverride
    | undefined;
  if (!patch) return entry;
  return mergeRecord(entry, patch);
}

export function mergeMitoEntries(overrides: OverrideMap): MitoEntry[] {
  const seeded = MITOVERSITY_ENTRIES.map((e) => mergeMitoEntry(e, overrides)).filter(
    (entry) => !isMitoDeleted(overrides, entry.id),
  );
  const custom = getRegistryIds(overrides, REGISTRY_CUSTOM_MITO)
    .map((id) => customMitoEntryFromOverride(id, overrides))
    .filter((entry): entry is MitoEntry => entry != null);
  return [...seeded, ...custom];
}

export function mergeCategoryMeta(
  overrides: OverrideMap,
): Record<
  ProtocolCategory,
  { label: string; blurb: string; pillar: (typeof CATEGORY_META)[ProtocolCategory]["pillar"] }
> {
  const out = { ...CATEGORY_META };
  for (const cat of CATEGORY_ORDER) {
    const patch = overrides.get(contentKey.category(cat));
    if (patch && typeof patch === "object") {
      out[cat] = mergeRecord(out[cat], patch);
    }
  }
  return out;
}

export function mergeMitoPillarLabels(
  overrides: OverrideMap,
): Record<MitoPillar, string> {
  const out = { ...MITO_PILLAR_LABEL };
  for (const pillar of Object.keys(MITO_PILLAR_LABEL) as MitoPillar[]) {
    const v = overrides.get(contentKey.copy(`mito-pillar:${pillar}`));
    if (typeof v === "string" && v.trim()) out[pillar] = v.trim();
  }
  return out;
}

export function mergeMitoversityIntro(overrides: OverrideMap): string {
  const v = overrides.get(contentKey.copy("mitoversity-intro"));
  if (typeof v === "string" && v.trim()) return v.trim();
  return (
    "Stand-alone explainers on light, water, magnetism, and support " +
    "habits for mitochondrial lifestyle tracking. Where a claim is " +
    "specific to Dr. Jack Kruse's public teaching, it is cited as such."
  );
}

export function mergeTimeOfDayMeta(overrides: OverrideMap) {
  const out = { ...TIME_OF_DAY_META };
  for (const slot of TIME_OF_DAY_ORDER) {
    const patch = overrides.get(contentKey.copy(`time-of-day:${slot}`));
    if (patch && typeof patch === "object") {
      out[slot] = mergeRecord(out[slot], patch as { label?: string; blurb?: string });
    }
  }
  return out;
}

export function mergeLwmPillars(overrides: OverrideMap): readonly LwmPillarMeta[] {
  return LWM_PILLARS.map((pillar) => {
    const patch = overrides.get(contentKey.copy(`lwm-pillar:${pillar.id}`));
    if (!patch || typeof patch !== "object") return pillar;
    return mergeRecord(pillar, patch as Partial<LwmPillarMeta>);
  });
}

export type AppContentBundle = {
  protocols: Protocol[];
  permanentProtocolIds: string[];
  protocolMeta: Record<string, ProtocolMeta>;
  mitoEntries: MitoEntry[];
  categoryMeta: ReturnType<typeof mergeCategoryMeta>;
  mitoPillarLabels: Record<MitoPillar, string>;
  mitoversityIntro: string;
  timeOfDayMeta: ReturnType<typeof mergeTimeOfDayMeta>;
  lwmPillars: readonly LwmPillarMeta[];
};

export async function loadAppContent(): Promise<AppContentBundle> {
  const overrides = await loadContentOverrides();
  const protocols = mergeProtocols(overrides);
  return {
    protocols,
    permanentProtocolIds: buildPermanentProtocolIds(protocols),
    protocolMeta: mergeAllProtocolMeta(overrides),
    mitoEntries: mergeMitoEntries(overrides),
    categoryMeta: mergeCategoryMeta(overrides),
    mitoPillarLabels: mergeMitoPillarLabels(overrides),
    mitoversityIntro: mergeMitoversityIntro(overrides),
    timeOfDayMeta: mergeTimeOfDayMeta(overrides),
    lwmPillars: mergeLwmPillars(overrides),
  };
}

export function getMergedHowTo(
  protocol: { id: string; description: string },
  meta: Record<string, ProtocolMeta>,
): string {
  const how = meta[protocol.id]?.how;
  if (how?.trim()) return how.trim();
  return protocol.description.trim();
}

export function equipmentLabel(e: EquipmentNeed): string {
  if (e === "required") return "Needs gear";
  if (e === "optional") return "Gear optional";
  return "No gear";
}
