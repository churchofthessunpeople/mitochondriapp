import type { TimeOfDay } from "@/db/schema";

/** Map local hour → soft “suggested now” buckets */
export function suggestedTimeSlots(hour: number): TimeOfDay[] {
  if (hour >= 4 && hour < 8) return ["sunrise", "morning", "anytime"];
  if (hour >= 8 && hour < 12) return ["morning", "anytime", "sunrise"];
  if (hour >= 12 && hour < 16) return ["afternoon", "anytime", "morning"];
  if (hour >= 16 && hour < 18) return ["afternoon", "evening", "anytime"];
  if (hour >= 18 && hour < 20) return ["sunset", "evening", "anytime"];
  if (hour >= 20 && hour < 23) return ["evening", "night", "anytime"];
  return ["night", "anytime", "evening"];
}

export function idealTimeLabel(protocol: {
  lockedTimeOfDay: TimeOfDay | null;
  timeOfDay: TimeOfDay;
}): string {
  return protocol.lockedTimeOfDay ?? protocol.timeOfDay;
}

export function isSuggestedNow(
  protocol: { lockedTimeOfDay: TimeOfDay | null; timeOfDay: TimeOfDay },
  hour: number,
): boolean {
  const ideal = idealTimeLabel(protocol);
  const slots = suggestedTimeSlots(hour);
  return slots.includes(ideal) || ideal === "anytime";
}
