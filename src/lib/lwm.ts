/**
 * Light · Water · Magnetism — mitochondrial lifestyle pillars (Kruse-aligned).
 * Maps catalog categories + keystone protocols for daily progress.
 */

import type { Protocol, ProtocolCategory } from "@/db/schema";
import { isSunriseKeystoneProtocol } from "@/lib/scoring";

export type LwmPillarId = "light" | "water" | "magnetism" | "support";

export type LwmPillarMeta = {
  id: LwmPillarId;
  label: string;
  shortLabel: string;
  /** One-line teaching for Today */
  blurb: string;
  /** App sheet id for deep teaching card */
  sheetId: "guideLight" | "guideWater" | "guideMagnetism" | null;
};

export const LWM_PILLARS: readonly LwmPillarMeta[] = [
  {
    id: "light",
    label: "Light",
    shortLabel: "L",
    blurb: "Sunrise eyes, outdoor spectrum, darkness at night.",
    sheetId: "guideLight",
  },
  {
    id: "water",
    label: "Water",
    shortLabel: "W",
    blurb: "Lower deuterium load · mineral hydration · ATP synthase context.",
    sheetId: "guideWater",
  },
  {
    id: "magnetism",
    label: "Magnetism",
    shortLabel: "M",
    blurb: "Earth / geology context · grounding · cut nnEMF.",
    sheetId: "guideMagnetism",
  },
  {
    id: "support",
    label: "Support",
    shortLabel: "S",
    blurb: "Cold, sleep architecture, daylight movement.",
    sheetId: null,
  },
] as const;

/** DB categories → display pillar */
export function pillarForCategory(category: ProtocolCategory): LwmPillarId {
  switch (category) {
    case "light":
      return "light";
    case "water_food":
      return "water";
    case "grounding":
    case "emf":
      return "magnetism";
    case "cold":
    case "movement":
    case "sleep":
    case "other":
    default:
      return "support";
  }
}

export function pillarMeta(id: LwmPillarId): LwmPillarMeta {
  return LWM_PILLARS.find((p) => p.id === id) ?? LWM_PILLARS[3]!;
}

/**
 * Water keystones — daily non-negotiables for the Water pillar.
 * Logging any counts as “Water done” for the LWM strip.
 */
export const WATER_KEYSTONE_IDS = [
  "low-d-hydration",
  "deuterium-aware-meal",
  "mineralized-water",
] as const;

/**
 * Magnetism keystones — earth contact / low artificial field / nnEMF block.
 */
export const MAGNETISM_KEYSTONE_IDS = [
  "barefoot-earth",
  "magnetic-awareness",
  "reduce-nnemf-block",
  "nature-contact",
  "sleep-space",
] as const;

export function isWaterKeystoneId(id: string): boolean {
  return (WATER_KEYSTONE_IDS as readonly string[]).includes(id);
}

export function isMagnetismKeystoneId(id: string): boolean {
  return (MAGNETISM_KEYSTONE_IDS as readonly string[]).includes(id);
}

export type LwmDayProgress = {
  light: boolean;
  water: boolean;
  magnetism: boolean;
  lightLabel: string;
  waterLabel: string;
  magnetismLabel: string;
  allThree: boolean;
  doneCount: number;
};

/**
 * Daily L/W/M completion from today's log counts.
 * Light = any sunrise keystone protocol logged (or day boost already active).
 */
export function computeLwmProgress(
  completionCounts: Record<string, number>,
  protocols: Pick<Protocol, "id">[],
  opts?: { sunriseMultiplier?: number },
): LwmDayProgress {
  const lightFromLogs = protocols.some(
    (p) =>
      isSunriseKeystoneProtocol(p) && (completionCounts[p.id] ?? 0) > 0,
  );
  const light =
    lightFromLogs ||
    (opts?.sunriseMultiplier != null && opts.sunriseMultiplier > 1);

  const water = WATER_KEYSTONE_IDS.some(
    (id) => (completionCounts[id] ?? 0) > 0,
  );
  const magnetism = MAGNETISM_KEYSTONE_IDS.some(
    (id) => (completionCounts[id] ?? 0) > 0,
  );

  const doneCount = [light, water, magnetism].filter(Boolean).length;

  return {
    light,
    water,
    magnetism,
    lightLabel: light ? "Morning light logged" : "Need sunrise / AM light",
    waterLabel: water
      ? "Water keystone logged"
      : "Need low-D hydration or meal",
    magnetismLabel: magnetism
      ? "Magnetism action logged"
      : "Need ground / low-RF hour",
    allThree: doneCount === 3,
    doneCount,
  };
}

/** Pillar order for catalog grouping (support last). */
export const PILLAR_ORDER: LwmPillarId[] = [
  "light",
  "water",
  "magnetism",
  "support",
];
