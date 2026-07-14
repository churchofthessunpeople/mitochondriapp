/** Cool bedroom sleep — floor 65°F = 10 pts; warmer = diminishing. */

export const SLEEP_ROOM_TEMP_PROTOCOL_ID = "cool-bedroom-sleep";

export const FLOOR_SLEEP_ROOM_TEMP_F = 65;
export const MAX_SLEEP_ROOM_TEMP_POINTS = 10;
export const DEFAULT_SLEEP_ROOM_TEMP_F = FLOOR_SLEEP_ROOM_TEMP_F;

/** Thermostat settings at or above 65°F (65°F is optimal). */
export const SLEEP_ROOM_TEMP_OPTIONS = [65, 66, 67, 68, 70, 72] as const;

export type SleepRoomTempF = (typeof SLEEP_ROOM_TEMP_OPTIONS)[number];

export function isSleepRoomTempProtocolId(id: string): boolean {
  return id === SLEEP_ROOM_TEMP_PROTOCOL_ID;
}

export function parseSleepRoomTempF(value: unknown): SleepRoomTempF {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n === "number" && Number.isFinite(n)) {
    const rounded = Math.max(FLOOR_SLEEP_ROOM_TEMP_F, Math.round(n));
    if ((SLEEP_ROOM_TEMP_OPTIONS as readonly number[]).includes(rounded)) {
      return rounded as SleepRoomTempF;
    }
    // Nearest listed option at or above floor
    const sorted = [...SLEEP_ROOM_TEMP_OPTIONS].sort(
      (a, b) => Math.abs(a - rounded) - Math.abs(b - rounded),
    );
    return sorted[0] ?? DEFAULT_SLEEP_ROOM_TEMP_F;
  }
  return DEFAULT_SLEEP_ROOM_TEMP_F;
}

/**
 * 65°F → 10 pts (floor). Each degree above 65 loses 1 pt (min 1).
 * At or below 65°F stays at 10.
 */
export function pointsForSleepRoomTemp(tempF: number): number {
  const rounded = Math.round(tempF);
  if (rounded <= FLOOR_SLEEP_ROOM_TEMP_F) return MAX_SLEEP_ROOM_TEMP_POINTS;
  return Math.max(
    1,
    MAX_SLEEP_ROOM_TEMP_POINTS - (rounded - FLOOR_SLEEP_ROOM_TEMP_F),
  );
}

export function formatSleepRoomTemp(tempF: number): string {
  return `${Math.round(tempF)}°F`;
}
