/**
 * LOCAL ACTIVITY CATALOG — source of truth (like Mitoversity articles).
 *
 * Edit this file to add/change/remove activities, then restart `npm run dev`.
 * Neon auto-syncs these rows for favorites/logs FKs; you do not need db:seed
 * just to try a new activity locally.
 *
 * Optional how-to / equipment: src/lib/protocol-meta.ts
 */
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
  /** Legacy DB field — multi-log activities are uncapped in app logic */
  maxPerDay: number;
  durationEnabled: boolean;
  referenceMinutes: number;
  maxDurationMinutes: number;
  sortOrder: number;
  /** Auto-log every day while on the user's available list */
  permanent?: boolean;
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
    | "permanent"
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
        | "permanent"
      >
    >,
): ProtocolSeed {
  const multi = partial.allowsMultiple ?? false;
  return {
    lockedTimeOfDay: partial.lockedTimeOfDay ?? null,
    allowsMultiple: multi,
    durationEnabled: partial.durationEnabled ?? false,
    referenceMinutes: partial.referenceMinutes ?? 15,
    maxDurationMinutes: partial.maxDurationMinutes ?? 60,
    maxPerDay: partial.maxPerDay ?? (multi ? 9999 : 1),
    permanent: partial.permanent ?? false,
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
    sortOrder: 10,
  }),
  p({
    id: "midday-sun-skin",
    name: "Pure / midday sun on skin",
    description:
      "Safe non-burning UV on skin near solar noon when season/latitude allow—natural vitamin D₃ production; prefer outdoor sun over routine pills when UV is available.",
    points: 8,
    category: "light",
    timeOfDay: "afternoon",
    allowsMultiple: true,
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
    points: 6,
    category: "light",
    timeOfDay: "anytime",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 30,
    sortOrder: 53,
  }),
  p({
    id: "barefoot-earth",
    name: "Barefoot earth contact",
    description:
      "Barefoot time on soil, grass, sand, or stone. Magnetism keystone — Earth contact lifestyle.",
    points: 7,
    category: "grounding",
    timeOfDay: "morning",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 60,
    sortOrder: 12,
  }),
  p({
    id: "nature-contact",
    name: "Nature immersion",
    description: "Green/blue space away from dense artificial light and RF.",
    points: 4,
    category: "grounding",
    timeOfDay: "afternoon",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 120,
    sortOrder: 22,
  }),
  p({
    id: "low-d-hydration",
    name: "Low-D morning hydration",
    description:
      "First mineralized water in daylight — Water keystone. Lifestyle proxy for lower deuterium load on the mitochondrial water story.",
    points: 8,
    category: "water_food",
    timeOfDay: "morning",
    allowsMultiple: true,
    sortOrder: 8,
  }),
  p({
    id: "mineralized-water",
    name: "Purified and Mineralized Water",
    description:
      "Mineralized/spring water. Remineralize if using RO purified water",
    points: 4,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
    sortOrder: 50,
  }),
  p({
    id: "carbonated-water",
    name: "Carbonated / sparkling water",
    description:
      "Sparkling or carbonated water (not soda). Can purchase a Sodastream or other carbonator to make at home.",
    points: 4,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
    sortOrder: 51,
  }),
  p({
    id: "hydration-timing",
    name: "Daylight-aligned hydration",
    description: "Hydrate earlier; taper late for sleep architecture.",
    points: 2,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
    sortOrder: 54,
  }),
  p({
    id: "deuterium-aware-meal",
    name: "Deuterium-aware meal",
    description:
      "Lower-deuterium choices: seafood, C3 plants, quality fats. Water keystone — ATP synthase / mitochondrial water lifestyle frame.",
    points: 8,
    category: "water_food",
    timeOfDay: "morning",
    allowsMultiple: true,
    sortOrder: 9,
  }),
  p({
    id: "seafood-meal",
    name: "Seafood-forward meal",
    description: "Cold-water seafood or high-quality marine fats.",
    points: 6,
    category: "water_food",
    timeOfDay: "afternoon",
    allowsMultiple: true,
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
    sortOrder: 11,
  }),
  p({
    id: "cold-thermogenesis",
    name: "Cold thermogenesis session",
    description:
      "Cold shower, plunge, or deliberate cold exposure. Skin temp ~50°F optimal; warmer in 5° steps earns fewer base points before duration.",
    points: 24,
    category: "cold",
    timeOfDay: "anytime",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 20,
    sortOrder: 51,
  }),
  p({
    id: "reduce-nnemf-block",
    name: "nnEMF reduction block",
    description: "Airplane mode, router distance, or outdoor low-RF block.",
    points: 3,
    category: "emf",
    timeOfDay: "afternoon",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 180,
    sortOrder: 21,
  }),
  p({
    id: "magnetic-awareness",
    name: "Low artificial field hour",
    description:
      "Hour outdoors or in lower artificial EM environment. Magnetism keystone.",
    points: 2,
    category: "emf",
    timeOfDay: "anytime",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
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
    id: "air-tube-headphones",
    name: "Air tube headphones for calls",
    description:
      "Use air-tube headphones for phone and video calls so the handset stays away from your head. Permanent: auto-logs daily while on your available list.",
    points: 5,
    category: "emf",
    timeOfDay: "anytime",
    permanent: true,
    sortOrder: 57,
  }),
  p({
    id: "magnetico-sleep-pad",
    name: "Magnetico sleep pad",
    description:
      "Slept on a Magnetico (or equivalent under-mattress unidirectional) magnetic sleep system. Choose 5 / 10 / 20 gauss — 1.25× / 1.5× / 2× on base points. Permanent: auto-logs nightly while on your available list.",
    points: 10,
    category: "emf",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    permanent: true,
    sortOrder: 63,
  }),
  p({
    id: "breaker-off-bedroom",
    name: "Bedroom breakers off",
    description:
      "Bedroom circuits switched off at the panel overnight (dirty electricity / AC fields). Permanent: auto-logs nightly while on your available list.",
    points: 6,
    category: "emf",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    permanent: true,
    sortOrder: 64,
  }),
  p({
    id: "breaker-off-office",
    name: "Office breakers off",
    description:
      "Main work / office circuits off when not in use (or on a low-field schedule). Permanent: auto-logs daily while on your available list.",
    points: 6,
    category: "emf",
    timeOfDay: "morning",
    permanent: true,
    sortOrder: 22,
  }),
  p({
    id: "morning-movement",
    name: "Mitochondrial movement",
    description: "Zone 2, resistance, or play outside in daylight.",
    points: 3,
    category: "movement",
    timeOfDay: "morning",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 120,
    sortOrder: 13,
  }),
  p({
    id: "mastic-gum",
    name: "Mastic gum chewing",
    description:
      "Chew real Chios mastic resin/gum for intentional jaw load and a non-snack oral habit. Not candy gum. Equipment required.",
    points: 5,
    category: "movement",
    timeOfDay: "anytime",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
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
    id: "dark-bedroom",
    name: "True dark sleep environment",
    description:
      "Pitch-black or eye mask; minimal night light pollution. Permanent: auto-logs nightly while on your available list.",
    points: 8,
    category: "sleep",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    permanent: true,
    sortOrder: 60,
  }),
  p({
    id: "cool-bedroom-sleep",
    name: "Cool bedroom sleep",
    description:
      "Bedroom at 65°F or cooler for overnight thermoregulation. 65°F = 10 pts; each degree warmer on the thermostat costs 1 pt. Permanent: auto-logs nightly while on your available list.",
    points: 10,
    category: "sleep",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    permanent: true,
    sortOrder: 61,
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
