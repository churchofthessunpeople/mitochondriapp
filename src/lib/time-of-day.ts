import type { TimeOfDay } from "@/db/schema";

export const TIME_OF_DAY_ORDER: TimeOfDay[] = [
  "sunrise",
  "morning",
  "afternoon",
  "evening",
  "sunset",
  "night",
  "anytime",
];

/** Warm / low-blue accents only (no sky cyan / indigo / teal). */
export const TIME_OF_DAY_META: Record<
  TimeOfDay,
  { label: string; blurb: string; accent: string; icon: string }
> = {
  sunrise: {
    label: "Sunrise",
    blurb: "First light, grounding, and solar call signals.",
    accent: "from-amber-400/20 to-orange-500/10 border-amber-400/30",
    icon: "Sunrise",
  },
  morning: {
    label: "Morning",
    blurb: "Build the day's mitochondrial baseline.",
    accent: "from-amber-300/20 to-yellow-600/10 border-amber-300/30",
    icon: "Sun",
  },
  afternoon: {
    label: "Afternoon",
    blurb: "Protect redox and keep light timing tight.",
    accent: "from-yellow-500/15 to-orange-400/10 border-yellow-500/30",
    icon: "CloudSun",
  },
  evening: {
    label: "Evening",
    blurb: "Wind down blue light and artificial stress.",
    accent: "from-orange-500/20 to-rose-700/10 border-orange-500/30",
    icon: "Sunset",
  },
  sunset: {
    label: "Sunset",
    blurb: "Catch the last UVA/UVB and red light cues.",
    accent: "from-rose-400/20 to-orange-600/10 border-rose-400/30",
    icon: "Sunset",
  },
  night: {
    label: "Night",
    blurb: "Darkness, sleep architecture, and recovery.",
    accent: "from-stone-600/25 to-amber-950/40 border-stone-500/30",
    icon: "Moon",
  },
  anytime: {
    label: "Anytime",
    blurb: "Protocols that fit whenever you can do them.",
    accent: "from-amber-600/15 to-orange-800/10 border-amber-600/30",
    icon: "Sparkles",
  },
};
