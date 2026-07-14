import { headers } from "next/headers";
import { getTodayIsoForTimezone } from "@/lib/date-tz";

export { getTodayIsoForTimezone } from "@/lib/date-tz";

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
