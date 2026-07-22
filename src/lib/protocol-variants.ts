import {
  coldThermoBasePoints,
  decodeColdThermoVariant,
  formatColdThermoLabel,
  formatColdThermoSkinTemp,
  isColdThermoProtocolId,
  parseColdThermoLogInput,
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
import {
  decodeDrinkingWaterVariant,
  drinkingWaterBasePoints,
  formatDrinkingWaterLabel,
  isDrinkingWaterProtocolId,
} from "@/lib/drinking-water";
import {
  decodeExerciseVariant,
  exerciseBasePoints,
  formatExerciseLabel,
  isExerciseProtocolId,
} from "@/lib/exercise";

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
    const input = parseColdThermoLogInput(variantValue);
    return coldThermoBasePoints(input, catalogBase);
  }
  if (isDrinkingWaterProtocolId(protocolId)) {
    const decoded = decodeDrinkingWaterVariant(variantValue);
    if (!decoded) return undefined;
    return drinkingWaterBasePoints(decoded, catalogBase);
  }
  if (isExerciseProtocolId(protocolId)) {
    const decoded = decodeExerciseVariant(variantValue);
    if (!decoded) return undefined;
    return exerciseBasePoints(decoded, catalogBase);
  }
  if (isSleepRoomTempProtocolId(protocolId)) {
    return pointsForSleepRoomTemp(parseSleepRoomTempF(variantValue));
  }
  if (isSunExposureProtocolId(protocolId)) {
    const decoded = decodeSunExposureVariant(variantValue);
    if (!decoded) return undefined;
    return sunExposureBasePoints(catalogBase, {
      slot: decoded.slot,
      cover: decoded.cover,
    });
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
    return (
      formatColdThermoLabel(variantValue) ??
      formatColdThermoSkinTemp(parseColdThermoSkinTempF(variantValue))
    );
  }
  if (isDrinkingWaterProtocolId(protocolId)) {
    return formatDrinkingWaterLabel(variantValue);
  }
  if (isExerciseProtocolId(protocolId)) {
    return formatExerciseLabel(variantValue);
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
  return (
    isColdThermoProtocolId(protocolId) ||
    isDrinkingWaterProtocolId(protocolId) ||
    isExerciseProtocolId(protocolId)
  );
}

export function isMovementSettingVariantValue(
  variantValue: unknown,
): boolean {
  return decodeMovementSettingVariant(variantValue) != null;
}

export { requiresMovementSetting, decodeColdThermoVariant };
