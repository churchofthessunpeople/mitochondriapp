/**
 * Builds Simple / Intermediate / Advanced reading tiers for Mitoversity entries
 * that do not yet define custom readingLevels.
 *
 * Tiers are additive: Simple = overview + practice; Intermediate = full article
 * body (no truncated rehash); Advanced = technical addenda only (does not paste
 * Intermediate bodies again).
 */

import type { MitoEntry, MitoEntrySection, MitoPillar } from "@/lib/mitoversity";
import type { MitoReadingLevels } from "@/lib/mitoversity-reading-levels";

function firstSentences(text: string, count: number): string {
  const matches = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!matches?.length) return text.slice(0, 280).trim();
  return matches.slice(0, count).join(" ").trim();
}

function isMetaSection(section: MitoEntrySection): boolean {
  return (
    /how this fits the app/i.test(section.heading) ||
    /read next/i.test(section.heading) ||
    /app fit/i.test(section.heading) ||
    /app scoring/i.test(section.heading) ||
    /stacking/i.test(section.heading) ||
    /in this app/i.test(section.heading)
  );
}

function isKruseSection(section: MitoEntrySection): boolean {
  return /kruse/i.test(section.heading);
}

function isPracticeSection(section: MitoEntrySection): boolean {
  return (
    /practice/i.test(section.heading) ||
    /how to/i.test(section.heading) ||
    /what to do/i.test(section.heading) ||
    /what you log/i.test(section.heading) ||
    /setup/i.test(section.heading) ||
    /tuning/i.test(section.heading)
  );
}

function buildSimpleSections(entry: MitoEntry): MitoEntrySection[] {
  const { sections, summary } = entry;
  const practice = sections.find(isPracticeSection);
  const app = sections.find((s) =>
    /how this fits|in this app|app fit/i.test(s.heading),
  );

  const out: MitoEntrySection[] = [
    {
      heading: "The big picture",
      body: summary,
    },
  ];

  if (practice) {
    out.push({
      heading: "What to do",
      body: firstSentences(practice.body, 3),
    });
  }

  const kruse = sections.find(isKruseSection);
  if (kruse) {
    out.push({
      heading: "Lifestyle-framework note",
      body: firstSentences(kruse.body, 2),
    });
  }

  out.push({
    heading: "In this app",
    body: app
      ? firstSentences(app.body, 2)
      : "Log the related catalog activity when you complete this habit. Educational only—not medical advice.",
  });

  return out;
}

function buildIntermediateSections(entry: MitoEntry): MitoEntrySection[] {
  const core = entry.sections.filter((s) => !isMetaSection(s));
  const out: MitoEntrySection[] = [
    {
      heading: "Building on Simple",
      body: "This tier assumes you already read Simple (big picture, what to do, and how logging works). Below is the full article detail—mechanisms, practice, and framework notes—without repeating the Simple digest.",
    },
    ...core,
    {
      heading: "In this app (same habit, deeper why)",
      body: "Logging and scoring are unchanged from Simple. Use this tier for the fuller why; switch back to Simple if you only need the habit checklist.",
    },
  ];
  return out;
}

function advancedAddendum(
  section: MitoEntrySection,
  pillar: MitoPillar,
): string {
  const h = section.heading.toLowerCase();
  const parts: string[] = [];

  if (
    pillar === "light" ||
    /melanopsin|circadian|spectrum|lux|melatonin|uv|sun/i.test(h)
  ) {
    parts.push(
      "Technical context: intrinsically photosensitive retinal ganglion cells (ipRGCs) integrate irradiance and spectral composition; melanopic equivalent daylight illuminance (EDI) is the modern photometric correlate for circadian dose. Phase-response curves quantify advance/delay from timed light; polysomnography and DLMO assays are research endpoints this app does not measure.",
    );
  }
  if (
    pillar === "water" ||
    /deuterium|water|hydration|co₂|bicarbonate|meal|seafood/i.test(h)
  ) {
    parts.push(
      "Technical context: natural waters carry hydrogen-isotope signatures (δD relative to VSMOW); kinetic isotope effects on proton transfer are established in chemistry but health effect sizes from ordinary dietary variation remain contested. Acid–base physiology uses Henderson–Hasselbalch balance and carbonic anhydrase–catalyzed CO₂/HCO₃⁻ interconversion.",
    );
  }
  if (
    pillar === "magnetism" ||
    /emf|field|ground|magnet|nnemf|breaker|gauss/i.test(h)
  ) {
    parts.push(
      "Technical context: Earth’s main field is modeled by WMM/IGRF-class products (F, I, D); nnEMF refers to human-made time-varying EM fields distinct from geomagnetic DC background. Grounding electrode systems, common-mode RF on cables, and body-voltage metrology are engineering measurements—not inferred from catalog checkboxes.",
    );
  }
  if (
    pillar === "support" ||
    /sleep|cold|movement|lymph|glymph|jaw|thermo/i.test(h)
  ) {
    parts.push(
      "Technical context: autonomic, thermoregulatory, and sleep-architecture endpoints (slow-wave sleep, HRV, core temperature nadir) mediate many Support-pillar claims. Hormesis from cold or exercise load depends on dose, timing, and recovery environment (dark, cool, low-RF sleep).",
    );
  }
  if (/kruse/i.test(h)) {
    parts.push(
      "Epistemic boundary: integrated light–water–magnetism prescriptions are Dr. Jack Kruse’s public teaching layer—distinct from consensus clinical guidelines unless separately cited.",
    );
  }
  if (/research|evidence|study|mainstream|clinical/i.test(h)) {
    parts.push(
      "Literature posture: prioritize peer-reviewed human data where available; animal and in vitro mechanisms do not automatically transfer to lifestyle checkboxes.",
    );
  }

  if (parts.length === 0) {
    parts.push(
      "Epistemic boundary: this section summarizes lifestyle education. Logging in the app tracks behavior, not biomarker confirmation.",
    );
  }

  return parts.join(" ");
}

function buildAdvancedSections(entry: MitoEntry): MitoEntrySection[] {
  const core = entry.sections.filter(
    (s) => !isMetaSection(s) && !isPracticeSection(s),
  );

  const addenda = core.map((section) => ({
    heading: `${section.heading} — technical depth`,
    body: `Assumes Intermediate. ${advancedAddendum(section, entry.pillar)}`,
  }));

  return [
    {
      heading: "Building on Intermediate",
      body: "Advanced adds research-grade context and epistemic boundaries only. It does not restate the Intermediate article body—read that tier first for the full mechanisms and practice.",
    },
    ...addenda,
    {
      heading: "Measurement limits in this app",
      body: `No Mitoversity article replaces labs, imaging, polysomnography, magnetometers, or isotope assays. Protocol logs for “${entry.title}” record intentional habits aligned with the ${entry.pillar} pillar—they do not verify mechanistic outcomes or diagnose disease.`,
    },
    {
      heading: "In this app",
      body: "Same habit logging as Simple. Use Intermediate for the full why; use Advanced for technical framing only.",
    },
  ];
}

export function hasCompleteReadingLevels(
  levels: MitoReadingLevels | undefined,
): boolean {
  if (!levels) return false;
  return (
    (levels.simple?.sections.length ?? 0) > 0 &&
    (levels.intermediate?.sections.length ?? 0) > 0 &&
    (levels.advanced?.sections.length ?? 0) > 0
  );
}

export function buildReadingLevels(entry: MitoEntry): MitoReadingLevels {
  return {
    simple: { sections: buildSimpleSections(entry) },
    intermediate: { sections: buildIntermediateSections(entry) },
    advanced: { sections: buildAdvancedSections(entry) },
  };
}

/** Attach generated tiers when an entry lacks complete custom readingLevels. */
export function applyReadingLevels(entry: MitoEntry): MitoEntry {
  if (hasCompleteReadingLevels(entry.readingLevels)) {
    return {
      ...entry,
      sections:
        entry.readingLevels!.simple?.sections ?? entry.sections,
    };
  }

  const readingLevels = buildReadingLevels(entry);
  return {
    ...entry,
    sections: readingLevels.simple!.sections,
    readingLevels,
  };
}
