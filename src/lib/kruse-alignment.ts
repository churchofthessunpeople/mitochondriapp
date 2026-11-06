/**
 * "Kruse alignment" score for a place: how its readings line up with the
 * criteria Dr. Kruse gives for choosing where to live. This is his framework,
 * not established science, and not medical advice.
 *
 * Weights (100 total) put the place's inherent magnetism first, then sun, then
 * ground and hazards, then wireless load, as in his "choosing a location" and
 * "magnetic zipcode" teachings. Every criterion is scored 0..1 and explained
 * in plain words next to the reading.
 *
 * Pure and client-safe (no network, no heavy data imports).
 */

import type { PublicPlaceResult } from "./public-place";
import type { SunPhases } from "./sun-phases";

export type Haplogroup = "unknown" | "L" | "HJUT" | "ABCDF";

export const HAPLOGROUP_OPTIONS: readonly { id: Haplogroup; label: string }[] = [
  { id: "unknown", label: "Not set" },
  { id: "L", label: "L (African / equatorial)" },
  { id: "HJUT", label: "H, J, U, T (European)" },
  { id: "ABCDF", label: "A, B, C, D, F (Indigenous American, East Asian)" },
];

export type CriterionGroup = "magnetism" | "sun" | "ground" | "regional" | "wireless";
export type CriterionStatus = "aligned" | "mixed" | "misaligned" | "unknown";

export type Criterion = {
  id: string;
  group: CriterionGroup;
  label: string;
  /** Points available (all weights sum to 100). */
  weight: number;
  /** 0..1, or null when the reading is unavailable. */
  fraction: number | null;
  points: number | null;
  /** The reading itself, formatted. */
  value: string;
  status: CriterionStatus;
  /** Why it scores this way, in Kruse's terms. */
  explanation: string;
};

export type GroupSummary = {
  id: CriterionGroup;
  label: string;
  weight: number;
  points: number;
  /** Points available among criteria that could be scored. */
  scoredWeight: number;
};

export type AlignmentResult = {
  /** 0..100 over the criteria that could be scored; null if none could. */
  total: number | null;
  label: string;
  /** Share of the 100 points that could be scored (1 = complete). */
  coverage: number;
  groups: GroupSummary[];
  criteria: Criterion[];
  /** Places and regions Kruse names, shown for context and not scored. */
  namedPlaceNotes: string[];
  lineageNote: string | null;
};

export const GROUP_WEIGHTS: Record<CriterionGroup, { label: string; weight: number }> = {
  magnetism: { label: "Inherent magnetism", weight: 45 },
  sun: { label: "Sun", weight: 25 },
  ground: { label: "Ground and hazards", weight: 15 },
  regional: { label: "Kruse's named view", weight: 10 },
  wireless: { label: "Wireless load", weight: 5 },
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Approximate centre of the South Atlantic Anomaly's weakest field (drifts west a few tenths of a degree a year). */
export const SAA_CENTER = { lat: -27, lng: -52 };

/** Stressed zones Kruse names as "induction zones". */
export const STRESS_ZONES = [
  { name: "the New Madrid seismic zone", lat: 36.55, lng: -89.55 },
  { name: "the Azores triple junction", lat: 38.0, lng: -28.0 },
] as const;

type Tuning = {
  intensityPassNt: number;
  declinationZeroAtDeg: number;
  latitudeZeroAtDeg: number;
  note: string | null;
};

const TUNING: Record<Haplogroup, Tuning> = {
  unknown: {
    intensityPassNt: 45_000,
    declinationZeroAtDeg: 15,
    latitudeZeroAtDeg: 60,
    note: null,
  },
  L: {
    intensityPassNt: 35_000,
    declinationZeroAtDeg: 6,
    latitudeZeroAtDeg: 50,
    note: "L lineage: Kruse says these engines run with little magnetic help, so the field-strength bar is lower. But he says even 2-4° of declination can stall them, and they falter in weak-sun northern latitudes, so those two bars are stricter.",
  },
  HJUT: {
    intensityPassNt: 45_000,
    declinationZeroAtDeg: 15,
    latitudeZeroAtDeg: 70,
    note: "H, J, U, T lineage: Kruse calls these \"internal heaters\" built for the north, so high latitude costs less. He warns they can overheat under very strong UV or on the anomaly's fringe.",
  },
  ABCDF: {
    intensityPassNt: 50_000,
    declinationZeroAtDeg: 15,
    latitudeZeroAtDeg: 60,
    note: "A, B, C, D, F lineage: Kruse says these depend on dense magnetic pinning (volcanic ground and a strong field), so the field-strength bar is higher and nearby volcanic ground counts for more.",
  },
};

function status(fraction: number | null): CriterionStatus {
  if (fraction == null) return "unknown";
  if (fraction >= 0.75) return "aligned";
  if (fraction >= 0.4) return "mixed";
  return "misaligned";
}

function criterion(
  base: Omit<Criterion, "points" | "status" | "fraction"> & { fraction: number | null },
): Criterion {
  const fraction = base.fraction == null ? null : clamp01(base.fraction);
  return {
    ...base,
    fraction,
    points: fraction == null ? null : Math.round(fraction * base.weight * 10) / 10,
    status: status(fraction),
  };
}

function signed(n: number, digits: number, unit: string): string {
  return `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(digits)}${unit}`;
}

/** Gaussian-style falloff matching the app's volcanic-anchor scale: full within 40 km, half near 100 km, none by 250 km. */
function anchorFractionFromKm(km: number): number {
  if (!Number.isFinite(km) || km < 0) return 0;
  if (km <= 40) return 1;
  if (km >= 250) return 0;
  const normalized = (km - 40) / 60;
  return 2 ** -(normalized ** 2);
}

const EAST_COAST = new Set(["ME", "NH", "MA", "RI", "CT", "NY", "NJ", "DE", "MD", "VA", "NC", "SC", "GA"]);
const DESERT_STATES = new Set(["AZ", "NV", "NM"]);

function namedView(
  s: string,
): { fraction: number; value: string; note: string } | null {
  if (s === "WA" || s === "OR")
    return { fraction: 0.85, value: "Favored: Pacific Northwest", note: "Kruse calls the Pacific Northwest the one part of the US that is really pinned, thanks to a growing offshore lava dome." };
  if (s === "CA")
    return { fraction: 0.2, value: "Ruled out", note: "Kruse rules out California's \"double deficit\" of high declination and weak steady UV-B." };
  if (s === "TX")
    return { fraction: 0.25, value: "Weak", note: "Kruse says Texas stays weak." };
  if (s === "FL")
    return { fraction: 0.2, value: "Ruled out", note: "Kruse points to Florida's lost oranges since about 2012 as a sign its field is failing, and says the Caribbean now sits under the South Atlantic Anomaly." };
  if (s === "CO" || s === "MN" || s === "HI")
    return { fraction: 0.15, value: "On his no-list", note: "This state is on Kruse's no-list." };
  if (EAST_COAST.has(s))
    return { fraction: 0.35, value: "East Coast: ranked below the West", note: "For 2024-2026 Kruse ranks the West Coast above the East Coast because the Pacific ocean circulation still runs while the Atlantic's has stalled." };
  if (DESERT_STATES.has(s))
    return { fraction: 0.3, value: "Desert state", note: "Kruse treats deserts as magnetically poor even under strong UV, and says dry sand gives no ground. Check whether your area is desert." };
  return null;
}

/** Context Kruse gives that is too coarse to score. */
function namedPlaceNotes(place: PublicPlaceResult): string[] {
  const notes: string[] = [];
  if (place.stateAbbr === "AK")
    notes.push("Kruse says even the Aleutians can beat a place like Miami, because they sit on the Pacific Rim's volcanic pinning.");
  return notes;
}

export function scoreAlignment(
  place: PublicPlaceResult,
  phases: SunPhases | null,
  haplogroup: Haplogroup = "unknown",
): AlignmentResult {
  const tuning = TUNING[haplogroup];
  const { geomag, bedrock, dipZone, volcano, artificialEm } = place.factors;
  const lat = place.latitude;
  const lng = place.longitude;
  const criteria: Criterion[] = [];

  // ---- Inherent magnetism (45) ------------------------------------------
  const intensityNt = geomag?.totalNt ?? null;
  criteria.push(
    criterion({
      id: "intensity",
      group: "magnetism",
      label: "Field strength",
      weight: 14,
      fraction:
        intensityNt == null
          ? null
          : intensityNt < tuning.intensityPassNt
            ? 0.7 * clamp01((intensityNt - (tuning.intensityPassNt - 15_000)) / 15_000)
            : 0.7 + 0.3 * clamp01((intensityNt - tuning.intensityPassNt) / 15_000),
      value: intensityNt == null ? "unavailable" : `${(intensityNt / 1000).toFixed(1)} µT`,
      explanation: `Kruse wants total field intensity as high as possible: above about ${tuning.intensityPassNt / 1000} µT, ideally up to 60. A stronger field gives the mitochondria a firmer magnetic reference. Below about 30 µT, as under the South Atlantic Anomaly, he says cells need a longer quiet spell to repair.`,
    }),
  );

  const dip = geomag ? Math.abs(geomag.inclinationDeg) : null;
  criteria.push(
    criterion({
      id: "inclination",
      group: "magnetism",
      label: "Dip angle",
      weight: 12,
      fraction: dip == null ? null : 1 - (dip - 45) / 30,
      value: geomag ? `${dip!.toFixed(1)}° (${geomag.inclinationLabel})` : "unavailable",
      explanation:
        "Kruse wants inclination, the angle field lines dip into the ground, between 0° and 45°. Flat lines anchor the body's internal axes; lines plunging steeply toward the poles destabilize them. Full marks up to 45°, falling to zero at 75°.",
    }),
  );

  const declination = geomag?.declinationKnown ? geomag.declinationDeg : null;
  const gradient = geomag?.declinationGradient ?? null;
  const gradientText = gradient
    ? ` Declination changes about ${gradient.degPer100Km.toFixed(2)}° per 100 km here${
        gradient.agonicKm != null
          ? `; the zero-declination line is roughly ${gradient.agonicKm.toLocaleString("en-US")} km away if the trend holds (a rough straight-line estimate)`
          : ""
      }.${gradient.degPer100Km > 1 ? " That is steep: Kruse says where lines bunch, the field can change over tens of miles and warp membranes as you move." : ""}`
    : "";
  criteria.push(
    criterion({
      id: "declination",
      group: "magnetism",
      label: "Declination",
      weight: 11,
      fraction:
        declination == null
          ? null
          : 1 - (Math.abs(declination) - 1) / (tuning.declinationZeroAtDeg - 1),
      value: declination == null ? "unavailable" : geomag!.declinationLabel,
      explanation: `Kruse wants declination, the offset between compass north and true north, close to 0°. On the zero line (an "agonic" line) he says there is no twist between the planet's spin axis and its field. Full marks within 1°, falling to zero at ${tuning.declinationZeroAtDeg}°.${gradientText}`,
    }),
  );

  const svDec = geomag?.svDeclinationDegPerYear ?? null;
  const svDip = geomag?.svInclinationDegPerYear ?? null;
  let driftFraction: number | null = null;
  let driftText = "unavailable";
  let driftExtra = "";
  if (svDec != null && svDip != null) {
    const rate = Math.hypot(svDec, svDip);
    driftFraction = 1 - (rate - 0.03) / 0.27;
    if (dipZone?.zone) driftFraction *= 0.5;
    else if (dipZone?.inCorridor) driftFraction *= 0.75;
    driftText = `dip ${signed(svDip, 2, "°/yr")}, decl ${signed(svDec, 2, "°/yr")}`;
    const toward = Math.sign(svDip) === Math.sign(geomag?.inclinationDeg ?? 1);
    driftExtra = ` The dip is ${toward ? "steepening toward vertical" : "flattening"}${
      toward ? ", the direction Kruse warns against" : ""
    }.`;
    if (dipZone?.zone)
      driftExtra += ` It also sits inside one of Kruse's dip-change zones (#${dipZone.zone.rank}), which halves this score.`;
    else if (dipZone?.inCorridor)
      driftExtra += " It also sits in his fastest-falling dip corridor, which trims this score.";
  }
  criteria.push(
    criterion({
      id: "drift",
      group: "magnetism",
      label: "Field stability",
      weight: 5,
      fraction: driftFraction,
      value: driftText,
      explanation: `Kruse says how fast the local field is changing matters as much as its current value, and tells people to compare their ZIP's field over the years and move before official charts catch up. This uses the model's annual change in dip and declination: full marks at 0.03°/yr or less, zero at 0.3°/yr.${driftExtra}`,
    }),
  );

  const saaKm = haversineKm(lat, lng, SAA_CENTER.lat, SAA_CENTER.lng);
  criteria.push(
    criterion({
      id: "saa",
      group: "magnetism",
      label: "South Atlantic Anomaly",
      weight: 3,
      fraction: (saaKm - 3000) / 6000,
      value: `${Math.round(saaKm).toLocaleString("en-US")} km from its centre`,
      explanation:
        "Kruse says to avoid the South Atlantic Anomaly, a huge weak-field patch that he says now reaches the Caribbean and threatens South America. Full marks 9,000 km or more from its approximate centre, zero within 3,000 km. His point is that the weak patch is growing and moving west.",
    }),
  );

  // ---- Sun (25) ----------------------------------------------------------
  const uvbDays = phases?.uvbDaysPerYear ?? null;
  criteria.push(
    criterion({
      id: "uvb",
      group: "sun",
      label: "UV-B season",
      weight: 15,
      fraction: uvbDays == null ? null : uvbDays / 365,
      value:
        uvbDays == null
          ? "unavailable"
          : `${uvbDays} days a year (about ${(uvbDays / 30.4).toFixed(1)} months)`,
      explanation:
        "Kruse says a strong field is not enough if the sun is too weak for most of the year to keep melanin and vitamin D production running. This counts the days when the noon sun climbs above 45° (your shadow shorter than you). Honolulu has all 365; the far north has none.",
    }),
  );

  const absLat = Math.abs(lat);
  criteria.push(
    criterion({
      id: "latitude",
      group: "sun",
      label: "Latitude",
      weight: 10,
      fraction: absLat <= 35 ? 1 : 1 - (absLat - 35) / (tuning.latitudeZeroAtDeg - 35),
      value: `${absLat.toFixed(1)}°${lat >= 0 ? "N" : "S"}`,
      explanation: `Kruse says that above roughly 35° people are squeezed from two sides: gravity is stronger and UV and short-wave infrared are weak or missing for much of the year, so cells must push heavy hydrogen "uphill" with little light. Full marks to 35°, falling to zero at ${tuning.latitudeZeroAtDeg}°.`,
    }),
  );

  // ---- Ground and hazards (20) -------------------------------------------
  const volcKm = volcano.nearest?.distanceKm ?? null;
  let anchor = volcKm == null ? 0 : anchorFractionFromKm(volcKm);
  if (bedrock?.kind === "volcanic") anchor = Math.max(anchor, 0.85);
  const hawaiiCap = volcano.hawaii;
  if (hawaiiCap) anchor = Math.min(anchor, 0.5);
  criteria.push(
    criterion({
      id: "anchor",
      group: "ground",
      label: "Volcanic ground",
      weight: haplogroup === "ABCDF" ? 10 : 8,
      fraction: anchor,
      value: [
        volcano.nearest
          ? `${volcano.nearest.name}, ${volcano.nearest.distanceKm} km`
          : "no recent volcano nearby",
        bedrock ? bedrock.rockLabel : null,
      ]
        .filter(Boolean)
        .join("; "),
      explanation: `Kruse says active volcanoes and young basalt pin the local field best and that you should ground on it. Full marks within 40 km of a recently active volcano or on volcanic bedrock, fading to zero by 250 km.${
        hawaiiCap
          ? " Hawaii is capped at half marks because he rules it out: its rock froze in a reversed field and can cancel today's."
          : ""
      }${bedrock?.kind === "carbonate" ? " Limestone (karst) near resorts and heavy infrastructure carries electrical noise, per Kruse." : ""}`,
    }),
  );

  let nearestZone: { name: string; km: number } | null = null;
  for (const zone of STRESS_ZONES) {
    const km = haversineKm(lat, lng, zone.lat, zone.lng);
    if (!nearestZone || km < nearestZone.km) nearestZone = { name: zone.name, km };
  }
  criteria.push(
    criterion({
      id: "faults",
      group: "ground",
      label: "Stressed fault zones",
      weight: haplogroup === "ABCDF" ? 2 : 4,
      fraction: nearestZone ? (nearestZone.km - 200) / 500 : null,
      value: nearestZone
        ? `${Math.round(nearestZone.km).toLocaleString("en-US")} km from ${nearestZone.name}`
        : "unavailable",
      explanation:
        "Kruse says some geology rules a region out. He singles out the New Madrid seismic zone, which he calls an active \"induction zone\" that gives off broad-band electromagnetic signals under stress, and is wary of the Azores. Full marks 700 km or more away, zero within 200 km. Only the zones he names are checked; other faults are not.",
    }),
  );

  const elevationM = place.elevationM;
  criteria.push(
    criterion({
      id: "altitude",
      group: "ground",
      label: "Altitude",
      weight: 4,
      fraction: elevationM == null ? null : 1 - (elevationM - 500) / 2500,
      value: elevationM == null ? "unavailable" : `${Math.round(elevationM)} m (${Math.round(elevationM * 3.28084)} ft)`,
      explanation:
        "Kruse says cosmic rays, and the tritium they make, increase with height, so within a good zone he favors living nearer sea level. Full marks to 500 m, zero at 3,000 m.",
    }),
  );

  // ---- Kruse's named view (10), only where he names the region -----------
  const named = namedView(place.stateAbbr);
  if (named) {
    criteria.push(
      criterion({
        id: "named",
        group: "regional",
        label: "Kruse's view of this region",
        weight: 10,
        fraction: named.fraction,
        value: named.value,
        explanation: `${named.note} This is his own ranking of regions, kept separate from the measured readings above, and only counted where he names the region.`,
      }),
    );
  }

  // ---- Wireless (5) ------------------------------------------------------
  criteria.push(
    criterion({
      id: "wireless",
      group: "wireless",
      label: "Wireless and power load",
      weight: 5,
      fraction: artificialEm ? (5 - artificialEm.loadScore) / 4 : null,
      value: artificialEm ? artificialEm.loadLabel : "unavailable",
      explanation:
        "Kruse says a \"smart\" house full of wireless devices cancels even a good location, and treats non-native EM fields as noise every cell must sort at a heat cost. This reflects mapped cell towers, buildings and power plants nearby, not your home. Your own wiring and devices matter more.",
    }),
  );

  // ---- Totals ------------------------------------------------------------
  const groups: GroupSummary[] = (Object.keys(GROUP_WEIGHTS) as CriterionGroup[]).map((id) => {
    const inGroup = criteria.filter((c) => c.group === id);
    return {
      id,
      label: GROUP_WEIGHTS[id].label,
      weight: GROUP_WEIGHTS[id].weight,
      points: inGroup.reduce((sum, c) => sum + (c.points ?? 0), 0),
      scoredWeight: inGroup.reduce((sum, c) => sum + (c.points == null ? 0 : c.weight), 0),
    };
  });
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const scoredWeight = groups.reduce((sum, g) => sum + g.scoredWeight, 0);
  const points = groups.reduce((sum, g) => sum + g.points, 0);
  const total = scoredWeight > 0 ? Math.round((points / scoredWeight) * 100) : null;

  return {
    total,
    label: total == null ? "Not enough data" : labelFor(total),
    coverage: totalWeight > 0 ? scoredWeight / totalWeight : 0,
    groups,
    criteria,
    namedPlaceNotes: namedPlaceNotes(place),
    lineageNote: tuning.note,
  };
}

function labelFor(total: number): string {
  if (total >= 80) return "Strong alignment";
  if (total >= 65) return "Good alignment";
  if (total >= 50) return "Mixed alignment";
  if (total >= 35) return "Weak alignment";
  return "Poor alignment";
}
