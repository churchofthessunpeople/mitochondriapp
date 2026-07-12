import type { TimeOfDay } from "./schema";

export type ProtocolSeed = {
  id: string;
  name: string;
  description: string;
  points: number;
  timeOfDay: TimeOfDay;
  sortOrder: number;
};

/**
 * Provisional seed list inspired by common Dr. Jack Kruse lifestyle themes
 * (light, magnetism, water, cold, circadian timing). Point values are starting
 * estimates for game feel — refine with your own weighting later.
 */
export const PROTOCOL_SEEDS: ProtocolSeed[] = [
  {
    id: "sunrise-grounding",
    name: "Sunrise + grounding",
    description:
      "See the sunrise with as much skin exposed as practical while bare skin contacts the earth (grounding).",
    points: 10,
    timeOfDay: "sunrise",
    sortOrder: 1,
  },
  {
    id: "barefoot-earth",
    name: "Barefoot earth contact",
    description:
      "Spend intentional barefoot time on natural ground (soil, grass, sand, stone) at first light.",
    points: 6,
    timeOfDay: "sunrise",
    sortOrder: 2,
  },
  {
    id: "no-sunglasses-sunrise",
    name: "No sunglasses at sunrise",
    description:
      "Allow full-spectrum morning light to the eyes without sunglasses or blue-blocking lenses at sunrise.",
    points: 4,
    timeOfDay: "sunrise",
    sortOrder: 3,
  },
  {
    id: "cold-face-plunge",
    name: "Cold face / head immersion",
    description:
      "Cold water on the face or brief head immersion to stimulate mitochondrial and autonomic tone.",
    points: 5,
    timeOfDay: "morning",
    sortOrder: 10,
  },
  {
    id: "morning-natural-light",
    name: "Outdoor natural light walk",
    description:
      "Get outside for natural light exposure soon after waking — ideally without glass between you and the sky.",
    points: 7,
    timeOfDay: "morning",
    sortOrder: 11,
  },
  {
    id: "deuterium-aware-meal",
    name: "Deuterium-aware meal",
    description:
      "Prioritize lower-deuterium food choices (e.g. seafood, C3 plants, quality fats) for at least one meal.",
    points: 6,
    timeOfDay: "morning",
    sortOrder: 12,
  },
  {
    id: "morning-movement",
    name: "Mitochondrial movement",
    description:
      "Zone 2 walk, resistance work, or play outside — movement timed with daylight, not only indoor screens.",
    points: 5,
    timeOfDay: "morning",
    sortOrder: 13,
  },
  {
    id: "mineralized-water",
    name: "Mineralized / structured water",
    description:
      "Drink well-mineralized water (and avoid constantly chugging pure deionized water all day).",
    points: 3,
    timeOfDay: "anytime",
    sortOrder: 50,
  },
  {
    id: "midday-sun-skin",
    name: "Midday sun on skin",
    description:
      "Safe, non-burning UV exposure on skin around solar noon when your latitude/season allows.",
    points: 8,
    timeOfDay: "afternoon",
    sortOrder: 20,
  },
  {
    id: "reduce-nnemf-block",
    name: "nnEMF reduction block",
    description:
      "Airplane mode, distance from routers, or an outdoor nnEMF-minimized block during work/rest.",
    points: 5,
    timeOfDay: "afternoon",
    sortOrder: 21,
  },
  {
    id: "nature-contact",
    name: "Nature immersion",
    description:
      "Time in green/blue space — trees, water, parks — away from dense artificial light and RF.",
    points: 5,
    timeOfDay: "afternoon",
    sortOrder: 22,
  },
  {
    id: "seafood-meal",
    name: "Seafood-forward meal",
    description:
      "Include cold-water seafood (or high-quality marine fats) as a mitochondrial fuel signal.",
    points: 6,
    timeOfDay: "afternoon",
    sortOrder: 23,
  },
  {
    id: "sunset-viewing",
    name: "Watch the sunset",
    description:
      "View sunset light with bare eyes (no sunglasses) to reinforce circadian timing.",
    points: 8,
    timeOfDay: "sunset",
    sortOrder: 30,
  },
  {
    id: "sunset-grounding",
    name: "Sunset grounding",
    description:
      "Barefoot earth contact during the sunset window to pair magnetic and light cues.",
    points: 7,
    timeOfDay: "sunset",
    sortOrder: 31,
  },
  {
    id: "blue-light-hygiene",
    name: "Evening blue-light hygiene",
    description:
      "Dim screens, use warm lighting, or blue blockers after sunset; avoid bright LEDs to the eyes.",
    points: 7,
    timeOfDay: "evening",
    sortOrder: 40,
  },
  {
    id: "candle-firelight",
    name: "Candle / firelight evening",
    description:
      "Prefer fire, candles, or very warm low lux lighting after dark instead of cool white LEDs.",
    points: 6,
    timeOfDay: "evening",
    sortOrder: 41,
  },
  {
    id: "early-dinner",
    name: "Earlier last meal",
    description:
      "Finish eating with enough buffer before sleep to support overnight mitochondrial repair.",
    points: 4,
    timeOfDay: "evening",
    sortOrder: 42,
  },
  {
    id: "dark-bedroom",
    name: "True dark sleep environment",
    description:
      "Pitch-black (or eye mask), no charging phones by the head, minimal night light pollution.",
    points: 8,
    timeOfDay: "night",
    sortOrder: 60,
  },
  {
    id: "phone-away-sleep",
    name: "Phone away from bed",
    description:
      "Sleep with phone in another room or far from the headboard on airplane mode.",
    points: 5,
    timeOfDay: "night",
    sortOrder: 61,
  },
  {
    id: "consistent-sleep-window",
    name: "Circadian sleep window",
    description:
      "Hit a consistent dark sleep window aligned with night — not a 2am social jet-lag night.",
    points: 7,
    timeOfDay: "night",
    sortOrder: 62,
  },
  {
    id: "cold-thermogenesis",
    name: "Cold thermogenesis session",
    description:
      "Cold shower, cold plunge, or deliberate cold exposure to challenge mitochondria.",
    points: 8,
    timeOfDay: "anytime",
    sortOrder: 51,
  },
  {
    id: "magnetic-awareness",
    name: "Low artificial field hour",
    description:
      "An hour outdoors or in a lower artificial EM environment — parks, water, rural ground.",
    points: 6,
    timeOfDay: "anytime",
    sortOrder: 52,
  },
  {
    id: "red-nir-light",
    name: "Red / near-IR light",
    description:
      "Natural dusk red light or intentional red/NIR exposure (not as a substitute for sun).",
    points: 4,
    timeOfDay: "anytime",
    sortOrder: 53,
  },
  {
    id: "hydration-timing",
    name: "Daylight-aligned hydration",
    description:
      "Hydrate more earlier in the day; taper heavy fluid load late to protect sleep architecture.",
    points: 2,
    timeOfDay: "anytime",
    sortOrder: 54,
  },
];
