/**
 * Build volcanic anchors for magnetism scoring from free catalogs.
 *
 * Inputs (run from repo root after download):
 *   data/volcano/github_volcanoes.csv  — TidyTuesday / GVP Holocene extract
 *   data/volcano/usgs_us.json          — USGS HANS getUSVolcanoes
 *
 * Output:
 *   src/lib/volcanic-anchors.data.ts
 *
 * Usage: node scripts/build-volcanic-anchors.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQ = false;
  while (i < text.length) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQ = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQ = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((x) => x.length)) rows.push(row);
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

/** Major arcs / hotspots / rifts — flowing-magma system midpoints. */
const SYSTEM_ANCHORS = [
  { name: "Mid-Atlantic Ridge (Iceland sector)", lat: 64.1, lng: -21.9 },
  { name: "East African Rift (Kenya sector)", lat: -1.3, lng: 36.8 },
  { name: "East African Rift (Ethiopia Afar)", lat: 11.8, lng: 41.0 },
  { name: "Hawaii hotspot (Kilauea–Mauna Loa)", lat: 19.4, lng: -155.3 },
  { name: "Yellowstone hotspot", lat: 44.43, lng: -110.67 },
  { name: "Galápagos hotspot", lat: -0.4, lng: -91.0 },
  { name: "Réunion hotspot", lat: -21.2, lng: 55.7 },
  { name: "Azores triple junction", lat: 38.7, lng: -27.2 },
  { name: "Canary Islands hotspot", lat: 28.3, lng: -16.6 },
  { name: "Cape Verde hotspot", lat: 14.95, lng: -24.35 },
  { name: "Central American volcanic arc (El Salvador)", lat: 13.7, lng: -89.2 },
  { name: "Andean Southern Volcanic Zone", lat: -38.0, lng: -71.5 },
  { name: "Andean Central Volcanic Zone", lat: -22.0, lng: -68.0 },
  { name: "Andean Northern Volcanic Zone", lat: 0.0, lng: -78.0 },
  { name: "Cascades arc (Mount St. Helens sector)", lat: 46.2, lng: -122.2 },
  { name: "Mexico Trans-Mexican Volcanic Belt", lat: 19.0, lng: -99.0 },
  { name: "Kamchatka arc", lat: 53.0, lng: 159.0 },
  { name: "Kuril arc", lat: 46.0, lng: 151.0 },
  { name: "Japan arc (Honshu)", lat: 35.4, lng: 138.7 },
  { name: "Ryukyu arc", lat: 27.0, lng: 128.5 },
  { name: "Philippines arc", lat: 14.6, lng: 121.0 },
  { name: "Indonesia Sunda arc", lat: -7.5, lng: 110.0 },
  { name: "Indonesia Banda arc", lat: -7.5, lng: 129.0 },
  { name: "Papua New Guinea arc", lat: -5.5, lng: 147.0 },
  { name: "Vanuatu / New Hebrides arc", lat: -16.5, lng: 168.0 },
  { name: "Tonga–Kermadec arc", lat: -21.0, lng: -175.0 },
  { name: "New Zealand Taupo volcanic zone", lat: -38.7, lng: 176.1 },
  { name: "Aleutian arc", lat: 54.0, lng: -166.0 },
  { name: "Italy Campanian arc", lat: 40.8, lng: 14.4 },
  { name: "Aegean arc (Santorini sector)", lat: 36.4, lng: 25.4 },
  { name: "Anatolian volcanic province", lat: 38.5, lng: 34.6 },
  { name: "Caribbean Lesser Antilles arc", lat: 15.0, lng: -61.3 },
  { name: "Antarctic West (Deception Island sector)", lat: -62.97, lng: -60.65 },
];

const gvpPath = path.join(root, "data/volcano/github_volcanoes.csv");
const usgsPath = path.join(root, "data/volcano/usgs_us.json");
const outPath = path.join(root, "src/lib/volcanic-anchors.data.ts");

if (!fs.existsSync(gvpPath)) {
  console.error("Missing", gvpPath);
  console.error(
    "Download: https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2020/2020-05-12/volcano.csv",
  );
  process.exit(1);
}

const byKey = new Map();

const csv = fs.readFileSync(gvpPath, "utf8");
const rows = parseCsv(csv);
const header = rows[0];
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

for (const r of rows.slice(1)) {
  const name = (r[idx.volcano_name] || "").trim();
  const lat = Number(r[idx.latitude]);
  const lng = Number(r[idx.longitude]);
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue;
  const vnum = (r[idx.volcano_number] || "").trim();
  const key = vnum || `name:${name.toLowerCase()}`;
  byKey.set(key, {
    name,
    lat: round4(lat),
    lng: round4(lng),
    source: "gvp",
  });
}

let usgsMerged = 0;
let usgsAdded = 0;
if (fs.existsSync(usgsPath)) {
  const us = JSON.parse(fs.readFileSync(usgsPath, "utf8"));
  for (const v of us) {
    const name = (v.volcano_name || "").trim();
    const lat = Number(v.latitude);
    const lng = Number(v.longitude);
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const vnum = String(v.vnum || "").trim();
    const key = vnum || `name:${name.toLowerCase()}`;
    const entry = {
      name,
      lat: round4(lat),
      lng: round4(lng),
      source: "usgs",
    };
    if (byKey.has(key)) {
      byKey.set(key, entry);
      usgsMerged++;
    } else {
      byKey.set(key, entry);
      usgsAdded++;
    }
  }
}

for (const s of SYSTEM_ANCHORS) {
  byKey.set(`sys:${s.name}`, {
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    source: "system",
  });
}

const list = [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));

const file = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Volcanic / active-magma anchors for lifestyle magnetism scoring.
 *
 * Sources (static snapshot; educational framework — not hazard alerts):
 * - Smithsonian GVP Holocene catalog via TidyTuesday volcano.csv (2020-05-12)
 *   https://github.com/rfordatascience/tidytuesday
 * - USGS HANS getUSVolcanoes (US / territories)
 * - Major arc / hotspot / rift system midpoints
 *
 * Cite: Global Volcanism Program, Smithsonian Institution (https://volcano.si.edu/)
 *       USGS Volcano Hazards Program (https://volcanoes.usgs.gov/)
 *
 * Regenerate: node scripts/build-volcanic-anchors.mjs
 */

export type VolcanicAnchor = {
  name: string;
  lat: number;
  lng: number;
  /** gvp = Holocene catalog, usgs = US catalog, system = arc/rift midpoint */
  source: "gvp" | "usgs" | "system";
};

export const VOLCANIC_ANCHORS: readonly VolcanicAnchor[] = ${JSON.stringify(
  list,
  null,
  2,
)} as const;

export const VOLCANIC_ANCHOR_COUNT = ${list.length} as const;
`;

fs.writeFileSync(outPath, file);
console.log(
  JSON.stringify(
    {
      total: list.length,
      gvp: list.filter((x) => x.source === "gvp").length,
      usgs: list.filter((x) => x.source === "usgs").length,
      system: list.filter((x) => x.source === "system").length,
      usgsMerged,
      usgsAdded,
      out: path.relative(root, outPath),
    },
    null,
    2,
  ),
);
