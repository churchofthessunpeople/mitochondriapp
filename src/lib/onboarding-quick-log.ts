/**
 * One-tap logging for onboarding “Log one thing now”.
 * Supplies defaults for activities that normally open a details dialog.
 */

import type { Protocol } from "@/db/schema";
import { isExerciseProtocolId, type ExerciseLogInput } from "@/lib/exercise";
import { isGroundingProtocolId, type GroundingMode } from "@/lib/grounding";
import { requiresMovementSetting, type MovementSetting } from "@/lib/movement-setting";
import { isPermanentProtocol } from "@/lib/permanent-activities";
import { DURATION_BLOCK_MINUTES } from "@/lib/scoring";
import {
  isSleepSpaceProtocolId,
  isWorkSpaceProtocolId,
} from "@/lib/space-hygiene";
import {
  isSunExposureProtocolId,
  type SunExposureLogInput,
} from "@/lib/sun-exposure";
import { isVagusNerveProtocolId, type VagusMode } from "@/lib/vagus-nerve";

export type OnboardingQuickLogOptions = {
  durationMinutes?: number | null;
  sunExposure?: SunExposureLogInput;
  exercise?: ExerciseLogInput;
  groundingMode?: GroundingMode;
  vagusMode?: VagusMode;
  movementSetting?: MovementSetting;
};

/** Permanent stacks need configuration first — skip one-tap. */
export function canQuickLogDuringOnboarding(protocol: Protocol): boolean {
  if (isPermanentProtocol(protocol)) return false;
  if (isSleepSpaceProtocolId(protocol.id) || isWorkSpaceProtocolId(protocol.id)) {
    return false;
  }
  return true;
}

/**
 * Defaults for a first onboarding log when the full checklist dialogs
 * are not mounted (morning Outside Time, outdoor walk, etc.).
 */
export function onboardingQuickLogOptions(
  protocol: Protocol,
): OnboardingQuickLogOptions | undefined {
  const durationMinutes = protocol.durationEnabled
    ? DURATION_BLOCK_MINUTES
    : undefined;

  if (isSunExposureProtocolId(protocol.id)) {
    return {
      durationMinutes: durationMinutes ?? DURATION_BLOCK_MINUTES,
      sunExposure: {
        slot: "morning",
        cover: "full_sun",
      },
    };
  }

  if (isExerciseProtocolId(protocol.id)) {
    return {
      durationMinutes: durationMinutes ?? DURATION_BLOCK_MINUTES,
      exercise: {
        type: "walking",
        location: "outdoors",
      },
    };
  }

  if (isGroundingProtocolId(protocol.id)) {
    return { groundingMode: "barefoot" };
  }

  if (isVagusNerveProtocolId(protocol.id)) {
    return { vagusMode: "cold_face_immersion" };
  }

  if (requiresMovementSetting(protocol)) {
    return {
      durationMinutes: durationMinutes ?? DURATION_BLOCK_MINUTES,
      movementSetting: "outside",
    };
  }

  if (durationMinutes != null) {
    return { durationMinutes };
  }

  return undefined;
}
