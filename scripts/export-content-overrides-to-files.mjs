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

const rows = await sql`select key, value from content_overrides order by key`;
console.log(`Found ${rows.length} content_overrides rows`);

const protocols = {};
const meta = {};
const mito = {};
const categories = {};
const copy = {};
const registries = {
  customProtocolIds: [],
  customMitoIds: [],
};
const unknown = [];

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
    meta[key.slice("protocol-meta:".length)] = value;
    continue;
  }
  if (key.startsWith("protocol:")) {
    protocols[key.slice("protocol:".length)] = value;
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
  "protocols.json": protocols,
  "protocol-meta.json": meta,
  "mitoversity.json": mito,
  "categories.json": categories,
  "copy.json": copy,
  "registries.json": registries,
};

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
  process.exit(0);
}

if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
for (const [name, data] of Object.entries(files)) {
  writeFileSync(
    path.join(dir, name),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf8",
  );
  console.log("Wrote", name);
}

if (clearDb) {
  await sql`delete from content_overrides`;
  console.log("Cleared content_overrides table");
} else {
  console.log("Left Neon content_overrides intact (pass --clear-db to delete).");
}

console.log("Done. App now reads content/ files; commit them to git.");
