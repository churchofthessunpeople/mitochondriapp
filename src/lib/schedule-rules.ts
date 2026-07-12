import type { Protocol, TimeOfDay } from "@/db/schema";

export function canAssignToSlot(
  protocol: Pick<Protocol, "lockedTimeOfDay">,
  timeOfDay: TimeOfDay,
) {
  if (!protocol.lockedTimeOfDay) return true;
  return protocol.lockedTimeOfDay === timeOfDay;
}
