import type { TimeOfDay } from "./schema";

export type ProtocolSeed = {
  id: string;
  name: string;
  description: string;
  points: number;
  /** Default slot when added to a new user's schedule */
  timeOfDay: TimeOfDay;
  /** If set, activity may only live in this slot */
  lockedTimeOfDay: TimeOfDay | null;
  /** Can be logged more than once per day */
  allowsMultiple: boolean;
  sortOrder: number;
};

export const PROTOCOL_SEEDS: ProtocolSeed[] = [
  {
    id: "sunrise-grounding",
    name: "Sunrise + grounding",
    description:
      "See the sunrise with as much skin exposed as practical while bare skin contacts the earth (grounding).",
    points: 10,
    timeOfDay: "sunrise",
    lockedTimeOfDay: "sunrise",
    allowsMultiple: false,
    sortOrder: 1,
  },
  {
    id: "barefoot-earth",
    name: "Barefoot earth contact",
    description:
      "Spend intentional barefoot time on natural ground (soil, grass, sand, stone).",
    points: 6,
    timeOfDay: "sunrise",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 2,
  },
  {
    id: "no-sunglasses-sunrise",
    name: "No sunglasses at sunrise",
    description:
      "Allow full-spectrum morning light to the eyes without sunglasses at sunrise.",
    points: 4,
    timeOfDay: "sunrise",
    lockedTimeOfDay: "sunrise",
    allowsMultiple: false,
    sortOrder: 3,
  },
  {
    id: "cold-face-plunge",
    name: "Cold face / head immersion",
    description:
      "Cold water on the face or brief head immersion to stimulate mitochondrial and autonomic tone.",
    points: 5,
    timeOfDay: "morning",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 10,
  },
  {
    id: "morning-natural-light",
    name: "Outdoor natural light",
    description:
      "Get outside for natural light — ideally without glass between you and the sky.",
    points: 7,
    timeOfDay: "morning",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 11,
  },
  {
    id: "deuterium-aware-meal",
    name: "Deuterium-aware meal",
    description:
      "Prioritize lower-deuterium food choices (e.g. seafood, C3 plants, quality fats).",
    points: 6,
    timeOfDay: "morning",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 12,
  },
  {
    id: "morning-movement",
    name: "Mitochondrial movement",
    description:
      "Zone 2 walk, resistance work, or play outside timed with daylight.",
    points: 5,
    timeOfDay: "morning",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 13,
  },
  {
    id: "mastic-gum",
    name: "Mastic gum chewing",
    description:
      "Chew mastic gum for jaw / fascial tone and mindful oral rest from snacking.",
    points: 3,
    timeOfDay: "anytime",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 55,
  },
  {
    id: "mineralized-water",
    name: "Mineralized / structured water",
    description:
      "Drink well-mineralized water (avoid only deionized water all day).",
    points: 3,
    timeOfDay: "anytime",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 50,
  },
  {
    id: "midday-sun-skin",
    name: "Pure / midday sun on skin",
    description:
      "Safe, non-burning UV exposure on skin when latitude/season allows.",
    points: 8,
    timeOfDay: "afternoon",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 20,
  },
  {
    id: "reduce-nnemf-block",
    name: "nnEMF reduction block",
    description:
      "Airplane mode, distance from routers, or an outdoor low-RF block.",
    points: 5,
    timeOfDay: "afternoon",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 21,
  },
  {
    id: "nature-contact",
    name: "Nature immersion",
    description:
      "Time in green/blue space away from dense artificial light and RF.",
    points: 5,
    timeOfDay: "afternoon",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 22,
  },
  {
    id: "seafood-meal",
    name: "Seafood-forward meal",
    description:
      "Include cold-water seafood or high-quality marine fats.",
    points: 6,
    timeOfDay: "afternoon",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 23,
  },
  {
    id: "sunset-viewing",
    name: "Watch the sunset",
    description:
      "View sunset light with bare eyes to reinforce circadian timing.",
    points: 8,
    timeOfDay: "sunset",
    lockedTimeOfDay: "sunset",
    allowsMultiple: false,
    sortOrder: 30,
  },
  {
    id: "sunset-grounding",
    name: "Sunset grounding",
    description:
      "Barefoot earth contact during the sunset window.",
    points: 7,
    timeOfDay: "sunset",
    lockedTimeOfDay: "sunset",
    allowsMultiple: false,
    sortOrder: 31,
  },
  {
    id: "blue-light-hygiene",
    name: "Evening blue-light hygiene",
    description:
      "Dim screens, warm lighting, or blue blockers after sunset.",
    points: 7,
    timeOfDay: "evening",
    lockedTimeOfDay: null,
    allowsMultiple: false,
    sortOrder: 40,
  },
  {
    id: "candle-firelight",
    name: "Candle / firelight evening",
    description:
      "Prefer fire, candles, or very warm low lux lighting after dark.",
    points: 6,
    timeOfDay: "evening",
    lockedTimeOfDay: null,
    allowsMultiple: false,
    sortOrder: 41,
  },
  {
    id: "early-dinner",
    name: "Earlier last meal",
    description:
      "Finish eating with enough buffer before sleep.",
    points: 4,
    timeOfDay: "evening",
    lockedTimeOfDay: null,
    allowsMultiple: false,
    sortOrder: 42,
  },
  {
    id: "dark-bedroom",
    name: "True dark sleep environment",
    description:
      "Pitch-black (or eye mask), phone away from the head.",
    points: 8,
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    allowsMultiple: false,
    sortOrder: 60,
  },
  {
    id: "phone-away-sleep",
    name: "Phone away from bed",
    description:
      "Sleep with phone in another room or far away on airplane mode.",
    points: 5,
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    allowsMultiple: false,
    sortOrder: 61,
  },
  {
    id: "consistent-sleep-window",
    name: "Circadian sleep window",
    description:
      "Consistent dark sleep window aligned with night.",
    points: 7,
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    allowsMultiple: false,
    sortOrder: 62,
  },
  {
    id: "cold-thermogenesis",
    name: "Cold thermogenesis session",
    description:
      "Cold shower, plunge, or deliberate cold exposure.",
    points: 8,
    timeOfDay: "anytime",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 51,
  },
  {
    id: "magnetic-awareness",
    name: "Low artificial field hour",
    description:
      "An hour outdoors or in a lower artificial EM environment.",
    points: 6,
    timeOfDay: "anytime",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 52,
  },
  {
    id: "red-nir-light",
    name: "Red / near-IR light",
    description:
      "Natural dusk red light or intentional red/NIR exposure.",
    points: 4,
    timeOfDay: "anytime",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 53,
  },
  {
    id: "hydration-timing",
    name: "Daylight-aligned hydration",
    description:
      "Hydrate more earlier in the day; taper late for sleep.",
    points: 2,
    timeOfDay: "anytime",
    lockedTimeOfDay: null,
    allowsMultiple: true,
    sortOrder: 54,
  },
];
