/**
 * Artificial EM / infrastructure load proxy (not a personal exposure meter).
 *
 * Sources (best-effort):
 * - OpenCelliD getInArea when OPENCELLID_API_KEY is set and returns data
 * - OpenStreetMap Overpass: communication masts / mobile towers
 * - OpenStreetMap: nearby power plants (distance)
 * - OpenStreetMap building count (~1.5 km) as population / device-density proxy
 *
 * Educational lifestyle framework only.
 */

export type PopulationDensityBand =
  | "rural"
  | "low"
  | "suburban"
  | "urban"
  | "dense";

export type ArtificialEmSnapshot = {
  /** 1 = quiet / rural proxy … 5 = dense infrastructure proxy */
  loadScore: number;
  loadLabel: string;
  /** Mapped radio cells (OpenCelliD), if any */
  cellCount: number | null;
  /** OSM communication masts / towers in radius */
  mastCount: number;
  /** OSM buildings in ~1.5 km — population / device-density proxy */
  buildingCount?: number | null;
  /** Coarse density band from building count */
  populationDensityBand?: PopulationDensityBand | null;
  /** Soft score bump applied from density (0–2) */
  densityBump?: number;
  /** Nearest power plant distance km, if found within search */
  nearestPlantKm: number | null;
  nearestPlantName: string | null;
  radiusKm: number;
  sources: string[];
  summaryLine: string;
  detailLine: string;
};

/** True when snapshot predates population-density fields (force re-fetch). */
export function artificialEmNeedsRefresh(
  em: ArtificialEmSnapshot | null | undefined,
): boolean {
  if (!em) return true;
  return !("populationDensityBand" in em) && !("buildingCount" in em);
}

const CELL_RADIUS_M = 2000; // OpenCelliD BBOX limit ~4 km²
const MAST_RADIUS_M = 5000;
const BUILDING_RADIUS_M = 1500;
const PLANT_RADIUS_M = 40_000;

function roundCoord(n: number, places = 2): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

function loadLabel(score: number): string {
  switch (score) {
    case 1:
      return "Low";
    case 2:
      return "Moderate-low";
    case 3:
      return "Moderate";
    case 4:
      return "Elevated";
    default:
      return "High";
  }
}

/** Map infrastructure density to 1–5 load (higher = more artificial EM infrastructure). */
export function scoreArtificialEmLoad(opts: {
  cellCount: number | null;
  mastCount: number;
  nearestPlantKm: number | null;
  /** Soft device-density bump from population/buildings (0–2) */
  densityBump?: number;
}): number {
  let score = 1;

  // Cellular / mast density in ~5 km (or OCID ~2 km box scaled)
  const masts = opts.mastCount;
  const cells = opts.cellCount ?? 0;
  // Prefer cells when present; else masts (sparser OSM tags)
  if (opts.cellCount != null && opts.cellCount > 0) {
    if (cells >= 80) score = Math.max(score, 5);
    else if (cells >= 40) score = Math.max(score, 4);
    else if (cells >= 15) score = Math.max(score, 3);
    else if (cells >= 5) score = Math.max(score, 2);
  } else {
    if (masts >= 25) score = Math.max(score, 5);
    else if (masts >= 12) score = Math.max(score, 4);
    else if (masts >= 5) score = Math.max(score, 3);
    else if (masts >= 2) score = Math.max(score, 2);
    else if (masts >= 1) score = Math.max(score, 2);
  }

  // Large power plant nearby bumps load
  const pk = opts.nearestPlantKm;
  if (pk != null) {
    if (pk <= 5) score = Math.min(5, score + 2);
    else if (pk <= 15) score = Math.min(5, score + 1);
  }

  const bump = Math.max(0, Math.min(2, opts.densityBump ?? 0));
  score = Math.min(5, score + bump);

  return Math.max(1, Math.min(5, score));
}

/**
 * Map OSM building count (~1.5 km) to a density band.
 * Proxy for people + consumer devices that open maps miss.
 */
export function populationDensityBandFromBuildings(
  buildingCount: number | null | undefined,
): PopulationDensityBand | null {
  if (buildingCount == null || !Number.isFinite(buildingCount)) return null;
  const n = Math.max(0, Math.trunc(buildingCount));
  if (n < 80) return "rural";
  if (n < 400) return "low";
  if (n < 1500) return "suburban";
  if (n < 5000) return "urban";
  return "dense";
}

/**
 * Soft bump from human density: denser places → more phones/Wi‑Fi/APs.
 * Extra +1 when mapped towers look quiet but buildings say people are dense
 * (fills OpenCelliD/OSM mast gaps).
 */
export function densityBumpFromBand(
  band: PopulationDensityBand | null,
  infraScoreBeforeBump: number,
): number {
  if (!band) return 0;
  if (band === "dense") {
    return infraScoreBeforeBump <= 2 ? 2 : 1;
  }
  if (band === "urban") {
    return infraScoreBeforeBump <= 2 ? 2 : 1;
  }
  if (band === "suburban") {
    return infraScoreBeforeBump <= 2 ? 1 : 0;
  }
  return 0;
}

export function formatPopulationDensityBand(
  band: PopulationDensityBand | null,
): string | null {
  if (!band) return null;
  switch (band) {
    case "rural":
      return "Rural";
    case "low":
      return "Low density";
    case "suburban":
      return "Suburban";
    case "urban":
      return "Urban";
    case "dense":
      return "Dense urban";
  }
}

/**
 * OpenCelliD cells in a small BBOX (~OCID max area).
 * Returns null if key missing, error, or no data (caller uses OSM).
 */
export async function fetchOpenCellIdCount(
  latitude: number,
  longitude: number,
): Promise<number | null> {
  const key = process.env.OPENCELLID_API_KEY?.trim();
  if (!key) return null;

  // ~1.2 km half-width keeps area under OpenCelliD's 4e6 m² limit
  const dLat = 0.0055;
  const dLon = 0.0055 / Math.max(0.2, Math.cos((latitude * Math.PI) / 180));
  const minLon = longitude - dLon;
  const minLat = latitude - dLat;
  const maxLon = longitude + dLon;
  const maxLat = latitude + dLat;
  const bbox = `${minLon.toFixed(5)},${minLat.toFixed(5)},${maxLon.toFixed(5)},${maxLat.toFixed(5)}`;

  const url = `https://opencellid.org/cell/getInArea?key=${encodeURIComponent(key)}&BBOX=${bbox}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json, application/xml, text/xml, */*",
        "User-Agent": "Mitochondriapp/1.0 (place-context)",
      },
      next: { revalidate: 60 * 60 * 24 * 3 },
      signal: AbortSignal.timeout(4000),
    });
    const text = await res.text();

    if (text.includes("API Key not known") || text.includes("Invalid API")) {
      console.warn("[artificial-em] OpenCelliD key rejected");
      return null;
    }
    if (text.includes("No cells found")) return 0;
    if (text.includes("stat=\"fail\"") || text.includes('"error"')) {
      return null;
    }

    // KML: count Placemark
    const placemarks = text.match(/<Placemark/gi);
    if (placemarks) return placemarks.length;

    // JSON array
    try {
      const data = JSON.parse(text) as unknown;
      if (Array.isArray(data)) return data.length;
      if (
        data &&
        typeof data === "object" &&
        Array.isArray((data as { cells?: unknown }).cells)
      ) {
        return (data as { cells: unknown[] }).cells.length;
      }
    } catch {
      /* not json */
    }

    return null;
  } catch {
    return null;
  }
}

type OverpassEl = {
  type: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

async function overpassQuery(query: string): Promise<OverpassEl[]> {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: "data=" + encodeURIComponent(query),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mitochondriapp/1.0 (place-context)",
        },
        next: { revalidate: 60 * 60 * 24 * 3 },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { elements?: OverpassEl[] };
      return data.elements ?? [];
    } catch {
      /* try next */
    }
  }
  return [];
}

export async function fetchOsmMastCount(
  latitude: number,
  longitude: number,
  radiusM = MAST_RADIUS_M,
): Promise<number> {
  const lat = roundCoord(latitude, 3);
  const lon = roundCoord(longitude, 3);
  const q = `[out:json][timeout:20];
(
  node["man_made"="mast"](around:${radiusM},${lat},${lon});
  node["tower:type"="communication"](around:${radiusM},${lat},${lon});
  node["communication:mobile"](around:${radiusM},${lat},${lon});
  node["man_made"="tower"]["tower:type"="communication"](around:${radiusM},${lat},${lon});
  way["man_made"="mast"](around:${radiusM},${lat},${lon});
);
out center;`;
  const els = await overpassQuery(q);
  return els.length;
}

/** Building count in radius via Overpass `out count` — population / device proxy. */
export async function fetchOsmBuildingCount(
  latitude: number,
  longitude: number,
  radiusM = BUILDING_RADIUS_M,
): Promise<number | null> {
  const lat = roundCoord(latitude, 3);
  const lon = roundCoord(longitude, 3);
  const q = `[out:json][timeout:15];
way["building"](around:${radiusM},${lat},${lon});
out count;`;
  const els = await overpassQuery(q);
  const countEl = els.find((e) => e.type === "count");
  const tags = countEl?.tags;
  if (!tags) return null;
  const raw = tags.ways ?? tags.total ?? tags.nodes;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : null;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export async function fetchNearestPowerPlant(
  latitude: number,
  longitude: number,
  radiusM = PLANT_RADIUS_M,
): Promise<{ name: string; km: number } | null> {
  const lat = roundCoord(latitude, 3);
  const lon = roundCoord(longitude, 3);
  const q = `[out:json][timeout:20];
(
  node["power"="plant"](around:${radiusM},${lat},${lon});
  way["power"="plant"](around:${radiusM},${lat},${lon});
  relation["power"="plant"](around:${radiusM},${lat},${lon});
);
out center tags;`;
  const els = await overpassQuery(q);
  let best: { name: string; km: number } | null = null;
  for (const el of els) {
    const elat = el.lat ?? el.center?.lat;
    const elon = el.lon ?? el.center?.lon;
    if (elat == null || elon == null) continue;
    const km = haversineKm(latitude, longitude, elat, elon);
    const name =
      el.tags?.name ||
      el.tags?.["name:en"] ||
      el.tags?.plant ||
      "Power plant";
    if (!best || km < best.km) best = { name, km };
  }
  return best;
}

export async function fetchArtificialEmSnapshot(
  latitude: number,
  longitude: number,
): Promise<ArtificialEmSnapshot> {
  const sources: string[] = [];

  const [cellCount, mastCount, buildingCount, plant] = await Promise.all([
    fetchOpenCellIdCount(latitude, longitude),
    fetchOsmMastCount(latitude, longitude),
    fetchOsmBuildingCount(latitude, longitude),
    fetchNearestPowerPlant(latitude, longitude),
  ]);

  if (cellCount != null) sources.push("OpenCelliD");
  sources.push("OpenStreetMap");

  const infraBeforeDensity = scoreArtificialEmLoad({
    cellCount,
    mastCount,
    nearestPlantKm: plant?.km ?? null,
    densityBump: 0,
  });
  const populationDensityBand =
    populationDensityBandFromBuildings(buildingCount);
  const densityBump = densityBumpFromBand(
    populationDensityBand,
    infraBeforeDensity,
  );
  const loadScore = scoreArtificialEmLoad({
    cellCount,
    mastCount,
    nearestPlantKm: plant?.km ?? null,
    densityBump,
  });

  const parts: string[] = [];
  if (cellCount != null && cellCount > 0) {
    parts.push(`${cellCount} mapped cells (~2 km)`);
  }
  parts.push(
    `${mastCount} mapped mast${mastCount === 1 ? "" : "s"} / towers (5 km)`,
  );
  if (buildingCount != null) {
    const bandLabel = formatPopulationDensityBand(populationDensityBand);
    parts.push(
      `${buildingCount.toLocaleString()} buildings (~1.5 km)${
        bandLabel ? ` · ${bandLabel.toLowerCase()}` : ""
      }${densityBump > 0 ? ` · density +${densityBump}` : ""}`,
    );
  }
  if (plant) {
    parts.push(
      `nearest plant ~${plant.km < 10 ? plant.km.toFixed(1) : Math.round(plant.km)} km (${plant.name})`,
    );
  } else {
    parts.push("no large plant mapped within ~40 km");
  }

  const label = loadLabel(loadScore);
  return {
    loadScore,
    loadLabel: label,
    cellCount,
    mastCount,
    buildingCount,
    populationDensityBand,
    densityBump,
    nearestPlantKm: plant?.km ?? null,
    nearestPlantName: plant?.name ?? null,
    radiusKm: MAST_RADIUS_M / 1000,
    sources,
    summaryLine: `${loadScore}/5 ${label}`,
    detailLine: `${parts.join(" · ")} · open-map proxy, not a body exposure reading`,
  };
}

/** Race so Place never hangs on slow Overpass. */
export async function fetchArtificialEmQuick(
  latitude: number,
  longitude: number,
): Promise<ArtificialEmSnapshot | null> {
  try {
    return await Promise.race([
      fetchArtificialEmSnapshot(latitude, longitude),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
    ]);
  } catch {
    return null;
  }
}
