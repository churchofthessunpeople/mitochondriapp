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
  /**
   * Retired from catalog UI (kept for history / FK name resolution).
   * Rolled into Sleep Space / Work Space composites.
   */
  retired?: boolean;
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
    | "retired"
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
        | "retired"
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
    retired: partial.retired ?? false,
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
    id: "sun-exposure",
    name: "Outside Time",
    description:
      "Time outdoors — pick morning, solar noon, or afternoon (from your place sun times), full sun or shaded, and how long you stayed.",
    points: 8,
    category: "light",
    timeOfDay: "anytime",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 120,
    sortOrder: 10,
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
      "Retired — now an option under Drinking water (source + salt/baking soda).",
    points: 4,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
    sortOrder: 50,
    retired: true,
  }),
  p({
    id: "carbonated-water",
    name: "Carbonated / sparkling water",
    description:
      "Retired — now Still / Carbonated under Drinking water.",
    points: 4,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
    sortOrder: 51,
    retired: true,
  }),
  p({
    id: "baking-soda-water",
    name: "Baking soda water",
    description:
      "Retired — now Baking soda remineralization under Drinking water.",
    points: 4,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
    sortOrder: 53,
    retired: true,
  }),
  p({
    id: "drinking-water",
    name: "Drinking water",
    description:
      "Log a glass: RO, spring, or deuterium-depleted; salt or baking soda remineralization; still or carbonated. DDW includes deuterium PPM.",
    points: 4,
    category: "water_food",
    timeOfDay: "anytime",
    allowsMultiple: true,
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
    sortOrder: 54,
  }),
  p({
    id: "castor-oil-navel",
    name: "Castor oil navel application",
    description:
      "Organic cold-pressed castor oil applied to the belly button (navel). Low-cost Support / Water adjunct — equipment required.",
    points: 6,
    category: "water_food",
    timeOfDay: "evening",
    sortOrder: 52,
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
    description:
      "Retired — now Face immersion under Cold thermogenesis. Cold water on face or brief head immersion (3 rounds).",
    points: 5,
    category: "cold",
    timeOfDay: "morning",
    allowsMultiple: true,
    sortOrder: 111,
    retired: true,
  }),
  p({
    id: "cold-thermogenesis",
    name: "Cold thermogenesis",
    description:
      "Plunge, cold shower, or face immersion. Pick mode, skin temp (~50°F target), and duration for plunge/shower — face immersion is 3 rounds.",
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
    description:
      "Retired — now an option under Sleep Space. Phone in another room or far away on airplane mode.",
    points: 5,
    category: "emf",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 61,
    retired: true,
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
    id: "sleep-space",
    name: "Sleep Space",
    description:
      "Bedroom hygiene stack — cool temp, Magnetico, dark, circadian sleep window, breakers, phone away, grounding mat, negative ions. Points = sum of enabled options. Permanent: auto-logs nightly while on your available list.",
    points: 0,
    category: "emf",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    permanent: true,
    sortOrder: 60,
  }),
  p({
    id: "work-space",
    name: "Work Space",
    description:
      "Desk / office hygiene stack — breakers, grounding mat, negative ions, low artificial field. Points = sum of enabled options. Permanent: auto-logs daily while on your available list (no fixed time).",
    points: 0,
    category: "emf",
    timeOfDay: "anytime",
    permanent: true,
    sortOrder: 22,
  }),
  p({
    id: "magnetico-sleep-pad",
    name: "Magnetico sleep pad",
    description:
      "Retired — now an option under Sleep Space. Under-mattress unidirectional magnetic sleep system.",
    points: 25,
    category: "emf",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 63,
    retired: true,
  }),
  p({
    id: "breaker-off-bedroom",
    name: "Bedroom breakers off",
    description:
      "Retired — now an option under Sleep Space. Bedroom circuits off overnight.",
    points: 6,
    category: "emf",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 64,
    retired: true,
  }),
  p({
    id: "breaker-off-office",
    name: "Office breakers off",
    description:
      "Retired — now an option under Work Space. Office circuits off when not in use.",
    points: 6,
    category: "emf",
    timeOfDay: "anytime",
    sortOrder: 23,
    retired: true,
  }),
  p({
    id: "morning-movement",
    name: "Mitochondrial movement",
    description:
      "Retired — now under Exercise (walking / resistance bands / rebounding).",
    points: 3,
    category: "movement",
    timeOfDay: "morning",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 120,
    sortOrder: 13,
    retired: true,
  }),
  p({
    id: "rebounding",
    name: "Rebounding",
    description:
      "Retired — now Rebounding under Exercise. Mini-trampoline sessions.",
    points: 3,
    category: "movement",
    timeOfDay: "anytime",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 60,
    sortOrder: 14,
    retired: true,
  }),
  p({
    id: "exercise",
    name: "Exercise",
    description:
      "Rebounding, resistance bands, or walking — indoors or outdoors, with duration.",
    points: 3,
    category: "movement",
    timeOfDay: "anytime",
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
    id: "tuning-forks",
    name: "Tuning forks",
    description:
      "Intentional sound/vibration session with tuning forks — 40 Hz recommended; C128 (128 Hz) weighted fork for on-body parasympathetic work. Equipment required.",
    points: 5,
    category: "other",
    timeOfDay: "anytime",
    allowsMultiple: true,
    durationEnabled: true,
    referenceMinutes: 15,
    maxDurationMinutes: 45,
    sortOrder: 56,
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
    id: "screen-light-hygiene",
    name: "Screen light hygiene",
    description:
      "Strip blue from phone, tablet, and computer screens — Night Shift / Night Light at max warmth, or IRIS or f.lux on desktops.",
    points: 6,
    category: "light",
    timeOfDay: "evening",
    sortOrder: 39,
  }),
  p({
    id: "dark-bedroom",
    name: "True dark sleep environment",
    description:
      "Retired — now an option under Sleep Space. Pitch-black or eye mask.",
    points: 8,
    category: "sleep",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 160,
    retired: true,
  }),
  p({
    id: "cool-bedroom-sleep",
    name: "Cool bedroom sleep",
    description:
      "Retired — now an option under Sleep Space. Bedroom at 65°F or cooler.",
    points: 10,
    category: "sleep",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 161,
    retired: true,
  }),
  p({
    id: "consistent-sleep-window",
    name: "Circadian sleep window",
    description:
      "Retired — now an option under Sleep Space. Consistent dark sleep window aligned with night.",
    points: 7,
    category: "sleep",
    timeOfDay: "night",
    lockedTimeOfDay: "night",
    sortOrder: 162,
    retired: true,
  }),
];
