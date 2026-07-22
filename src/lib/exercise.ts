/**
 * Exercise — single activity for rebounding, resistance bands, or walking.
 * Pick type, indoors/outdoors, and duration.
 */

export const EXERCISE_PROTOCOL_ID = "exercise";

/** Retired into Exercise. */
export const EXERCISE_LEGACY_IDS = [
  "morning-movement",
  "rebounding",
] as const;

export type ExerciseType = "rebounding" | "resistance_bands" | "walking";

export type ExerciseLocation = "outdoors" | "indoors";

export type ExerciseLogInput = {
  type: ExerciseType;
  location: ExerciseLocation;
};

export const EXERCISE_TYPE_OPTIONS: {
  id: ExerciseType;
  label: string;
  detail: string;
}[] = [
  {
    id: "rebounding",
    label: "Rebounding",
    detail: "Mini-trampoline / rebounder",
  },
  {
    id: "resistance_bands",
    label: "Resistance bands",
    detail: "Band strength work",
  },
  {
    id: "walking",
    label: "Walking",
    detail: "Zone 2 walk or stroll",
  },
];

export const EXERCISE_LOCATION_OPTIONS: {
  id: ExerciseLocation;
  label: string;
  detail: string;
}[] = [
  {
    id: "outdoors",
    label: "Outdoors",
    detail: "Outside air — sun, shade, or cloud",
  },
  {
    id: "indoors",
    label: "Indoors",
    detail: "Home, gym, or indoor space",
  },
];

const TYPE_INDEX: Record<ExerciseType, number> = {
  rebounding: 0,
  resistance_bands: 1,
  walking: 2,
};
const TYPE_BY_INDEX: ExerciseType[] = [
  "rebounding",
  "resistance_bands",
  "walking",
];

/** Base-point multiplier per 15-min block (catalog base). */
const LOCATION_MULTIPLIER: Record<ExerciseLocation, number> = {
  outdoors: 1,
  indoors: 0.7,
};

/**
 * Pack type + location into variant_value.
 * bits 0–1 = type; bit 2 = indoors (0 = outdoors).
 */
export function encodeExerciseVariant(input: ExerciseLogInput): number {
  const type = TYPE_INDEX[input.type] ?? 0;
  const indoors = input.location === "indoors" ? 1 : 0;
  return (type & 0b11) | ((indoors & 0b1) << 2);
}

export function decodeExerciseVariant(
  variantValue: unknown,
): ExerciseLogInput | null {
  if (typeof variantValue !== "number" || !Number.isFinite(variantValue)) {
    return null;
  }
  const v = Math.trunc(variantValue);
  if (v < 0) return null;
  const type = TYPE_BY_INDEX[v & 0b11];
  if (!type) return null;
  const location: ExerciseLocation =
    ((v >> 2) & 0b1) === 1 ? "indoors" : "outdoors";
  return { type, location };
}

export function isExerciseProtocolId(id: string): boolean {
  return id === EXERCISE_PROTOCOL_ID;
}

export function remapExerciseFavoriteId(id: string): string {
  if ((EXERCISE_LEGACY_IDS as readonly string[]).includes(id)) {
    return EXERCISE_PROTOCOL_ID;
  }
  return id;
}

export function exerciseTypeLabel(type: ExerciseType): string {
  return EXERCISE_TYPE_OPTIONS.find((o) => o.id === type)?.label ?? type;
}

export function exerciseLocationLabel(location: ExerciseLocation): string {
  return (
    EXERCISE_LOCATION_OPTIONS.find((o) => o.id === location)?.label ?? location
  );
}

export function exerciseBasePoints(
  input: ExerciseLogInput,
  catalogBase: number,
): number {
  const mult = LOCATION_MULTIPLIER[input.location] ?? 1;
  return Math.max(1, Math.round(catalogBase * mult));
}

export function formatExerciseLabel(
  variantValue: unknown,
  durationMinutes?: number | null,
): string | null {
  const decoded = decodeExerciseVariant(variantValue);
  if (!decoded) return null;
  const parts = [
    exerciseTypeLabel(decoded.type),
    exerciseLocationLabel(decoded.location).toLowerCase(),
  ];
  if (durationMinutes != null && durationMinutes > 0) {
    parts.push(`${durationMinutes} min`);
  }
  return parts.join(" · ");
}

/** Duration choices for an exercise session (minutes). */
export function exerciseDurationChoices(maxMinutes: number): number[] {
  const max = Math.max(5, maxMinutes || 60);
  const candidates = [5, 10, 15, 20, 30, 45, 60, 90, 120];
  const picked = candidates.filter((m) => m <= max);
  if (picked.length === 0) return [Math.min(5, max)];
  if (!picked.includes(max) && max !== picked[picked.length - 1]) {
    picked.push(max);
  }
  return picked;
}
