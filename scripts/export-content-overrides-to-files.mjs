/**
 * One-time: copy Neon content_overrides into content/*.json, then optionally
 * delete those keys from Neon.
 *
 *   node scripts/export-content-overrides-to-files.mjs          # dry-run
 *   node scripts/export-content-overrides-to-files.mjs --write  # write files
 *   node scripts/export-content-overrides-to-files.mjs --write --clear-db
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";
import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const write = process.argv.includes("--write");
const clearDb = process.argv.includes("--clear-db");
const sql = neon(url);

const REGISTRY_CUSTOM_PROTOCOLS = "registry:custom-protocol-ids";
const REGISTRY_CUSTOM_MITO = "registry:custom-mito-ids";
const META_KEYS = new Set(["how", "equipment", "articleId", "options"]);

const rows = await sql`select key, value from content_overrides order by key`;
console.log(`Found ${rows.length} content_overrides rows`);

const activities = {};
const mito = {};
const categories = {};
const copy = {};
const registries = {
  customProtocolIds: [],
  customMitoIds: [],
};
const unknown = [];

function ensureActivity(id) {
  if (!activities[id] || typeof activities[id] !== "object") {
    activities[id] = {};
  }
  return activities[id];
}

for (const row of rows) {
  const key = row.key;
  const value = row.value;
  if (key === REGISTRY_CUSTOM_PROTOCOLS && Array.isArray(value)) {
    registries.customProtocolIds = value;
    continue;
  }
  if (key === REGISTRY_CUSTOM_MITO && Array.isArray(value)) {
    registries.customMitoIds = value;
    continue;
  }
  if (key.startsWith("protocol-meta:")) {
    const id = key.slice("protocol-meta:".length);
    const entry = ensureActivity(id);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(entry, value);
    }
    continue;
  }
  if (key.startsWith("protocol:")) {
    const id = key.slice("protocol:".length);
    const entry = ensureActivity(id);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value)) {
        if (!META_KEYS.has(k)) entry[k] = v;
      }
    }
    continue;
  }
  if (key.startsWith("mito:")) {
    mito[key.slice("mito:".length)] = value;
    continue;
  }
  if (key.startsWith("category:")) {
    categories[key.slice("category:".length)] = value;
    continue;
  }
  if (key.startsWith("copy:")) {
    copy[key.slice("copy:".length)] = value;
    continue;
  }
  unknown.push(key);
}

if (unknown.length) {
  console.warn("Skipped unknown keys:", unknown);
}

const dir = path.join(process.cwd(), "content");
const files = {
  "activities.json": activities,
  "categories.json": categories,
  "copy.json": copy,
  "registries.json": registries,
};
// Articles → content/articles/<id>.json
const articlesDir = path.join(dir, "articles");

if (!write) {
  console.log("Dry-run only. Re-run with --write to save files.");
  for (const [name, data] of Object.entries(files)) {
    const n = Array.isArray(data)
      ? data.length
      : Object.keys(data).filter((k) => {
          const v = data[k];
          return !(Array.isArray(v) && v.length === 0);
        }).length;
    console.log(`  ${name}: ${n} entries`);
  }
  console.log(`  articles/: ${Object.keys(mito).length} entries`);
  process.exit(0);
}

if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
if (!existsSync(articlesDir)) mkdirSync(articlesDir, { recursive: true });
for (const [name, data] of Object.entries(files)) {
  const sorted = {};
  for (const key of Object.keys(data).sort()) sorted[key] = data[key];
  writeFileSync(
    path.join(dir, name),
    `${JSON.stringify(sorted, null, 2)}\n`,
    "utf8",
  );
  console.log("Wrote", name);
}
for (const [id, value] of Object.entries(mito)) {
  const entry =
    value && typeof value === "object" && !Array.isArray(value)
      ? { ...value, id, flatArticle: true }
      : { id, flatArticle: true };
  writeFileSync(
    path.join(articlesDir, `${id}.json`),
    `${JSON.stringify(entry, null, 2)}\n`,
    "utf8",
  );
}
console.log(`Wrote ${Object.keys(mito).length} files under articles/`);

if (clearDb) {
  await sql`delete from content_overrides`;
  console.log("Cleared content_overrides table");
} else {
  console.log("Left Neon content_overrides intact (pass --clear-db to delete).");
}

console.log("Done. App now reads content/ files; commit them to git.");
