/**
 * Git-tracked content overlays (Admin Content saves here — not Neon).
 *
 * Layout under content/:
 *   activities.json        — one object per activity (definition + how-to + options)
 *   articles/<id>.json     — one file per Mitoversity article (flat format)
 *   categories.json, copy.json, registries.json
 *
 * Server-only — never import from client components.
 */

import "server-only";

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

/** Same shape as content-overrides OverrideMap (avoid circular import). */
export type ContentOverrideMap = Map<string, unknown>;

const REGISTRY_CUSTOM_PROTOCOLS = "registry:custom-protocol-ids";
const REGISTRY_CUSTOM_MITO = "registry:custom-mito-ids";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");

/** Fields that belong with how-to / options (not the protocol seed patch). */
const ACTIVITY_META_KEYS = new Set([
  "how",
  "equipment",
  "articleId",
  "options",
]);

type JsonRecord = Record<string, unknown>;

function filePath(name: string): string {
  return path.join(CONTENT_DIR, name);
}

function articleFilePath(id: string): string {
  return path.join(ARTICLES_DIR, `${id}.json`);
}

function ensureArticlesDir(): void {
  if (!existsSync(ARTICLES_DIR)) {
    mkdirSync(ARTICLES_DIR, { recursive: true });
  }
}

/** Load all content/articles/*.json as mito:<id> full documents. */
export function loadArticleFiles(): ContentOverrideMap {
  const map: ContentOverrideMap = new Map();
  if (!existsSync(ARTICLES_DIR)) {
    // Legacy single-file overlay
    const mito = readJsonFile("mitoversity.json");
    for (const [id, value] of Object.entries(mito)) {
      map.set(`mito:${id}`, value);
    }
    return map;
  }
  for (const name of readdirSync(ARTICLES_DIR)) {
    if (!name.endsWith(".json")) continue;
    const id = name.slice(0, -".json".length);
    if (!id) continue;
    try {
      const raw = readFileSync(articleFilePath(id), "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        continue;
      }
      const entry = parsed as JsonRecord;
      map.set(`mito:${id}`, { ...entry, id });
    } catch {
      // skip bad files
    }
  }
  return map;
}

function writeArticleFile(id: string, value: unknown): void {
  ensureArticlesDir();
  const entry =
    value && typeof value === "object" && !Array.isArray(value)
      ? { ...(value as JsonRecord) }
      : {};
  // Filename is the source of id; keep id inside for readability.
  entry.id = id;
  writeFileSync(
    articleFilePath(id),
    `${JSON.stringify(entry, null, 2)}\n`,
    "utf8",
  );
}

function deleteArticleFile(id: string): void {
  const p = articleFilePath(id);
  if (existsSync(p)) unlinkSync(p);
}

function readArticleFile(id: string): JsonRecord | null {
  const p = articleFilePath(id);
  if (!existsSync(p)) return null;
  try {
    const parsed = JSON.parse(readFileSync(p, "utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as JsonRecord;
  } catch {
    return null;
  }
}

function readJsonFile(name: string): JsonRecord {
  const p = filePath(name);
  if (!existsSync(p)) return {};
  try {
    const raw = readFileSync(p, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as JsonRecord;
  } catch {
    return {};
  }
}

function writeJsonFile(name: string, data: JsonRecord): void {
  if (!existsSync(CONTENT_DIR)) {
    mkdirSync(CONTENT_DIR, { recursive: true });
  }
  writeJsonFileSorted(name, data);
}

function writeJsonFileSorted(name: string, data: JsonRecord): void {
  const sorted: JsonRecord = {};
  for (const key of Object.keys(data).sort()) {
    sorted[key] = data[key];
  }
  writeFileSync(filePath(name), `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}

/** True when Admin may persist catalog edits to disk. */
export function canWriteContentFiles(): boolean {
  if (process.env.CONTENT_FILE_WRITE === "1") return true;
  if (process.env.CONTENT_FILE_WRITE === "0") return false;
  return process.env.NODE_ENV === "development";
}

export function contentWriteBlockedMessage(): string {
  return (
    "Content edits save to files under content/ and only work in local development " +
    "(or when CONTENT_FILE_WRITE=1). Edit locally, commit, and deploy."
  );
}

function assertCanWrite(): void {
  if (!canWriteContentFiles()) {
    throw new Error(contentWriteBlockedMessage());
  }
}

function splitActivity(entry: unknown): {
  protocol: JsonRecord;
  meta: JsonRecord;
} {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return { protocol: {}, meta: {} };
  }
  const protocol: JsonRecord = {};
  const meta: JsonRecord = {};
  for (const [key, value] of Object.entries(entry as JsonRecord)) {
    if (ACTIVITY_META_KEYS.has(key)) meta[key] = value;
    else protocol[key] = value;
  }
  return { protocol, meta };
}

/** Load activities.json, with legacy protocols.json + protocol-meta.json fallback. */
function readActivitiesFile(): JsonRecord {
  const unified = readJsonFile("activities.json");
  if (Object.keys(unified).length > 0) return unified;

  const protocols = readJsonFile("protocols.json");
  const meta = readJsonFile("protocol-meta.json");
  const ids = new Set([
    ...Object.keys(protocols),
    ...Object.keys(meta),
  ]);
  const merged: JsonRecord = {};
  for (const id of ids) {
    const p =
      protocols[id] && typeof protocols[id] === "object"
        ? (protocols[id] as JsonRecord)
        : {};
    const m =
      meta[id] && typeof meta[id] === "object"
        ? (meta[id] as JsonRecord)
        : {};
    merged[id] = { ...p, ...m };
  }
  return merged;
}

/**
 * Build the same OverrideMap shape formerly loaded from Neon content_overrides.
 * Activity rows are split into protocol: / protocol-meta: keys for existing merge code.
 */
export function loadContentFiles(): ContentOverrideMap {
  const map: ContentOverrideMap = new Map();

  const activities = readActivitiesFile();
  for (const [id, value] of Object.entries(activities)) {
    const { protocol, meta } = splitActivity(value);
    if (Object.keys(protocol).length > 0) {
      map.set(`protocol:${id}`, protocol);
    }
    if (Object.keys(meta).length > 0) {
      map.set(`protocol-meta:${id}`, meta);
    }
  }

  for (const [key, value] of loadArticleFiles()) {
    map.set(key, value);
  }

  const categories = readJsonFile("categories.json");
  for (const [id, value] of Object.entries(categories)) {
    map.set(`category:${id}`, value);
  }

  const copy = readJsonFile("copy.json");
  for (const [id, value] of Object.entries(copy)) {
    map.set(`copy:${id}`, value);
  }

  const registries = readJsonFile("registries.json");
  const customProtocols = registries.customProtocolIds;
  const customMito = registries.customMitoIds;
  if (Array.isArray(customProtocols)) {
    map.set(REGISTRY_CUSTOM_PROTOCOLS, customProtocols);
  }
  if (Array.isArray(customMito)) {
    map.set(REGISTRY_CUSTOM_MITO, customMito);
  }

  return map;
}

function idFromPrefixedKey(key: string, prefix: string): string | null {
  if (!key.startsWith(prefix)) return null;
  return key.slice(prefix.length);
}

function readActivityEntry(id: string): JsonRecord {
  const activities = readActivitiesFile();
  const raw = activities[id];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return { ...(raw as JsonRecord) };
}

function writeActivityEntry(id: string, entry: JsonRecord): void {
  const activities = readActivitiesFile();
  if (Object.keys(entry).length === 0) {
    delete activities[id];
  } else {
    activities[id] = entry;
  }
  writeJsonFile("activities.json", activities);
}

/** Upsert one override key into the matching content/*.json file. */
export function upsertContentFileKey(key: string, value: unknown): void {
  assertCanWrite();

  if (key === REGISTRY_CUSTOM_PROTOCOLS) {
    const registries = readJsonFile("registries.json");
    registries.customProtocolIds = value;
    writeJsonFile("registries.json", registries);
    return;
  }
  if (key === REGISTRY_CUSTOM_MITO) {
    const registries = readJsonFile("registries.json");
    registries.customMitoIds = value;
    writeJsonFile("registries.json", registries);
    return;
  }

  const protocolId = idFromPrefixedKey(key, "protocol:");
  if (protocolId != null && !key.startsWith("protocol-meta:")) {
    const existing = readActivityEntry(protocolId);
    const { meta } = splitActivity(existing);
    const patch =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as JsonRecord)
        : {};
    // Drop any accidental meta keys from a protocol patch; keep existing meta.
    const protocolOnly: JsonRecord = {};
    for (const [k, v] of Object.entries(patch)) {
      if (!ACTIVITY_META_KEYS.has(k)) protocolOnly[k] = v;
    }
    writeActivityEntry(protocolId, { ...protocolOnly, ...meta });
    return;
  }

  const metaId = idFromPrefixedKey(key, "protocol-meta:");
  if (metaId != null) {
    const existing = readActivityEntry(metaId);
    const { protocol } = splitActivity(existing);
    const patch =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as JsonRecord)
        : {};
    const metaOnly: JsonRecord = {};
    for (const [k, v] of Object.entries(patch)) {
      if (ACTIVITY_META_KEYS.has(k)) metaOnly[k] = v;
    }
    // Preserve options (and other meta) when Admin saves how/equipment only.
    const prevMeta = splitActivity(existing).meta;
    writeActivityEntry(metaId, {
      ...protocol,
      ...prevMeta,
      ...metaOnly,
    });
    return;
  }

  const mitoId = idFromPrefixedKey(key, "mito:");
  if (mitoId != null) {
    const existing = readArticleFile(mitoId) ?? {};
    const patch =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as JsonRecord)
        : {};
    writeArticleFile(mitoId, {
      ...existing,
      ...patch,
      id: mitoId,
      flatArticle: patch.flatArticle !== false,
    });
    return;
  }

  const categoryId = idFromPrefixedKey(key, "category:");
  if (categoryId != null) {
    const data = readJsonFile("categories.json");
    data[categoryId] = value as unknown;
    writeJsonFile("categories.json", data);
    return;
  }

  const copyId = idFromPrefixedKey(key, "copy:");
  if (copyId != null) {
    const data = readJsonFile("copy.json");
    data[copyId] = value as unknown;
    writeJsonFile("copy.json", data);
    return;
  }

  throw new Error(`Unknown content key: ${key}`);
}

/** Remove one override key from content files. */
export function deleteContentFileKey(key: string): void {
  assertCanWrite();

  if (key === REGISTRY_CUSTOM_PROTOCOLS) {
    const registries = readJsonFile("registries.json");
    delete registries.customProtocolIds;
    writeJsonFile("registries.json", registries);
    return;
  }
  if (key === REGISTRY_CUSTOM_MITO) {
    const registries = readJsonFile("registries.json");
    delete registries.customMitoIds;
    writeJsonFile("registries.json", registries);
    return;
  }

  const protocolId = idFromPrefixedKey(key, "protocol:");
  if (protocolId != null && !key.startsWith("protocol-meta:")) {
    const existing = readActivityEntry(protocolId);
    const { meta } = splitActivity(existing);
    // Soft-delete / reset: keep meta if present, else remove the row.
    if (Object.keys(meta).length === 0) {
      writeActivityEntry(protocolId, {});
    } else {
      writeActivityEntry(protocolId, meta);
    }
    return;
  }

  const metaId = idFromPrefixedKey(key, "protocol-meta:");
  if (metaId != null) {
    const existing = readActivityEntry(metaId);
    const { protocol } = splitActivity(existing);
    if (Object.keys(protocol).length === 0) {
      writeActivityEntry(metaId, {});
    } else {
      writeActivityEntry(metaId, protocol);
    }
    return;
  }

  const mitoId = idFromPrefixedKey(key, "mito:");
  if (mitoId != null) {
    deleteArticleFile(mitoId);
    return;
  }

  const categoryId = idFromPrefixedKey(key, "category:");
  if (categoryId != null) {
    const data = readJsonFile("categories.json");
    delete data[categoryId];
    writeJsonFile("categories.json", data);
    return;
  }

  const copyId = idFromPrefixedKey(key, "copy:");
  if (copyId != null) {
    const data = readJsonFile("copy.json");
    delete data[copyId];
    writeJsonFile("copy.json", data);
    return;
  }

  throw new Error(`Unknown content key: ${key}`);
}

/** Replace all content files from a flat key→value map (export script). */
export function writeAllContentFromOverrideMap(map: ContentOverrideMap): void {
  assertCanWrite();
  const activities: JsonRecord = {};
  const categories: JsonRecord = {};
  const copy: JsonRecord = {};
  const registries: JsonRecord = {};

  for (const [key, value] of map) {
    if (key === REGISTRY_CUSTOM_PROTOCOLS) {
      registries.customProtocolIds = value;
      continue;
    }
    if (key === REGISTRY_CUSTOM_MITO) {
      registries.customMitoIds = value;
      continue;
    }
    const protocolId = idFromPrefixedKey(key, "protocol:");
    if (protocolId != null && !key.startsWith("protocol-meta:")) {
      const prev =
        activities[protocolId] && typeof activities[protocolId] === "object"
          ? (activities[protocolId] as JsonRecord)
          : {};
      const { meta } = splitActivity(prev);
      const patch =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as JsonRecord)
          : {};
      activities[protocolId] = { ...patch, ...meta };
      continue;
    }
    const metaId = idFromPrefixedKey(key, "protocol-meta:");
    if (metaId != null) {
      const prev =
        activities[metaId] && typeof activities[metaId] === "object"
          ? (activities[metaId] as JsonRecord)
          : {};
      const { protocol } = splitActivity(prev);
      const patch =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as JsonRecord)
          : {};
      activities[metaId] = { ...protocol, ...patch };
      continue;
    }
    const mitoId = idFromPrefixedKey(key, "mito:");
    if (mitoId != null) {
      writeArticleFile(mitoId, value);
      continue;
    }
    const categoryId = idFromPrefixedKey(key, "category:");
    if (categoryId != null) {
      categories[categoryId] = value as unknown;
      continue;
    }
    const copyId = idFromPrefixedKey(key, "copy:");
    if (copyId != null) {
      copy[copyId] = value as unknown;
    }
  }

  writeJsonFile("activities.json", activities);
  writeJsonFile("categories.json", categories);
  writeJsonFile("copy.json", copy);
  writeJsonFile("registries.json", registries);
}
