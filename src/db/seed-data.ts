import type { ProtocolCategory, TimeOfDay } from "./schema";

export type ProtocolSeed = {
  id: string;
  name: string;
  description: string;
  points: number;
  category: ProtocolCategory;
  timeOfDay: TimeOfDay;
  lockedTimeOfDay: TimeOfDay | null;
  allowsMultiple: boolean;
  maxPerDay: number;
  durationEnabled: boolean;
  referenceMinutes: number;
  maxDurationMinutes: number;
  sortOrder: number;
};

function p(
  partial: Omit<
    ProtocolSeed,
    | "maxPerDay"
    | "durationEnabled"
    | "referenceMinutes"
    | "maxDurationMinutes"
    | "allowsMultiple"
    | "lockedTimeOfDay"
  > &
    Partial<
      Pick<
        ProtocolSeed,
        | "maxPerDay"
        | "durationEnabled"
        | "referenceMinutes"
        | "maxDurationMinutes"
        | "allowsMultiple"
        | "lockedTimeOfDay"
      >
    >,
): ProtocolSeed {
  const multi = partial.allowsMultiple ?? false;
  return {
    lockedTimeOfDay: partial.lockedTimeOfDay ?? null,
    allowsMultiple: multi,
    durationEnabled: partial.durationEnabled ?? false,
    referenceMinutes: partial.referenceMinutes ?? 10,
    maxDurationMinutes: partial.maxDurationMinutes ?? 60,
    maxPerDay: partial.maxPerDay ?? (multi ? 5 : 1),
    id: partial.id,
    name: partial.name,
    description: partial.description,
    points: partial.points,
    category: partial.category,
    timeOfDay: partial.timeOfDay,
    sortOrder: partial.sortOrder,
  };
}

export const PROTOCOL_SEEDS: ProtocolSeed[] = [
  p({
    id: "sunrise-horizon",
    name: "Sun over the horizon",
    description:
      "Watch the sun come up over the horizon with bare eyes (no glass). Best morning signal — unlocks 2× on other activities today.",
    points: 12,
    category: "light",
    timeOfDay: "sunrise",
    lockedTimeOfDay: "sunrise",
    sortOrder: 1,
  }),
  p({
    id: "sunrise-open-sky",
    name: "Open-sky morning light",
    description:
      "Outside under decent open skies in the morning (full-spectrum light to the eyes). Unlocks 1.5× on other activities today.",
    points: 8,
    category: "light",
    timeOfDay: "sunrise",
    lockedTimeOfDay: "sunrise",
    sortOrder: 2,
  }),
  p({
    id: "sunrise-outside",
    name: "Outside morning light",
    description:
      "Got outside in the morning with limited sky view (trees, streets, heavy overcast). Unlocks 1.25× on other activities today.",
    points: 5,
    category: "light",
    timeOfDay: "sunrise",
    lockedTimeOfDay: "sunrise",
    sortOrder: 3,
  }),
  p({
    id: "morning-natural-light",
    name: "Outdoor natural light",
    description: "Get outside for natural light without glass between you and the sky.",
    points: 7,
    category: "light",
    timeOfDay: "morning",
    allowsMultiple: true,
    maxPerDay: 4,
    sortOrder: 10,
  }),
  p({
    id: "midday-sun-skin",
    name: "Pure / midday sun on skin",
    description: "Safe non-burning UV on skin when season/latitude allows.",
    points: 8,
    category: "light",
    timeOfDay: "afternoon",
    allowsMultiple: true,
    maxPerDay: 4,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 45,
    sortOrder: 20,
  }),
  p({
    id: "sunset-viewing",
    name: "Watch the sunset",
    description: "View sunset light with bare eyes for circadian timing.",
    points: 8,
    category: "light",
    timeOfDay: "sunset",
    lockedTimeOfDay: "sunset",
    sortOrder: 30,
  }),
  p({
    id: "red-nir-light",
    name: "Red / near-IR light",
    description: "Natural dusk red or intentional red/NIR exposure.",
    points: 4,
    category: "light",
    timeOfDay: "anytime",
    allowsMultiple: true,
    maxPerDay: 3,
    durationEnabled: true,
    referenceMinutes: 10,
    maxDurationMinutes: 30,
    sortOrder: 53,
  }),
  p({
    id: "barefoot-earth",
    name: "Barefoot earth contact",
    description: "Barefoot time on soil, grass, sand, or stone.",
    points: 6,
    category: "grounding",
    timeOfDay: "morning",
    allowsMultiple: true,
    maxPerDay: 5,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 60,
    sortOrder: 12,
  }),
  p({
    id: "sunset-grounding",
    name: "Sunset grounding",
    description: "Barefoot earth contact during the sunset window.",
    points: 7,
    category: "grounding",
    timeOfDay: "sunset",
    lockedTimeOfDay: "sunset",
    sortOrder: 31,
  }),
  p({
    id: "nature-contact",
    name: "Nature immersion",
    description: "Green/blue space away from dense artificial light and RF.",
    points: 5,
    category: "grounding",
    timeOfDay: "afternoon",
    allowsMultiple: true,
    maxPerDay: 3,
    durationEnabled: true,
    referenceMinutes: 20,
    maxDurationMinutes: 120,
    sortOrder: 22,
  }),
  p({
    id: "mineralized-water",
    name: "Mineralized / structured water",
    description: "Well-mineralized water (not only deionized all day).",
    points: 3,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
    maxPerDay: 6,
    sortOrder: 50,
  }),
  p({
    id: "hydration-timing",
    name: "Daylight-aligned hydration",
    description: "Hydrate earlier; taper late for sleep architecture.",
    points: 2,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
    maxPerDay: 4,
    sortOrder: 54,
  }),
  p({
    id: "deuterium-aware-meal",
    name: "Deuterium-aware meal",
    description: "Lower-deuterium choices: seafood, C3 plants, quality fats.",
    points: 6,
    category: "water_food",
    timeOfDay: "morning",
    allowsMultiple: true,
    maxPerDay: 3,
    sortOrder: 12,
  }),
  p({
    id: "seafood-meal",
    name: "Seafood-forward meal",
    description: "Cold-water seafood or high-quality marine fats.",
    points: 6,
    category: "water_food",
    timeOfDay: "afternoon",
    allowsMultiple: true,
    maxPerDay: 2,
    sortOrder: 23,
  }),
  p({
    id: "early-dinner",
    name: "Earlier last meal",
    description: "Finish eating with buffer before sleep.",
    points: 4,
    category: "water_food",
    timeOfDay: "evening",
    sortOrder: 42,
  }),
  p({
    id: "cold-face-plunge",
    name: "Cold face / head immersion",
    description: "Cold water on face or brief head immersion.",
    points: 5,
    category: "cold",
    timeOfDay: "morning",
    allowsMultiple: true,
    maxPerDay: 3,
    sortOrder: 11,
  }),
  p({
    id: "cold-thermogenesis",
    name: "Cold thermogenesis session",
    description: "Cold shower, plunge, or deliberate cold exposure.",
    points: 8,
    category: "cold",
    timeOfDay: "anytime",
    allowsMultiple: true,
    maxPerDay: 2,
    durationEnabled: true,
    referenceMinutes: 5,
    maxDurationMinutes: 20,
    sortOrder: 51,
  }),
  p({
    id: "reduce-nnemf-block",
    name: "nnEMF reduction block",
    description: "Airplane mode, router distance, or outdoor low-RF block.",
    points: 5,
    category: "emf",
    timeOfDay: "afternoon",
    allowsMultiple: true,
    maxPerDay: 4,
    durationEnabled: true,
    referenceMinutes: 30,
    maxDurationMinutes: 180,
    sortOrder: 21,
  }),
  p({
    id: "magnetic-awareness",
    name: "Low artificial field hour",
    description: "Hour outdoors or in lower artificial EM environment.",
    points: 6,
    category: "emf",
    timeOfDay: "anytime",
    allowsMultiple: true,
    maxPerDay: 3,
    durationEnabled: true,
    referenceMinutes: 60,
    maxDurationMinutes: 180,
    sortOrder: 52,
  }),
  p({
    id: "phone-away-sleep",
    name: "Phone away from bed",
    description: "Phone in another room or far away on airplane mode.",
    points: 5,
    category: "emf",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 61,
  }),
  p({
    id: "morning-movement",
    name: "Mitochondrial movement",
    description: "Zone 2, resistance, or play outside in daylight.",
    points: 5,
    category: "movement",
    timeOfDay: "morning",
    allowsMultiple: true,
    maxPerDay: 3,
    durationEnabled: true,
    referenceMinutes: 30,
    maxDurationMinutes: 120,
    sortOrder: 13,
  }),
  p({
    id: "mastic-gum",
    name: "Mastic gum chewing",
    description: "Chew mastic gum for jaw tone and oral rest from snacking.",
    points: 3,
    category: "movement",
    timeOfDay: "anytime",
    allowsMultiple: true,
    maxPerDay: 5,
    durationEnabled: true,
    referenceMinutes: 10,
    maxDurationMinutes: 45,
    sortOrder: 55,
  }),
  p({
    id: "blue-light-hygiene",
    name: "Evening blue-light hygiene",
    description: "Dim screens, warm light, or blue blockers after sunset.",
    points: 7,
    category: "sleep",
    timeOfDay: "evening",
    sortOrder: 40,
  }),
  p({
    id: "candle-firelight",
    name: "Candle / firelight evening",
    description: "Fire, candles, or very warm low lux after dark.",
    points: 6,
    category: "sleep",
    timeOfDay: "evening",
    sortOrder: 41,
  }),
  p({
    id: "dark-bedroom",
    name: "True dark sleep environment",
    description: "Pitch-black or eye mask; minimal night light pollution.",
    points: 8,
    category: "sleep",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 60,
  }),
  p({
    id: "consistent-sleep-window",
    name: "Circadian sleep window",
    description: "Consistent dark sleep window aligned with night.",
    points: 7,
    category: "sleep",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 62,
  }),
];
