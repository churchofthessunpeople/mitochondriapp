/** Sky clarity affects how long morning-light viewing must last for full points/boost. */

export type SunriseSky =
  | "clear"
  | "partly_cloudy"
  | "cloudy"
  | "overcast";

export type SunriseSkyOption = {
  id: SunriseSky;
  label: string;
  subtitle: string;
  /** Minutes of viewing needed for full points and day boost */
  fullMinutes: number;
};

export const SUNRISE_SKY_OPTIONS: readonly SunriseSkyOption[] = [
  {
    id: "clear",
    label: "Clear skies",
    subtitle: "Full points & boost at 30 min",
    fullMinutes: 30,
  },
  {
    id: "partly_cloudy",
    label: "Partly cloudy",
    subtitle: "Full points & boost at 38 min",
    fullMinutes: 38,
  },
  {
    id: "cloudy",
    label: "Cloudy",
    subtitle: "Full points & boost at 45 min",
    fullMinutes: 45,
  },
  {
    id: "overcast",
    label: "Heavy overcast",
    subtitle: "Full points & boost at 60 min",
    fullMinutes: 60,
  },
] as const;

const SKY_INDEX: Record<SunriseSky, number> = {
  clear: 0,
  partly_cloudy: 1,
  cloudy: 2,
  overcast: 3,
};

const SKY_BY_INDEX = SUNRISE_SKY_OPTIONS.map((o) => o.id);

/** Values below this are legacy raw end offsets (pre–sky encoding). */
const ENCODED_END_BASE = 20_000;
/** Shift so negative sunrise offsets encode above ENCODED_END_BASE. */
const END_OFFSET_SHIFT = 500;

export function fullMinutesForSky(sky: SunriseSky): number {
  return (
    SUNRISE_SKY_OPTIONS.find((o) => o.id === sky)?.fullMinutes ?? 30
  );
}

export function formatSunriseSkyLabel(sky: SunriseSky): string {
  return SUNRISE_SKY_OPTIONS.find((o) => o.id === sky)?.label ?? "Clear skies";
}

/** Pack end offset + sky into duration_minutes for sunrise keystones. */
export function encodeSunriseEndOffset(
  endOffset: number,
  sky: SunriseSky,
): number {
  return (
    ENCODED_END_BASE +
    (endOffset + END_OFFSET_SHIFT) * 10 +
    SKY_INDEX[sky]
  );
}

export function decodeSunriseEndOffset(encoded: number | null | undefined): {
  endOffset: number | null;
  sky: SunriseSky;
} {
  if (encoded == null) return { endOffset: null, sky: "clear" };
  if (encoded < ENCODED_END_BASE) {
    return { endOffset: encoded, sky: "clear" };
  }
  const raw = encoded - ENCODED_END_BASE;
  const skyIdx = ((raw % 10) + 10) % 10;
  const sky = SKY_BY_INDEX[skyIdx] ?? "clear";
  return {
    endOffset: Math.floor(raw / 10) - END_OFFSET_SHIFT,
    sky,
  };
}

/** Viewing span from signed sunrise offsets (finish − start). */
export function sunriseSessionMinutesFromOffsets(
  startOffset: number,
  endOffset: number,
): number {
  return Math.max(0, endOffset - startOffset);
}

/** 1 = met required duration; scales linearly below (legacy logs without session → 1). */
export function sunriseSkyDurationFactor(
  sessionMinutes: number | null | undefined,
  sky: SunriseSky,
): number {
  if (sessionMinutes == null) return 1;
  const required = fullMinutesForSky(sky);
  if (required <= 0) return 1;
  return Math.min(1, sessionMinutes / required);
}

export function applySunriseSkyToPoints(
  basePoints: number,
  sessionMinutes: number | null | undefined,
  sky: SunriseSky,
): number {
  const factor = sunriseSkyDurationFactor(sessionMinutes, sky);
  return Math.max(1, Math.round(basePoints * factor));
}

export function applySunriseSkyToMultiplier(
  multiplier: number,
  sessionMinutes: number | null | undefined,
  sky: SunriseSky,
): number {
  const factor = sunriseSkyDurationFactor(sessionMinutes, sky);
  return Math.max(1, Math.round(multiplier * factor * 100) / 100);
}
