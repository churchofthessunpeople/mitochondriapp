import { todayIsoDate } from "@/lib/utils";

/**
 * Calendar "today" in an explicit IANA timezone.
 * Prefer user.timezone over IP guess for scoring / streaks.
 * Safe for client and server (no next/headers).
 */
export function getTodayIsoForTimezone(timeZone: string): string {
  try {
    return todayIsoDate(timeZone || "UTC");
  } catch {
    return todayIsoDate("UTC");
  }
}
