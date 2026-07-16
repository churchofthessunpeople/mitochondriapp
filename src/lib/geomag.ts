/**
 * Earth's main magnetic field at a place (WMM-class models).
 * Primary: British Geological Survey free WMM web service.
 * Fallback: axial-dipole approximation if the network fails.
 *
 * Main field only — not nnEMF, not crustal geology.
 * Educational place context — not medical advice.
 */

export type GeomagField = {
  /** Total intensity F (nT) */
  totalNt: number;
  /** Inclination / dip, degrees (positive = down in N hemisphere convention from model) */
  inclinationDeg: number;
  /** Declination, degrees (positive = east of true north) */
  declinationDeg: number;
  /** Horizontal intensity H (nT), if known */
  horizontalNt: number | null;
  /** Vertical intensity Z (nT), if known */
  verticalNt: number | null;
  model: string;
  /** ISO date used for the calculation */
  date: string;
  source: "bgs-wmm" | "dipole-fallback";
};

export type GeomagDisplay = GeomagField & {
  totalUtLabel: string;
  totalGaussLabel: string;
  inclinationLabel: string;
  declinationLabel: string;
  summaryLine: string;
};

function roundCoord(n: number, places = 2): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

function formatDeg(deg: number, pos: string, neg: string): string {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const m = Math.round((abs - d) * 60);
  const hemi = deg >= 0 ? pos : neg;
  return `${d}° ${m}' ${hemi}`;
}

export function formatGeomagDisplay(g: GeomagField): GeomagDisplay {
  const totalUt = g.totalNt / 1000;
  const totalUtLabel = `${totalUt.toFixed(1)} µT`;
  const totalGaussLabel = `${(totalUt / 100).toFixed(2)} G`;
  const inclinationLabel = formatDeg(g.inclinationDeg, "down", "up");
  const declinationLabel = formatDeg(g.declinationDeg, "E", "W");
  const summaryLine = `${totalUtLabel} (${totalGaussLabel}) · dip ${inclinationLabel} · decl ${declinationLabel}`;
  return {
    ...g,
    totalUtLabel,
    totalGaussLabel,
    inclinationLabel,
    declinationLabel,
    summaryLine,
  };
}

/**
 * Rough axial dipole (IGRF-like order-of-magnitude).
 * Good enough offline when BGS is unavailable.
 */
export function geomagDipoleFallback(
  latitude: number,
  _longitude: number,
  date = new Date(),
): GeomagField {
  // Magnetic co-latitude approx geographic for lifestyle UX
  const latRad = (latitude * Math.PI) / 180;
  // Dipole inclination: tan I = 2 tan φ
  const inclinationDeg =
    (Math.atan(2 * Math.tan(latRad)) * 180) / Math.PI;
  // Equatorial surface ~ 30_000 nT, polar ~ 60_000 nT
  const B0 = 30_500;
  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);
  // |B| ≈ (B0/2) * sqrt(1 + 3 sin²φ) * 2 ... standard: Beq * sqrt(1+3sin²φ)
  const totalNt = B0 * Math.sqrt(1 + 3 * sinLat * sinLat);
  const horizontalNt = totalNt * Math.cos((inclinationDeg * Math.PI) / 180);
  const verticalNt = totalNt * Math.sin((inclinationDeg * Math.PI) / 180);

  return {
    totalNt: Math.round(totalNt),
    inclinationDeg: Math.round(inclinationDeg * 10) / 10,
    declinationDeg: 0, // unknown offline
    horizontalNt: Math.round(Math.abs(horizontalNt)),
    verticalNt: Math.round(verticalNt),
    model: "dipole-approx",
    date: date.toISOString().slice(0, 10),
    source: "dipole-fallback",
  };
}

type BgsJson = {
  "geomagnetic-field-model-result"?: {
    model?: string;
    model_revision?: string;
    date?: { value?: string };
    "field-value"?: {
      "total-intensity"?: { value?: number };
      declination?: { value?: number };
      inclination?: { value?: number };
      "north-intensity"?: { value?: number };
      "east-intensity"?: { value?: number };
      "vertical-intensity"?: { value?: number };
      "horizontal-intensity"?: { value?: number };
    };
  };
};

/**
 * Fetch WMM field from BGS free web service.
 * Cached by rounded lat/lng + year (field changes slowly).
 */
export async function fetchGeomagField(
  latitude: number,
  longitude: number,
  opts?: { elevationM?: number | null; date?: Date },
): Promise<GeomagField> {
  const lat = roundCoord(latitude, 2);
  const lng = roundCoord(longitude, 2);
  const date = opts?.date ?? new Date();
  const dateIso = date.toISOString().slice(0, 10);
  const elevKm =
    opts?.elevationM != null && Number.isFinite(opts.elevationM)
      ? Math.max(0, opts.elevationM / 1000)
      : 0;

  const url =
    `https://geomag.bgs.ac.uk/web_service/GMModels/wmm/2025` +
    `?latitude=${lat}&longitude=${lng}&altitude=${elevKm.toFixed(3)}` +
    `&date=${dateIso}&format=json`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      // Next.js fetch cache: 7 days — WMM is slow-changing
      next: { revalidate: 60 * 60 * 24 * 7 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) throw new Error(`BGS HTTP ${res.status}`);
    const data = (await res.json()) as BgsJson;
    const fv = data["geomagnetic-field-model-result"]?.["field-value"];
    const total = fv?.["total-intensity"]?.value;
    const dec = fv?.declination?.value;
    const inc = fv?.inclination?.value;
    if (
      typeof total !== "number" ||
      typeof dec !== "number" ||
      typeof inc !== "number"
    ) {
      throw new Error("BGS missing fields");
    }
    const h = fv?.["horizontal-intensity"]?.value;
    const z = fv?.["vertical-intensity"]?.value;
    const rev =
      data["geomagnetic-field-model-result"]?.model_revision ?? "2025";

    return {
      totalNt: Math.round(total),
      declinationDeg: Math.round(dec * 1000) / 1000,
      inclinationDeg: Math.round(inc * 1000) / 1000,
      horizontalNt: typeof h === "number" ? Math.round(h) : null,
      verticalNt: typeof z === "number" ? Math.round(z) : null,
      model: `WMM-${rev}`,
      date: dateIso,
      source: "bgs-wmm",
    };
  } catch {
    return geomagDipoleFallback(latitude, longitude, date);
  }
}

/** Race network vs timeout so Place never hangs. */
export async function fetchGeomagFieldQuick(
  latitude: number,
  longitude: number,
  opts?: { elevationM?: number | null },
): Promise<GeomagField> {
  return Promise.race([
    fetchGeomagField(latitude, longitude, opts),
    new Promise<GeomagField>((resolve) =>
      setTimeout(
        () => resolve(geomagDipoleFallback(latitude, longitude)),
        1800,
      ),
    ),
  ]);
}
