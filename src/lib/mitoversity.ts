/**
 * Mitoversity — educational lessons on mitochondrial lifestyle levers
 * (light, water, magnetism, support habits).
 *
 * Article bodies live in content/articles/<id>.json (flat format).
 * This module keeps shared types + pillar labels. Runtime catalog is loaded
 * via loadAppContent() → mergeMitoEntries() from those files.
 *
 * Educational only — not medical advice.
 */

export type MitoPillar = "light" | "water" | "magnetism" | "support";

export type MitoEntrySection = {
  heading: string;
  body: string;
};

export type MitoEntry = {
  id: string;
  title: string;
  pillar: MitoPillar;
  /** One-line list preview */
  summary: string;
  /** Related catalog protocol ids */
  relatedProtocolIds?: string[];
  /** Flat continuous sections (default for all file-backed articles). */
  sections: MitoEntrySection[];
  /** @deprecated Tiered accordion — unused for file-backed flat articles. */
  readingLevels?: import("@/lib/mitoversity-reading-levels").MitoReadingLevels;
  /**
   * Single continuous article — skip Simple / Intermediate / Advanced tiers.
   */
  flatArticle?: boolean;
};

export const MITO_PILLAR_LABEL: Record<MitoPillar, string> = {
  light: "Light",
  water: "Water",
  magnetism: "Magnetism",
  support: "Support",
};

/**
 * Legacy empty seed list — articles are loaded from content/articles/*.json.
 * Kept so Admin “built-in id” checks and older call sites keep compiling.
 */
export const RAW_MITOVERSITY_ENTRIES: readonly MitoEntry[] = [];

/** @deprecated Prefer mergeMitoEntries(loadContentOverrides()) from the server. */
export const MITOVERSITY_ENTRIES: readonly MitoEntry[] = [];

export function getMitoEntryById(_id: string): MitoEntry | undefined {
  return undefined;
}
