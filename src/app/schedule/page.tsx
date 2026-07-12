import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PlaceStrip } from "@/components/place-strip";
import { ScheduleDay } from "@/components/schedule-day";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getUserDayStats } from "@/lib/data";
import { getServerTodayIsoDate } from "@/lib/date-server";
import { getUserFavoriteProtocols } from "@/lib/favorites";
import { sunPhaseHint } from "@/lib/place-factors";
import { getRegionById } from "@/lib/regions";
import { redirectIfNeedsOnboarding } from "@/lib/require-onboarding";
import { getUserStreak } from "@/lib/streaks";
import { getSunTimesForLocalDay, sunPhase } from "@/lib/sun";

export const metadata = { title: "Schedule" };

/**
 * Home surface: compact place + checklist of available activities.
 */
export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await redirectIfNeedsOnboarding(session.user.id);

  const date = await getServerTodayIsoDate();
  const h = await headers();

  const [userRow, availableRows, dayStats, streak] = await Promise.all([
    db
      .select({
        regionId: users.regionId,
        postalCode: users.postalCode,
        placeLabel: users.placeLabel,
        latitude: users.latitude,
        longitude: users.longitude,
        timezone: users.timezone,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
    getUserFavoriteProtocols(session.user.id),
    getUserDayStats(session.user.id, date),
    getUserStreak(session.user.id, date),
  ]);

  const region = await getRegionById(userRow?.regionId);
  const hasCoords =
    userRow?.latitude != null && userRow?.longitude != null;
  const sunLat = hasCoords
    ? userRow!.latitude!
    : (region?.latitude ?? null);
  const sunLng = hasCoords
    ? userRow!.longitude!
    : (region?.longitude ?? null);
  const tz =
    userRow?.timezone ||
    region?.timezone ||
    h.get("x-vercel-ip-timezone") ||
    "UTC";

  const sun =
    sunLat != null && sunLng != null
      ? getSunTimesForLocalDay(new Date(), sunLat, sunLng, tz)
      : null;

  const phaseHint =
    sun != null
      ? sunPhaseHint(sunPhase(new Date(), sun.sunrise, sun.sunset))
      : null;

  const protocols = availableRows.map((r) => r.protocol);
  const dateLabel = format(new Date(`${date}T12:00:00`), "EEEE, MMM d");
  const missingPlace = !userRow?.placeLabel && !region;
  const missingActivities = protocols.length === 0;

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="schedule" />
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        {(missingPlace || missingActivities) && (
          <div className="space-y-2">
            {missingPlace && (
              <div className="rounded-2xl border border-accent/25 bg-accent/5 px-3.5 py-3 text-sm">
                <p className="font-medium">Add your ZIP for local sun times</p>
                <Link
                  href="/place"
                  className="mt-1 inline-block text-accent hover:underline"
                >
                  Set location on Place →
                </Link>
              </div>
            )}
            {missingActivities && (
              <div className="rounded-2xl border border-accent/25 bg-accent/5 px-3.5 py-3 text-sm">
                <p className="font-medium">Your checklist is empty</p>
                <Link
                  href="/activities"
                  className="mt-1 inline-block text-accent hover:underline"
                >
                  Pick available activities →
                </Link>
              </div>
            )}
          </div>
        )}

        <PlaceStrip
          placeLabel={userRow?.placeLabel}
          region={region}
          sun={sun}
          timeZone={tz}
          phaseHint={phaseHint}
        />

        <ScheduleDay
          protocols={protocols}
          completionCounts={Object.fromEntries(dayStats.completionCounts)}
          dayPoints={dayStats.points}
          streak={streak}
          dateLabel={dateLabel}
        />
      </main>
    </div>
  );
}
