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
    accent: "from-sky-400/20 to-cyan-500/10 border-sky-400/30",
    icon: "Sun",
  },
  afternoon: {
    label: "Afternoon",
    blurb: "Protect redox and keep light timing tight.",
    accent: "from-yellow-400/15 to-lime-500/10 border-yellow-400/30",
    icon: "CloudSun",
  },
  evening: {
    label: "Evening",
    blurb: "Wind down blue light and artificial stress.",
    accent: "from-violet-400/20 to-purple-500/10 border-violet-400/30",
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
    accent: "from-indigo-500/20 to-slate-800/40 border-indigo-400/30",
    icon: "Moon",
  },
  anytime: {
    label: "Anytime",
    blurb: "Protocols that fit whenever you can do them.",
    accent: "from-emerald-400/15 to-teal-500/10 border-emerald-400/30",
    icon: "Sparkles",
  },
};
