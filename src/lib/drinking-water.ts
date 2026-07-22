/**
 * Drinking water — single activity for RO / spring / DDW servings with
 * remineralization, carbonation, and deuterium PPM (DDW only).
 */

export const DRINKING_WATER_PROTOCOL_ID = "drinking-water";

/** Retired into drinking water. */
export const DRINKING_WATER_LEGACY_IDS = [
  "mineralized-water",
  "carbonated-water",
  "baking-soda-water",
] as const;

export type WaterSource =
  | "reverse_osmosis"
  | "spring"
  | "deuterium_depleted";

export type WaterCarbonation = "still" | "carbonated";

/** How the glass was remineralized (if at all). */
export type WaterMineral = "none" | "salt" | "baking_soda";

/** Salt / baking-soda dose per glass. */
export type WaterMineralAmount =
  | "pinch"
  | "eighth_tsp"
  | "quarter_tsp"
  | "half_tsp";

/** Deuterium concentration options for DDW (ppm). Natural ~150. */
export const DEUTERIUM_PPM_OPTIONS = [25, 50, 75, 105, 125, 150] as const;
export type DeuteriumPpm = (typeof DEUTERIUM_PPM_OPTIONS)[number];

export type DrinkingWaterLogInput = {
  source: WaterSource;
  carbonation: WaterCarbonation;
  mineral: WaterMineral;
  /** Required when mineral is salt or baking_soda. */
  mineralAmount?: WaterMineralAmount | null;
  /** Required when source is deuterium_depleted. */
  deuteriumPpm?: DeuteriumPpm | null;
};

export const WATER_SOURCE_OPTIONS: {
  id: WaterSource;
  label: string;
  detail: string;
}[] = [
  {
    id: "reverse_osmosis",
    label: "Reverse osmosis",
    detail: "RO or similarly purified — remineralize if you can",
  },
  {
    id: "spring",
    label: "Spring water",
    detail: "Natural spring or mineral water",
  },
  {
    id: "deuterium_depleted",
    label: "Deuterium-depleted",
    detail: "DDW — choose deuterium PPM next",
  },
];

export const WATER_MINERAL_OPTIONS: {
  id: WaterMineral;
  label: string;
  detail: string;
}[] = [
  {
    id: "none",
    label: "Not remineralized",
    detail: "Plain — no salt or baking soda added",
  },
  {
    id: "salt",
    label: "Salt",
    detail: "Sea salt or electrolyte salt — pick amount next",
  },
  {
    id: "baking_soda",
    label: "Baking soda",
    detail: "Sodium bicarbonate — pick amount next",
  },
];

export const WATER_MINERAL_AMOUNT_OPTIONS: {
  id: WaterMineralAmount;
  label: string;
  detail: string;
}[] = [
  { id: "pinch", label: "Pinch", detail: "A few grains" },
  { id: "eighth_tsp", label: "⅛ tsp", detail: "Light mineral dose" },
  {
    id: "quarter_tsp",
    label: "¼ tsp",
    detail: "Common baking-soda protocol dose",
  },
  { id: "half_tsp", label: "½ tsp", detail: "Stronger mineral dose" },
];

export const WATER_CARBONATION_OPTIONS: {
  id: WaterCarbonation;
  label: string;
  detail: string;
}[] = [
  {
    id: "still",
    label: "Still",
    detail: "Not carbonated",
  },
  {
    id: "carbonated",
    label: "Carbonated",
    detail: "Sparkling / Sodastream / bottled sparkling — not soda",
  },
];

const SOURCE_INDEX: Record<WaterSource, number> = {
  reverse_osmosis: 0,
  spring: 1,
  deuterium_depleted: 2,
};
const SOURCE_BY_INDEX: WaterSource[] = [
  "reverse_osmosis",
  "spring",
  "deuterium_depleted",
];

const MINERAL_INDEX: Record<WaterMineral, number> = {
  none: 0,
  salt: 1,
  baking_soda: 2,
};
const MINERAL_BY_INDEX: WaterMineral[] = ["none", "salt", "baking_soda"];

const AMOUNT_INDEX: Record<WaterMineralAmount, number> = {
  pinch: 0,
  eighth_tsp: 1,
  quarter_tsp: 2,
  half_tsp: 3,
};
const AMOUNT_BY_INDEX: WaterMineralAmount[] = [
  "pinch",
  "eighth_tsp",
  "quarter_tsp",
  "half_tsp",
];

/**
 * Pack into variant_value (int):
 * bits 0–1 source · bit 2 carbonated · bits 3–4 mineral ·
 * bits 5–7 amount · bits 8–11 deuterium PPM index
 */
export function encodeDrinkingWaterVariant(input: DrinkingWaterLogInput): number {
  const source = SOURCE_INDEX[input.source] ?? 0;
  const carbonated = input.carbonation === "carbonated" ? 1 : 0;
  const mineral = MINERAL_INDEX[input.mineral] ?? 0;
  const amount =
    input.mineral === "none"
      ? 0
      : AMOUNT_INDEX[input.mineralAmount ?? "quarter_tsp"] ?? 2;
  let ppmIndex = 0;
  if (input.source === "deuterium_depleted") {
    const ppm = input.deuteriumPpm ?? 150;
    const idx = DEUTERIUM_PPM_OPTIONS.indexOf(ppm as DeuteriumPpm);
    ppmIndex = idx >= 0 ? idx : DEUTERIUM_PPM_OPTIONS.length - 1;
  }
  return (
    (source & 0b11) |
    ((carbonated & 0b1) << 2) |
    ((mineral & 0b11) << 3) |
    ((amount & 0b111) << 5) |
    ((ppmIndex & 0b1111) << 8)
  );
}

export function decodeDrinkingWaterVariant(
  variantValue: unknown,
): DrinkingWaterLogInput | null {
  if (typeof variantValue !== "number" || !Number.isFinite(variantValue)) {
    return null;
  }
  const v = Math.trunc(variantValue);
  if (v < 0) return null;
  const source = SOURCE_BY_INDEX[v & 0b11];
  if (!source) return null;
  const carbonation: WaterCarbonation =
    ((v >> 2) & 0b1) === 1 ? "carbonated" : "still";
  const mineral = MINERAL_BY_INDEX[(v >> 3) & 0b11] ?? "none";
  const amountIdx = (v >> 5) & 0b111;
  const mineralAmount =
    mineral === "none" ? null : (AMOUNT_BY_INDEX[amountIdx] ?? "quarter_tsp");
  const ppmIdx = (v >> 8) & 0b1111;
  const deuteriumPpm =
    source === "deuterium_depleted"
      ? (DEUTERIUM_PPM_OPTIONS[ppmIdx] ??
        DEUTERIUM_PPM_OPTIONS[DEUTERIUM_PPM_OPTIONS.length - 1])
      : null;
  return {
    source,
    carbonation,
    mineral,
    mineralAmount,
    deuteriumPpm,
  };
}

export function isDrinkingWaterProtocolId(id: string): boolean {
  return id === DRINKING_WATER_PROTOCOL_ID;
}

export function remapDrinkingWaterFavoriteId(id: string): string {
  if ((DRINKING_WATER_LEGACY_IDS as readonly string[]).includes(id)) {
    return DRINKING_WATER_PROTOCOL_ID;
  }
  return id;
}

export function waterSourceLabel(source: WaterSource): string {
  return WATER_SOURCE_OPTIONS.find((o) => o.id === source)?.label ?? source;
}

export function waterMineralLabel(mineral: WaterMineral): string {
  return WATER_MINERAL_OPTIONS.find((o) => o.id === mineral)?.label ?? mineral;
}

export function waterMineralAmountLabel(amount: WaterMineralAmount): string {
  return (
    WATER_MINERAL_AMOUNT_OPTIONS.find((o) => o.id === amount)?.label ?? amount
  );
}

export function waterCarbonationLabel(c: WaterCarbonation): string {
  return WATER_CARBONATION_OPTIONS.find((o) => o.id === c)?.label ?? c;
}

/** Normalize partial dialog answers into a complete log input. */
export function normalizeDrinkingWaterInput(
  input: DrinkingWaterLogInput,
): DrinkingWaterLogInput {
  const mineral = input.mineral;
  const mineralAmount =
    mineral === "none"
      ? null
      : (input.mineralAmount ?? ("quarter_tsp" as WaterMineralAmount));
  const deuteriumPpm =
    input.source === "deuterium_depleted"
      ? (input.deuteriumPpm ?? 150)
      : null;
  return {
    source: input.source,
    carbonation: input.carbonation,
    mineral,
    mineralAmount,
    deuteriumPpm,
  };
}

/**
 * Flat catalog base for every serving (legacy mineralized / carbonated /
 * baking-soda were all 4 pts). Scoring differentiation can come later.
 */
export function drinkingWaterBasePoints(
  _input: DrinkingWaterLogInput,
  catalogBase: number,
): number {
  return Math.max(1, catalogBase);
}

export function formatDrinkingWaterLabel(variantValue: unknown): string | null {
  const decoded = decodeDrinkingWaterVariant(variantValue);
  if (!decoded) return null;
  const parts = [waterSourceLabel(decoded.source)];
  if (decoded.source === "deuterium_depleted" && decoded.deuteriumPpm != null) {
    parts.push(`${decoded.deuteriumPpm} ppm D`);
  }
  if (decoded.mineral !== "none" && decoded.mineralAmount) {
    parts.push(
      `${waterMineralLabel(decoded.mineral)} ${waterMineralAmountLabel(decoded.mineralAmount)}`,
    );
  } else if (decoded.mineral !== "none") {
    parts.push(waterMineralLabel(decoded.mineral));
  }
  parts.push(waterCarbonationLabel(decoded.carbonation).toLowerCase());
  return parts.join(" · ");
}
