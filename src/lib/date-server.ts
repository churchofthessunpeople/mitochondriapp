import { headers } from "next/headers";
import { todayIsoDate } from "@/lib/utils";

/**
 * Calendar "today" in an explicit IANA timezone.
 * Prefer user.timezone over IP guess for scoring / streaks.
 */
export function getTodayIsoForTimezone(timeZone: string): string {
  try {
    return todayIsoDate(timeZone || "UTC");
  } catch {
    return todayIsoDate("UTC");
  }
}

/**
 * Calendar "today" for the request when user TZ unknown.
 * Prefers Vercel IP timezone, else UTC.
 */
export async function getServerTodayIsoDate(
  preferredTimeZone?: string | null,
): Promise<string> {
  if (preferredTimeZone) {
    return getTodayIsoForTimezone(preferredTimeZone);
  }
  const h = await headers();
  const tz =
    h.get("x-vercel-ip-timezone") ||
    h.get("x-timezone") ||
    "UTC";
  return getTodayIsoForTimezone(tz);
}
