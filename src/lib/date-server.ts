import { headers } from "next/headers";
import { todayIsoDate } from "@/lib/utils";

/**
 * Calendar "today" for the request. Prefers Vercel IP timezone, else UTC.
 * Never trust client-supplied dates for scoring.
 */
export async function getServerTodayIsoDate(): Promise<string> {
  const h = await headers();
  const tz =
    h.get("x-vercel-ip-timezone") ||
    h.get("x-timezone") ||
    "UTC";

  try {
    return todayIsoDate(tz);
  } catch {
    return todayIsoDate("UTC");
  }
}
