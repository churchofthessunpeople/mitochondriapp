import type { ProtocolCategory } from "@/db/schema";
import { type LwmPillarId, pillarForCategory } from "@/lib/lwm";

export const CATEGORY_ORDER: ProtocolCategory[] = [
  "light",
  "water_food",
  "grounding",
  "emf",
  "cold",
  "movement",
  "sleep",
  "other",
];

export const CATEGORY_META: Record<
  ProtocolCategory,
  { label: string; blurb: string; pillar: LwmPillarId }
> = {
  light: {
    label: "Light & sun",
    blurb: "Sunrise, outdoor spectrum, UV, red/NIR, circadian cues.",
    pillar: "light",
  },
  water_food: {
    label: "Water & fuel",
    blurb: "Deuterium-aware hydration and meals · ATP synthase context.",
    pillar: "water",
  },
  grounding: {
    label: "Grounding",
    blurb: "Barefoot earth contact — magnetism lifestyle.",
    pillar: "magnetism",
  },
  emf: {
    label: "Field hygiene",
    blurb: "nnEMF reduction and lower artificial EM environment.",
    pillar: "magnetism",
  },
  cold: {
    label: "Cold",
    blurb: "Thermogenesis and mitochondrial challenge.",
    pillar: "support",
  },
  movement: {
    label: "Movement",
    blurb: "Daylight-timed physical work and play.",
    pillar: "support",
  },
  sleep: {
    label: "Night & sleep",
    blurb: "Darkness, blue hygiene, recovery window.",
    pillar: "support",
  },
  other: {
    label: "Other",
    blurb: "Everything else in the stack.",
    pillar: "support",
  },
};

export { pillarForCategory };
