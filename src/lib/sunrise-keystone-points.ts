import {
  applySunriseSkyToMultiplier,
  applySunriseSkyToPoints,
  decodeSunriseEndOffset,
  encodeSunriseEndOffset,
  sunriseSessionMinutesFromOffsets,
  type SunriseSky,
} from "@/lib/sunrise-sky";
import { pointsForSunriseSessionTiming } from "@/lib/sunrise-timing";
import {
  computeSunriseMultiplier,
  type SunriseModifiers,
  type SunriseTier,
} from "@/lib/scoring";

export { encodeSunriseEndOffset, decodeSunriseEndOffset };

export function sunriseKeystoneSessionMinutes(
  startOffset: number | null | undefined,
  encodedEndOffset: number | null | undefined,
): number | null {
  if (startOffset == null) return null;
  const { endOffset } = decodeSunriseEndOffset(encodedEndOffset);
  if (endOffset == null) return null;
  return sunriseSessionMinutesFromOffsets(startOffset, endOffset);
}

export function pointsForSunriseKeystoneLog(
  catalogBase: number,
  startOffset: number | null | undefined,
  encodedEndOffset: number | null | undefined,
): number {
  const { endOffset, sky } = decodeSunriseEndOffset(encodedEndOffset);
  let pts = pointsForSunriseSessionTiming(catalogBase, startOffset, endOffset);
  const sessionMins = sunriseKeystoneSessionMinutes(
    startOffset,
    encodedEndOffset,
  );
  return applySunriseSkyToPoints(pts, sessionMins, sky);
}

export function effectiveSunriseBoostMultiplier(
  tier: SunriseTier,
  modifiers: SunriseModifiers,
  startOffset: number | null | undefined,
  encodedEndOffset: number | null | undefined,
): number {
  const nominal = computeSunriseMultiplier(tier, modifiers);
  const { sky } = decodeSunriseEndOffset(encodedEndOffset);
  const sessionMins = sunriseKeystoneSessionMinutes(
    startOffset,
    encodedEndOffset,
  );
  return applySunriseSkyToMultiplier(nominal, sessionMins, sky);
}

export function sunriseSkyFromModifiers(
  modifiers?: SunriseModifiers | null,
): SunriseSky {
  return modifiers?.sky ?? "clear";
}
