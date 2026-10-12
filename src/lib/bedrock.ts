/**
 * Mapped bedrock at a point (Macrostrat, CC BY 4.0) plus Kruse's note on that
 * kind of ground, where the knowledge base has one.
 */

export type BedrockKind = "volcanic" | "iron-rich" | "carbonate" | "clay-delta" | "other";

export type Bedrock = {
  unitName: string;
  rockLabel: string;
  ageLabel: string | null;
  kind: BedrockKind;
  note: string | null;
};

export const BEDROCK_SOURCE = "Macrostrat (CC BY 4.0)";

const KIND_PATTERNS: [BedrockKind, RegExp][] = [
  ["volcanic", /\b(basalt\w*|lava|volcanic|andesit\w*|tuff|rhyolit\w*|dacit\w*|scoria|cinder)\b/],
  ["iron-rich", /\b(iron formation|ironstone|banded iron|magnetite|taconite|iron ore)\b/],
  ["carbonate", /\b(limestone|chalk|dolomit\w*|marl\w*|carbonate|karst)\b/],
  ["clay-delta", /\b(clay\w*|silt\w*|mud\w*|alluvi\w*|delta\w*|loess|floodplain)\b/],
];

const NOTES: Record<BedrockKind, string | null> = {
  volcanic:
    "Volcanic rock is the ground Kruse prefers. In his model basalt holds a flat local magnetic field even as the planet's field tilts, so he says to ground on it.",
  "iron-rich":
    "Kruse's view of iron-rich rock cuts both ways: he calls bedrock like New York's Adirondacks a partial refuge, but says large ore bodies, as around Birmingham, Alabama, scatter the local field as the main field collapses.",
  carbonate:
    "Kruse's warning about limestone is specific: rock riddled with water channels and soaked with saltwater (karst) carries electrical noise for miles near resorts and heavy infrastructure, so he says not to ground on it there. He calls quiet rural karst less of a problem.",
  "clay-delta":
    "On clay or river-delta ground, Kruse's grounding protocol says to stand on raw earth away from concrete slabs, ideally in the early morning.",
  other: null,
};

export function classifyBedrock(text: string): BedrockKind {
  const value = text.toLowerCase();
  return KIND_PATTERNS.find(([, pattern]) => pattern.test(value))?.[0] ?? "other";
}

/** "Major:{marlstone,chalk}, Minor:{claystone}" → "marlstone, chalk". */
export function rockLabelFromLith(lith: string): string {
  const major = lith.match(/Major:\s*\{([^}]*)\}/i)?.[1] ?? lith;
  const rocks = major
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter((part) => part && !part.includes(":") && part.length <= 40);
  return [...new Set(rocks)].slice(0, 4).join(", ") || lith.slice(0, 60);
}

type MacrostratUnit = {
  name?: string;
  lith?: string;
  b_int_name?: string;
  t_int_name?: string;
};

export function bedrockFromUnit(unit: MacrostratUnit): Bedrock | null {
  if (!unit.name && !unit.lith) return null;
  const lith = unit.lith ?? "";
  const kind = classifyBedrock(`${unit.name ?? ""} ${rockLabelFromLith(lith)}`);
  const ageLabel =
    unit.b_int_name && unit.t_int_name && unit.b_int_name !== unit.t_int_name
      ? `${unit.b_int_name} to ${unit.t_int_name}`
      : (unit.b_int_name ?? unit.t_int_name ?? null);
  return {
    unitName: unit.name ?? "Unnamed unit",
    rockLabel: rockLabelFromLith(lith),
    ageLabel,
    kind,
    note: NOTES[kind],
  };
}

/** First (most detailed) mapped unit at the point; null on any failure. */
export async function fetchBedrock(latitude: number, longitude: number): Promise<Bedrock | null> {
  const lat = Math.round(latitude * 1000) / 1000;
  const lng = Math.round(longitude * 1000) / 1000;
  try {
    const res = await fetch(
      `https://macrostrat.org/api/v2/geologic_units/map?lat=${lat}&lng=${lng}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 * 60 * 24 * 30 },
        signal: AbortSignal.timeout(2000),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: { data?: MacrostratUnit[] } };
    const unit = json.success?.data?.[0];
    return unit ? bedrockFromUnit(unit) : null;
  } catch {
    return null;
  }
}
