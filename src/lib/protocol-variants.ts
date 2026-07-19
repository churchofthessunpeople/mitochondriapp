import {
  coldThermoSkinTempBasePoints,
  formatColdThermoSkinTemp,
  isColdThermoProtocolId,
  parseColdThermoSkinTempF,
} from "@/lib/cold-thermo-skin-temp";
import {
  formatMagneticoGauss,
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
import {
  decodeMovementSettingVariant,
  formatMovementSettingLabel,
  isMovementSettingProtocolId,
  movementSettingBasePoints,
  requiresMovementSetting,
} from "@/lib/movement-setting";
import {
  decodeSunExposureVariant,
  formatSunExposureLabel,
  isSunExposureProtocolId,
  sunExposureBasePoints,
} from "@/lib/sun-exposure";

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
  if (isSunExposureProtocolId(protocolId)) {
    const decoded = decodeSunExposureVariant(variantValue);
    if (!decoded) return undefined;
    return sunExposureBasePoints(catalogBase, { slot: decoded.slot });
  }
  const movementSetting =
    isMovementSettingProtocolId(protocolId) &&
    decodeMovementSettingVariant(variantValue);
  if (movementSetting) {
    return movementSettingBasePoints(movementSetting, catalogBase);
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
    return `${formatMagneticoGauss(gauss)} · ${pointsForMagneticoGauss(gauss, catalogBase)} pts`;
  }
  if (isColdThermoProtocolId(protocolId)) {
    return formatColdThermoSkinTemp(parseColdThermoSkinTempF(variantValue));
  }
  if (isSleepRoomTempProtocolId(protocolId)) {
    return formatSleepRoomTemp(parseSleepRoomTempF(variantValue));
  }
  if (isSunExposureProtocolId(protocolId)) {
    return formatSunExposureLabel(variantValue);
  }
  if (isMovementSettingProtocolId(protocolId)) {
    return formatMovementSettingLabel(variantValue);
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

export function isMovementSettingVariantValue(
  variantValue: unknown,
): boolean {
  return decodeMovementSettingVariant(variantValue) != null;
}

export { requiresMovementSetting };
