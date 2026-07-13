/**
 * Artificial EM / infrastructure load proxy (not a personal exposure meter).
 *
 * Sources (best-effort):
 * - OpenCelliD getInArea when OPENCELLID_API_KEY is set and returns data
 * - OpenStreetMap Overpass: communication masts / mobile towers
 * - OpenStreetMap: nearby power plants (distance)
 *
 * Educational lifestyle framework only.
 */

export type ArtificialEmSnapshot = {
  /** 1 = quiet / rural proxy … 5 = dense infrastructure proxy */
  loadScore: number;
  loadLabel: string;
  /** Mapped radio cells (OpenCelliD), if any */
  cellCount: number | null;
  /** OSM communication masts / towers in radius */
  mastCount: number;
  /** Nearest power plant distance km, if found within search */
  nearestPlantKm: number | null;
  nearestPlantName: string | null;
  radiusKm: number;
  sources: string[];
  summaryLine: string;
  detailLine: string;
};

const CELL_RADIUS_M = 2000; // OpenCelliD BBOX limit ~4 km²
const MAST_RADIUS_M = 5000;
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

  return Math.max(1, Math.min(5, score));
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

  const [cellCount, mastCount, plant] = await Promise.all([
    fetchOpenCellIdCount(latitude, longitude),
    fetchOsmMastCount(latitude, longitude),
    fetchNearestPowerPlant(latitude, longitude),
  ]);

  if (cellCount != null) sources.push("OpenCelliD");
  sources.push("OpenStreetMap");

  const loadScore = scoreArtificialEmLoad({
    cellCount,
    mastCount,
    nearestPlantKm: plant?.km ?? null,
  });

  const parts: string[] = [];
  if (cellCount != null && cellCount > 0) {
    parts.push(`${cellCount} mapped cells (~2 km)`);
  }
  parts.push(
    `${mastCount} mapped mast${mastCount === 1 ? "" : "s"} / towers (5 km)`,
  );
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
