/**
 * Kruseiversity — educational entries on why each protocol matters
 * in Dr. Jack Kruse–style mitochondrial teaching.
 *
 * Expand this catalog over time; UI lists whatever is exported here.
 * Educational lifestyle framework only — not medical advice.
 */

export type KrusePillar = "light" | "water" | "magnetism" | "support";

export type KruseEntrySection = {
  heading: string;
  body: string;
};

export type KruseEntry = {
  id: string;
  title: string;
  pillar: KrusePillar;
  /** One-line list preview */
  summary: string;
  /** Related catalog protocol ids (optional deep links later) */
  relatedProtocolIds?: string[];
  sections: KruseEntrySection[];
};

export const KRUSE_PILLAR_LABEL: Record<KrusePillar, string> = {
  light: "Light",
  water: "Water",
  magnetism: "Magnetism",
  support: "Support",
};

/**
 * Curriculum entries. Add new objects here as the library grows.
 */
export const KRUSEIVERSITY_ENTRIES: readonly KruseEntry[] = [
  {
    id: "sunrise-why",
    title: "Why sunrise is so important",
    pillar: "light",
    summary:
      "First outdoor light of the day is the master circadian and mitochondrial timing signal in Kruse-style teaching.",
    relatedProtocolIds: [
      "sunrise-horizon",
      "sunrise-open-sky",
      "sunrise-outside",
    ],
    sections: [
      {
        heading: "The solar call sets the clock",
        body: "In Dr. Kruse’s framework, the morning outdoor light signal—especially true sunrise with the solar disk on the horizon—is treated as the day’s primary “solar call.” Full-spectrum light to the eyes (without glass or sunglasses for that first dose) is said to entrain the brain’s master clock and align downstream timing for energy, hormones, and sleep later that night. Miss that call and the rest of the day is fighting from behind.",
      },
      {
        heading: "Melanopsin, UV-A, and non-visual photoreception",
        body: "Kruse emphasizes that eyes are not only for vision. Specialized retinal cells (including melanopsin pathways) respond to the blue-rich, high-signal morning spectrum and help couple light timing to the nervous and endocrine systems. Sunrise light has a particular spectral and intensity profile as the sun clears the horizon—distinct from midday or from LED indoor light—so the teaching privileges outdoor dawn over “bright screen” or window-filtered substitutes.",
      },
      {
        heading: "Mitochondria and redox timing",
        body: "A core Kruse claim is that light timing shapes mitochondrial redox and how cells use the day. Morning light is framed as priming electron-transport and cellular “work mode,” while darkness at night supports reverse/recovery. Seeing sunrise is not framed as a vitamin-D errand alone; it is a systemic timing cue that, in this model, influences how well mitochondria run for the next 24 hours.",
      },
      {
        heading: "DHA, water, and the rest of the stack",
        body: "Kruse links eye health and light capture to dietary DHA (e.g. marine fats) and to the wider light–water–magnetism stack: light timing pairs with lower deuterium load and with earth/place context. Sunrise is still the lever that unlocks the day—other protocols work better when the morning signal is logged first. That is why this app treats sunrise quality as a day boost for other activities.",
      },
      {
        heading: "Why quality tiers matter (horizon vs open sky vs “just outside”)",
        body: "True horizon sunrise (eyes to the disk, no glass) is the gold standard in this teaching. Open sky under clouds or before a clear disk is still outdoor spectrum. Being outside under heavy canopy or street canyons is better than remaining indoors but is a weaker call. The app’s 2× / 1.5× / 1.25× tiers mirror that hierarchy pedagogically—not as lab measurements.",
      },
      {
        heading: "What this is not",
        body: "This is an educational lifestyle framework inspired by public Kruse-style teaching, not medical advice, not a substitute for ophthalmology or dermatology, and not a claim that missing one sunrise causes disease. Use common sense: never stare at the sun in a way that hurts; brief unobstructed dawn viewing as practiced by many circadian enthusiasts is the intent. If you have eye disease or light sensitivity, follow your clinician.",
      },
    ],
  },
];

export function getKruseEntry(id: string): KruseEntry | undefined {
  return KRUSEIVERSITY_ENTRIES.find((e) => e.id === id);
}
