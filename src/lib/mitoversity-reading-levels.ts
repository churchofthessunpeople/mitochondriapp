import type { MitoEntry, MitoEntrySection } from "@/lib/mitoversity";

export type MitoReadingLevel = "simple" | "intermediate" | "advanced";

export type MitoReadingLevelContent = {
  sections: MitoEntrySection[];
};

export type MitoReadingLevels = Partial<
  Record<MitoReadingLevel, MitoReadingLevelContent>
>;

export const MITO_READING_LEVEL_META: {
  id: MitoReadingLevel;
  label: string;
  subtitle: string;
}[] = [
  {
    id: "simple",
    label: "Simple",
    subtitle: "High school level — plain-language overview",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    subtitle: "College level — more detail and context",
  },
  {
    id: "advanced",
    label: "Advanced",
    subtitle: "PhD / research level — technical depth",
  },
];

export function mitoEntryHasReadingLevels(
  entry: Pick<MitoEntry, "readingLevels">,
): boolean {
  const levels = entry.readingLevels;
  if (!levels) return false;
  return MITO_READING_LEVEL_META.every(
    (meta) => (levels[meta.id]?.sections.length ?? 0) > 0,
  );
}

export function getMitoSectionsForLevel(
  entry: MitoEntry,
  level: MitoReadingLevel,
): MitoEntrySection[] {
  const fromLevel = entry.readingLevels?.[level]?.sections;
  if (fromLevel && fromLevel.length > 0) return fromLevel;
  return entry.sections;
}
