import type { ProtocolCategory } from "@/db/schema";

export const CATEGORY_ORDER: ProtocolCategory[] = [
  "light",
  "grounding",
  "water_food",
  "cold",
  "emf",
  "movement",
  "sleep",
  "other",
];

export const CATEGORY_META: Record<
  ProtocolCategory,
  { label: string; blurb: string }
> = {
  light: { label: "Light & sun", blurb: "Solar call, UV, red/NIR, circadian cues." },
  grounding: { label: "Grounding & earth", blurb: "Barefoot contact and nature charge." },
  water_food: { label: "Water & food", blurb: "Deuterium-aware fuel and hydration." },
  cold: { label: "Cold", blurb: "Thermogenesis and mitochondrial challenge." },
  emf: { label: "EMF / magnetism", blurb: "nnEMF hygiene and field awareness." },
  movement: { label: "Movement", blurb: "Daylight-timed physical work and play." },
  sleep: { label: "Night & sleep", blurb: "Darkness, timing, and recovery." },
  other: { label: "Other", blurb: "Everything else in the stack." },
};
