import {
  coldThermoSkinTempBasePoints,
  formatColdThermoSkinTemp,
  isColdThermoProtocolId,
  parseColdThermoSkinTempF,
} from "@/lib/cold-thermo-skin-temp";
import {
  formatMagneticoGauss,
  formatMagneticoGaussMultiplier,
  isMagneticoProtocolId,
  parseMagneticoGauss,
  pointsForMagneticoGauss,
} from "@/lib/magnetico";
import {
  formatSleepRoomTemp,
  isSleepRoomTempProtocolId,
  parseSleepRoomTempF,
  pointsForSleepRoomTemp,
} from "@/lib/sleep-room-temp";

/** Effective base points when a protocol log carries a variant (gauss, °F, etc.). */
export function variantBasePoints(
  protocolId: string,
  variantValue: unknown,
  catalogBase = 10,
): number | undefined {
  if (isMagneticoProtocolId(protocolId)) {
    return pointsForMagneticoGauss(
      parseMagneticoGauss(variantValue),
      catalogBase,
    );
  }
  if (isColdThermoProtocolId(protocolId)) {
    return coldThermoSkinTempBasePoints(
      parseColdThermoSkinTempF(variantValue),
      catalogBase,
    );
  }
  if (isSleepRoomTempProtocolId(protocolId)) {
    return pointsForSleepRoomTemp(parseSleepRoomTempF(variantValue));
  }
  return undefined;
}

export function formatVariantLabel(
  protocolId: string,
  variantValue: unknown,
  catalogBase = 10,
): string | null {
  if (isMagneticoProtocolId(protocolId)) {
    const gauss = parseMagneticoGauss(variantValue);
    return `${formatMagneticoGauss(gauss)} · ${formatMagneticoGaussMultiplier(gauss)}`;
  }
  if (isColdThermoProtocolId(protocolId)) {
    return formatColdThermoSkinTemp(parseColdThermoSkinTempF(variantValue));
  }
  if (isSleepRoomTempProtocolId(protocolId)) {
    return formatSleepRoomTemp(parseSleepRoomTempF(variantValue));
  }
  return null;
}

export function isVariantProtocolId(protocolId: string): boolean {
  return (
    isMagneticoProtocolId(protocolId) ||
    isSleepRoomTempProtocolId(protocolId)
  );
}

export function isPerLogVariantProtocolId(protocolId: string): boolean {
  return isColdThermoProtocolId(protocolId);
}
