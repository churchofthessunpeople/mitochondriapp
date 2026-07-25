/**
 * Git-tracked content overlays (Admin Content saves here — not Neon).
 *
 * Layout under content/:
 *   protocols.json, protocol-meta.json, mitoversity.json,
 *   categories.json, copy.json, registries.json
 *
 * Server-only — never import from client components.
 */

import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Same shape as content-overrides OverrideMap (avoid circular import). */
export type ContentOverrideMap = Map<string, unknown>;

const REGISTRY_CUSTOM_PROTOCOLS = "registry:custom-protocol-ids";
const REGISTRY_CUSTOM_MITO = "registry:custom-mito-ids";

const CONTENT_DIR = path.join(process.cwd(), "content");

type JsonRecord = Record<string, unknown>;

function filePath(name: string): string {
  return path.join(CONTENT_DIR, name);
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
  writeFileSync(filePath(name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
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

/**
 * Build the same OverrideMap shape formerly loaded from Neon content_overrides.
 */
export function loadContentFiles(): ContentOverrideMap {
  const map: ContentOverrideMap = new Map();

  const protocols = readJsonFile("protocols.json");
  for (const [id, value] of Object.entries(protocols)) {
    map.set(`protocol:${id}`, value);
  }

  const meta = readJsonFile("protocol-meta.json");
  for (const [id, value] of Object.entries(meta)) {
    map.set(`protocol-meta:${id}`, value);
  }

  const mito = readJsonFile("mitoversity.json");
  for (const [id, value] of Object.entries(mito)) {
    map.set(`mito:${id}`, value);
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
    const data = readJsonFile("protocols.json");
    data[protocolId] = value as unknown;
    writeJsonFile("protocols.json", data);
    return;
  }

  const metaId = idFromPrefixedKey(key, "protocol-meta:");
  if (metaId != null) {
    const data = readJsonFile("protocol-meta.json");
    data[metaId] = value as unknown;
    writeJsonFile("protocol-meta.json", data);
    return;
  }

  const mitoId = idFromPrefixedKey(key, "mito:");
  if (mitoId != null) {
    const data = readJsonFile("mitoversity.json");
    data[mitoId] = value as unknown;
    writeJsonFile("mitoversity.json", data);
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
    const data = readJsonFile("protocols.json");
    delete data[protocolId];
    writeJsonFile("protocols.json", data);
    return;
  }

  const metaId = idFromPrefixedKey(key, "protocol-meta:");
  if (metaId != null) {
    const data = readJsonFile("protocol-meta.json");
    delete data[metaId];
    writeJsonFile("protocol-meta.json", data);
    return;
  }

  const mitoId = idFromPrefixedKey(key, "mito:");
  if (mitoId != null) {
    const data = readJsonFile("mitoversity.json");
    delete data[mitoId];
    writeJsonFile("mitoversity.json", data);
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
  const protocols: JsonRecord = {};
  const meta: JsonRecord = {};
  const mito: JsonRecord = {};
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
      protocols[protocolId] = value as unknown;
      continue;
    }
    const metaId = idFromPrefixedKey(key, "protocol-meta:");
    if (metaId != null) {
      meta[metaId] = value as unknown;
      continue;
    }
    const mitoId = idFromPrefixedKey(key, "mito:");
    if (mitoId != null) {
      mito[mitoId] = value as unknown;
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

  writeJsonFile("protocols.json", protocols);
  writeJsonFile("protocol-meta.json", meta);
  writeJsonFile("mitoversity.json", mito);
  writeJsonFile("categories.json", categories);
  writeJsonFile("copy.json", copy);
  writeJsonFile("registries.json", registries);
}
