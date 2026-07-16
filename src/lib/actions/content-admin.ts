"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { contentOverrides, protocols, type ProtocolCategory } from "@/db/schema";
import { PROTOCOL_SEEDS, type ProtocolSeed } from "@/db/seed-data";
import { CATEGORY_ORDER } from "@/lib/categories";
import { requireAdmin } from "@/lib/admin";
import { ensureProtocolInDb } from "@/lib/catalog";
import {
  contentKey,
  getCustomProtocolSeed,
  getRegistryIds,
  isCustomMitoId,
  isCustomProtocolId,
  isMitoDeleted,
  isProtocolDeleted,
  loadContentOverrides,
  mergeMitoEntry,
  mergeProtocolMeta,
  mergeProtocolSeed,
  REGISTRY_CUSTOM_MITO,
  REGISTRY_CUSTOM_PROTOCOLS,
  type CategoryOverride,
  type CopyOverride,
  type MitoEntryOverride,
  type ProtocolMetaOverride,
  type ProtocolOverride,
} from "@/lib/content-overrides";
import {
  MITOVERSITY_ENTRIES,
  type MitoEntry,
  type MitoPillar,
} from "@/lib/mitoversity";
import { revalidateApp } from "@/lib/revalidate-app";
import { protocolTeaserFromHowTo } from "@/lib/protocol-meta";
import { isSunriseKeystoneProtocolId } from "@/lib/scoring";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";
import { LWM_PILLARS } from "@/lib/lwm";
import type { TimeOfDay } from "@/db/schema";

const CONTENT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseProtocolForm(raw: Record<string, unknown>, fallback?: ProtocolSeed) {
  const locked = raw.lockedTimeOfDay;
  const how = String(raw.how ?? "");
  const description = how.trim()
    ? protocolTeaserFromHowTo(how)
    : String(fallback?.description ?? "New activity");
  return {
    name: String(raw.name ?? fallback?.name ?? "New activity"),
    description,
    points: Number(raw.points ?? fallback?.points ?? 5),
    category: (raw.category as ProtocolCategory) ?? fallback?.category ?? "other",
    timeOfDay: (raw.timeOfDay as TimeOfDay) ?? fallback?.timeOfDay ?? "anytime",
    lockedTimeOfDay:
      locked === "none" || locked == null || locked === ""
        ? null
        : (locked as TimeOfDay),
    allowsMultiple: raw.allowsMultiple === "on",
    durationEnabled: raw.durationEnabled === "on",
    permanent: raw.permanent === "on",
    active: true,
    sortOrder: Number(raw.sortOrder ?? fallback?.sortOrder ?? 500),
    referenceMinutes: Number(raw.referenceMinutes ?? fallback?.referenceMinutes ?? 15),
    maxDurationMinutes: Number(
      raw.maxDurationMinutes ?? fallback?.maxDurationMinutes ?? 60,
    ),
    maxPerDay: fallback?.maxPerDay ?? 1,
  };
}

async function setCustomProtocolRegistry(ids: string[]) {
  await upsertContentOverrideAction(REGISTRY_CUSTOM_PROTOCOLS, ids);
}

async function setCustomMitoRegistry(ids: string[]) {
  await upsertContentOverrideAction(REGISTRY_CUSTOM_MITO, ids);
}

function categoryToMitoPillar(
  category: ProtocolCategory,
): MitoPillar {
  if (category === "light") return "light";
  if (category === "water_food") return "water";
  if (category === "grounding" || category === "emf") return "magnetism";
  return "support";
}

async function ensureMitoArticleForProtocol(
  articleId: string,
  protocolId: string,
  title: string,
  how: string,
  category: ProtocolCategory,
): Promise<void> {
  const overrides = await loadContentOverrides();
  if (
    MITOVERSITY_ENTRIES.some((e) => e.id === articleId) ||
    isCustomMitoId(overrides, articleId) ||
    overrides.has(contentKey.mito(articleId))
  ) {
    return;
  }

  const summary = protocolTeaserFromHowTo(how);
  const entry: MitoEntry = {
    id: articleId,
    title,
    pillar: categoryToMitoPillar(category),
    summary,
    relatedProtocolIds: [protocolId],
    sections: [
      {
        heading: "How to",
        body: how.trim() || summary,
      },
      {
        heading: "Learn more over time",
        body: "Expand this article in Admin → Content → Articles with deeper sections when ready.",
      },
    ],
  };

  const registry = getRegistryIds(overrides, REGISTRY_CUSTOM_MITO);
  await setCustomMitoRegistry([...registry, articleId]);
  await upsertContentOverrideAction(contentKey.mito(articleId), entry);
}

async function adminUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function upsertContentOverrideAction(
  key: string,
  value: unknown,
): Promise<void> {
  await requireAdmin();
  const userId = await adminUserId();
  await db
    .insert(contentOverrides)
    .values({ key, value, updatedBy: userId })
    .onConflictDoUpdate({
      target: contentOverrides.key,
      set: { value, updatedAt: new Date(), updatedBy: userId },
    });
  revalidateApp();
}

export async function deleteContentOverrideAction(key: string): Promise<void> {
  await requireAdmin();
  await db.delete(contentOverrides).where(eq(contentOverrides.key, key));
  revalidateApp();
}

export type AdminProtocolEditorData = {
  id: string;
  isCustom: boolean;
  seed: ProtocolSeed | null;
  merged: ProtocolSeed;
  meta: ReturnType<typeof mergeProtocolMeta>;
  hasProtocolOverride: boolean;
  hasMetaOverride: boolean;
  deleted: boolean;
};

export async function getAdminProtocolEditorAction(
  protocolId: string,
): Promise<AdminProtocolEditorData | null> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const seed = PROTOCOL_SEEDS.find((s) => s.id === protocolId) ?? null;
  const isCustom = isCustomProtocolId(overrides, protocolId);

  if (!seed && !isCustom) return null;

  const merged = seed
    ? mergeProtocolSeed(seed, overrides)
    : getCustomProtocolSeed(protocolId, overrides);
  if (!merged) return null;

  const patch = overrides.get(contentKey.protocol(protocolId)) as
    | ProtocolOverride
    | undefined;
  return {
    id: protocolId,
    isCustom,
    seed,
    merged,
    meta: mergeProtocolMeta(protocolId, overrides),
    hasProtocolOverride: patch != null,
    hasMetaOverride: overrides.has(contentKey.protocolMeta(protocolId)),
    deleted: isProtocolDeleted(overrides, protocolId),
  };
}

export async function listAdminProtocolEditorsAction(
  includeDeleted = false,
): Promise<
  {
    id: string;
    name: string;
    category: string;
    points: number;
    deleted: boolean;
    isCustom: boolean;
  }[]
> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const rows = PROTOCOL_SEEDS.map((seed) => {
    const merged = mergeProtocolSeed(seed, overrides);
    const deleted = isProtocolDeleted(overrides, seed.id);
    return {
      id: seed.id,
      name: merged.name,
      category: merged.category,
      points: merged.points,
      deleted,
      isCustom: false,
    };
  });

  for (const id of getRegistryIds(overrides, REGISTRY_CUSTOM_PROTOCOLS)) {
    if (PROTOCOL_SEEDS.some((seed) => seed.id === id)) continue;
    const merged = getCustomProtocolSeed(id, overrides);
    if (!merged) continue;
    rows.push({
      id,
      name: merged.name,
      category: merged.category,
      points: merged.points,
      deleted: false,
      isCustom: true,
    });
  }

  const visible = includeDeleted ? rows : rows.filter((row) => !row.deleted);
  return visible.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveAdminProtocolAction(
  protocolId: string,
  raw: Record<string, unknown>,
): Promise<void> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const seed = PROTOCOL_SEEDS.find((s) => s.id === protocolId) ?? null;
  const isCustom = isCustomProtocolId(overrides, protocolId);
  if (!seed && !isCustom) throw new Error("Unknown activity id");

  const fields = parseProtocolForm(raw, seed ?? undefined);
  const metaPatch: ProtocolMetaOverride = {
    equipment: (raw.equipment as ProtocolMetaOverride["equipment"]) ?? "none",
    how: String(raw.how ?? ""),
    articleId: String(raw.articleId ?? "").trim() || undefined,
  };

  if (isCustom) {
    const fullSeed: ProtocolSeed = {
      id: protocolId,
      ...fields,
    };
    await upsertContentOverrideAction(contentKey.protocol(protocolId), {
      ...fullSeed,
      active: fields.active,
    });
  } else {
    const { description: _desc, ...patch } = fields;
    await upsertContentOverrideAction(contentKey.protocol(protocolId), patch);
  }

  await upsertContentOverrideAction(contentKey.protocolMeta(protocolId), metaPatch);
  const articleId = metaPatch.articleId ?? protocolId;
  if (articleId && metaPatch.how?.trim()) {
    await ensureMitoArticleForProtocol(
      articleId,
      protocolId,
      fields.name,
      metaPatch.how,
      fields.category,
    );
  }
  await ensureProtocolInDb(protocolId);
}

export async function createAdminProtocolAction(
  raw: Record<string, unknown>,
): Promise<string> {
  await requireAdmin();
  const id = String(raw.id ?? "").trim();
  if (!CONTENT_ID_RE.test(id)) {
    throw new Error("Id must use lowercase letters, numbers, and hyphens only");
  }
  if (PROTOCOL_SEEDS.some((seed) => seed.id === id)) {
    throw new Error("That id is already used by a built-in activity");
  }

  const overrides = await loadContentOverrides();
  if (
    isCustomProtocolId(overrides, id) ||
    overrides.has(contentKey.protocol(id))
  ) {
    throw new Error("An activity with that id already exists");
  }

  const fields = parseProtocolForm(raw);
  const seed: ProtocolSeed = { id, ...fields };
  const metaPatch: ProtocolMetaOverride = {
    equipment: (raw.equipment as ProtocolMetaOverride["equipment"]) ?? "none",
    how: String(raw.how ?? ""),
    articleId: String(raw.articleId ?? "").trim() || undefined,
  };

  const articleId = metaPatch.articleId ?? id;
  metaPatch.articleId = articleId;

  const registry = getRegistryIds(overrides, REGISTRY_CUSTOM_PROTOCOLS);
  await setCustomProtocolRegistry([...registry, id]);
  await upsertContentOverrideAction(contentKey.protocol(id), {
    ...seed,
    active: true,
  });
  await upsertContentOverrideAction(contentKey.protocolMeta(id), metaPatch);
  if (metaPatch.how?.trim()) {
    await ensureMitoArticleForProtocol(
      articleId,
      id,
      fields.name,
      metaPatch.how,
      fields.category,
    );
  }
  await ensureProtocolInDb(id);
  return id;
}

export async function deleteAdminProtocolAction(
  protocolId: string,
): Promise<void> {
  await requireAdmin();
  if (isSunriseKeystoneProtocolId(protocolId)) {
    throw new Error(
      "Morning light tiers (horizon / open sky / outside) cannot be deleted — they power the daily sunrise check-in.",
    );
  }
  const overrides = await loadContentOverrides();
  const isCustom = isCustomProtocolId(overrides, protocolId);

  if (isCustom) {
    const registry = getRegistryIds(overrides, REGISTRY_CUSTOM_PROTOCOLS).filter(
      (id) => id !== protocolId,
    );
    await setCustomProtocolRegistry(registry);
    await deleteContentOverrideAction(contentKey.protocol(protocolId));
    await deleteContentOverrideAction(contentKey.protocolMeta(protocolId));
  } else if (!PROTOCOL_SEEDS.some((seed) => seed.id === protocolId)) {
    throw new Error("Unknown activity id");
  } else {
    await upsertContentOverrideAction(contentKey.protocol(protocolId), {
      deleted: true,
      active: false,
    });
    await deleteContentOverrideAction(contentKey.protocolMeta(protocolId));
  }

  try {
    await db
      .update(protocols)
      .set({ active: false })
      .where(eq(protocols.id, protocolId));
  } catch {
    // FK row may not exist yet for brand-new custom entries.
  }
}

export async function restoreAdminProtocolAction(
  protocolId: string,
): Promise<void> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  if (isCustomProtocolId(overrides, protocolId)) {
    throw new Error("Custom activities cannot be restored — create them again");
  }
  if (!PROTOCOL_SEEDS.some((seed) => seed.id === protocolId)) {
    throw new Error("Unknown activity id");
  }
  await deleteContentOverrideAction(contentKey.protocol(protocolId));
  await deleteContentOverrideAction(contentKey.protocolMeta(protocolId));
  await ensureProtocolInDb(protocolId);
}

export async function resetAdminProtocolOverridesAction(
  protocolId: string,
): Promise<void> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  if (isCustomProtocolId(overrides, protocolId)) {
    throw new Error("Custom activities cannot be reset — delete them instead");
  }
  await deleteContentOverrideAction(contentKey.protocol(protocolId));
  await deleteContentOverrideAction(contentKey.protocolMeta(protocolId));
}

export type AdminMitoEditorData = {
  entry: MitoEntry;
  hasOverride: boolean;
  isCustom: boolean;
  deleted: boolean;
};

export async function listAdminMitoEditorsAction(
  includeDeleted = false,
): Promise<
  {
    id: string;
    title: string;
    pillar: MitoPillar;
    deleted: boolean;
    isCustom: boolean;
  }[]
> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const rows = MITOVERSITY_ENTRIES.map((entry) => {
    const merged = mergeMitoEntry(entry, overrides);
    return {
      id: entry.id,
      title: merged.title,
      pillar: merged.pillar,
      deleted: isMitoDeleted(overrides, entry.id),
      isCustom: false,
    };
  });

  for (const id of getRegistryIds(overrides, REGISTRY_CUSTOM_MITO)) {
    const raw = overrides.get(contentKey.mito(id)) as MitoEntryOverride | undefined;
    if (!raw || typeof raw.title !== "string" || typeof raw.pillar !== "string") {
      continue;
    }
    rows.push({
      id,
      title: raw.title,
      pillar: raw.pillar as MitoPillar,
      deleted: false,
      isCustom: true,
    });
  }

  const visible = includeDeleted ? rows : rows.filter((row) => !row.deleted);
  return visible.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getAdminMitoEditorAction(
  entryId: string,
): Promise<AdminMitoEditorData | null> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const base = MITOVERSITY_ENTRIES.find((e) => e.id === entryId);
  const isCustom = isCustomMitoId(overrides, entryId);

  if (!base && !isCustom) return null;

  let entry: MitoEntry;
  if (base) {
    entry = mergeMitoEntry(base, overrides);
  } else {
    const raw = overrides.get(contentKey.mito(entryId)) as MitoEntryOverride | undefined;
    if (
      !raw ||
      typeof raw.title !== "string" ||
      typeof raw.summary !== "string" ||
      typeof raw.pillar !== "string" ||
      !Array.isArray(raw.sections)
    ) {
      return null;
    }
    entry = {
      id: entryId,
      title: raw.title,
      summary: raw.summary,
      pillar: raw.pillar as MitoPillar,
      sections: raw.sections,
      relatedProtocolIds: raw.relatedProtocolIds,
    };
  }

  const patch = overrides.get(contentKey.mito(entryId)) as
    | MitoEntryOverride
    | undefined;

  return {
    entry,
    hasOverride: patch != null,
    isCustom,
    deleted: isMitoDeleted(overrides, entryId),
  };
}

const mitoOverrideSchema = z.object({
  title: z.string().min(4).max(200).optional(),
  summary: z.string().min(4).max(500).optional(),
  pillar: z.enum(["light", "water", "magnetism", "support"]).optional(),
  relatedProtocolIds: z.string().optional(),
  sectionsJson: z.string().optional(),
});

export async function saveAdminMitoAction(
  entryId: string,
  raw: Record<string, unknown>,
): Promise<void> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const base = MITOVERSITY_ENTRIES.find((e) => e.id === entryId);
  const isCustom = isCustomMitoId(overrides, entryId);
  if (!base && !isCustom) throw new Error("Unknown article id");

  const parsed = mitoOverrideSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

  if (isCustom) {
    let sections = [{ heading: "Overview", body: "Add article content here." }];
    if (parsed.data.sectionsJson?.trim()) {
      try {
        sections = JSON.parse(parsed.data.sectionsJson) as MitoEntry["sections"];
        if (!Array.isArray(sections)) throw new Error("sections must be an array");
      } catch {
        throw new Error("Invalid sections JSON — use [{ heading, body }, …]");
      }
    }
    const entry: MitoEntry = {
      id: entryId,
      title: parsed.data.title ?? "New article",
      summary: parsed.data.summary ?? "Summary",
      pillar: parsed.data.pillar ?? "support",
      sections,
      relatedProtocolIds: parsed.data.relatedProtocolIds
        ? parsed.data.relatedProtocolIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
    await upsertContentOverrideAction(contentKey.mito(entryId), {
      ...entry,
    });
    return;
  }

  const patch: MitoEntryOverride = {};
  if (parsed.data.title) patch.title = parsed.data.title;
  if (parsed.data.summary) patch.summary = parsed.data.summary;
  if (parsed.data.pillar) patch.pillar = parsed.data.pillar;
  if (parsed.data.relatedProtocolIds !== undefined) {
    patch.relatedProtocolIds = parsed.data.relatedProtocolIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (parsed.data.sectionsJson?.trim()) {
    try {
      const sections = JSON.parse(parsed.data.sectionsJson) as MitoEntry["sections"];
      if (!Array.isArray(sections)) throw new Error("sections must be an array");
      patch.sections = sections;
    } catch {
      throw new Error("Invalid sections JSON — use [{ heading, body }, …]");
    }
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("No changes to save");
  }
  await upsertContentOverrideAction(contentKey.mito(entryId), patch);
}

export async function createAdminMitoAction(
  raw: Record<string, unknown>,
): Promise<string> {
  await requireAdmin();
  const id = String(raw.id ?? "").trim();
  if (!CONTENT_ID_RE.test(id)) {
    throw new Error("Id must use lowercase letters, numbers, and hyphens only");
  }
  if (MITOVERSITY_ENTRIES.some((entry) => entry.id === id)) {
    throw new Error("That id is already used by a built-in article");
  }

  const overrides = await loadContentOverrides();
  if (isCustomMitoId(overrides, id) || overrides.has(contentKey.mito(id))) {
    throw new Error("An article with that id already exists");
  }

  const parsed = mitoOverrideSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

  let sections = [{ heading: "Overview", body: "Add article content here." }];
  if (parsed.data.sectionsJson?.trim()) {
    try {
      sections = JSON.parse(parsed.data.sectionsJson) as MitoEntry["sections"];
      if (!Array.isArray(sections)) throw new Error("sections must be an array");
    } catch {
      throw new Error("Invalid sections JSON — use [{ heading, body }, …]");
    }
  }

  const entry: MitoEntry = {
    id,
    title: parsed.data.title ?? "New article",
    summary: parsed.data.summary ?? "Summary",
    pillar: parsed.data.pillar ?? "support",
    sections,
    relatedProtocolIds: parsed.data.relatedProtocolIds
      ? parsed.data.relatedProtocolIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  };

  const registry = getRegistryIds(overrides, REGISTRY_CUSTOM_MITO);
  await setCustomMitoRegistry([...registry, id]);
  await upsertContentOverrideAction(contentKey.mito(id), entry);
  return id;
}

export async function deleteAdminMitoAction(entryId: string): Promise<void> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const isCustom = isCustomMitoId(overrides, entryId);

  if (isCustom) {
    const registry = getRegistryIds(overrides, REGISTRY_CUSTOM_MITO).filter(
      (id) => id !== entryId,
    );
    await setCustomMitoRegistry(registry);
    await deleteContentOverrideAction(contentKey.mito(entryId));
  } else if (!MITOVERSITY_ENTRIES.some((entry) => entry.id === entryId)) {
    throw new Error("Unknown article id");
  } else {
    await upsertContentOverrideAction(contentKey.mito(entryId), {
      deleted: true,
      hidden: true,
    });
  }
}

export async function restoreAdminMitoAction(entryId: string): Promise<void> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  if (isCustomMitoId(overrides, entryId)) {
    throw new Error("Custom articles cannot be restored — create them again");
  }
  if (!MITOVERSITY_ENTRIES.some((entry) => entry.id === entryId)) {
    throw new Error("Unknown article id");
  }
  await deleteContentOverrideAction(contentKey.mito(entryId));
}

export async function resetAdminMitoOverrideAction(
  entryId: string,
): Promise<void> {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  if (isCustomMitoId(overrides, entryId)) {
    throw new Error("Custom articles cannot be reset — delete them instead");
  }
  await deleteContentOverrideAction(contentKey.mito(entryId));
}

export async function listAdminCategoryEditorsAction() {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const { CATEGORY_META } = await import("@/lib/categories");
  return CATEGORY_ORDER.map((id) => {
    const patch = overrides.get(contentKey.category(id)) as
      | CategoryOverride
      | undefined;
    const base = CATEGORY_META[id];
    return {
      id,
      label: patch?.label ?? base.label,
      blurb: patch?.blurb ?? base.blurb,
      hasOverride: patch != null,
    };
  });
}

export async function saveAdminCategoryAction(
  categoryId: ProtocolCategory,
  label: string,
  blurb: string,
): Promise<void> {
  await requireAdmin();
  const patch: CategoryOverride = { label: label.trim(), blurb: blurb.trim() };
  await upsertContentOverrideAction(contentKey.category(categoryId), patch);
}

export async function resetAdminCategoryAction(
  categoryId: ProtocolCategory,
): Promise<void> {
  await requireAdmin();
  await deleteContentOverrideAction(contentKey.category(categoryId));
}

export async function getAdminCopyEditorsAction() {
  await requireAdmin();
  const overrides = await loadContentOverrides();
  const mitoIntro =
    (overrides.get(contentKey.copy("mitoversity-intro")) as CopyOverride) ?? "";
  const mitoPillars = (["light", "water", "magnetism", "support"] as MitoPillar[]).map(
    (id) => ({
      id,
      label:
        (overrides.get(contentKey.copy(`mito-pillar:${id}`)) as string) ?? "",
    }),
  );
  const timeOfDay = TIME_OF_DAY_ORDER.map((id) => {
    const patch = overrides.get(contentKey.copy(`time-of-day:${id}`)) as
      | { label?: string; blurb?: string }
      | undefined;
    return { id, label: patch?.label ?? "", blurb: patch?.blurb ?? "" };
  });
  const lwm = LWM_PILLARS.map((p) => {
    const patch = overrides.get(contentKey.copy(`lwm-pillar:${p.id}`)) as
      | { label?: string; shortLabel?: string; blurb?: string }
      | undefined;
    return {
      id: p.id,
      label: patch?.label ?? "",
      shortLabel: patch?.shortLabel ?? "",
      blurb: patch?.blurb ?? "",
    };
  });
  return { mitoIntro, mitoPillars, timeOfDay, lwm };
}

export async function saveAdminCopyAction(
  key: string,
  value: unknown,
): Promise<void> {
  await requireAdmin();
  await upsertContentOverrideAction(contentKey.copy(key), value);
}

export async function resetAdminCopyAction(key: string): Promise<void> {
  await requireAdmin();
  await deleteContentOverrideAction(contentKey.copy(key));
}

export async function listContentOverrideKeysAction(): Promise<string[]> {
  await requireAdmin();
  const rows = await db.select({ key: contentOverrides.key }).from(contentOverrides);
  return rows.map((r) => r.key).sort();
}
