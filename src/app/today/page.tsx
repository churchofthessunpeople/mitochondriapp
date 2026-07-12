import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ActivityLog } from "@/components/activity-log";
import { RegionCard } from "@/components/region-card";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  getActiveProtocols,
  getUserDayStats,
  getUserTotalPoints,
} from "@/lib/data";
import { getServerTodayIsoDate } from "@/lib/date-server";
import { getUserFavoriteIds } from "@/lib/favorites";
import { haversineKm } from "@/lib/geo";
import { getRegionById } from "@/lib/regions";
import { getUserStreak } from "@/lib/streaks";
import { getSunTimesForLocalDay } from "@/lib/sun";
import { formatPoints } from "@/lib/utils";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const date = await getServerTodayIsoDate();
  const h = await headers();

  const [userRow] = await db
    .select({
      onboardingComplete: users.onboardingComplete,
      timezone: users.timezone,
      regionId: users.regionId,
      latitude: users.latitude,
      longitude: users.longitude,
      postalCode: users.postalCode,
      placeLabel: users.placeLabel,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const region = await getRegionById(userRow?.regionId);

  const hasZipCoords =
    userRow?.latitude != null && userRow?.longitude != null;

  const sunLat = hasZipCoords
    ? userRow!.latitude!
    : (region?.latitude ?? null);
  const sunLng = hasZipCoords
    ? userRow!.longitude!
    : (region?.longitude ?? null);

  const tz =
    userRow?.timezone ||
    region?.timezone ||
    h.get("x-vercel-ip-timezone") ||
    "UTC";

  let localHour = new Date().getUTCHours();
  try {
    localHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        hour12: false,
      }).format(new Date()),
    );
    if (Number.isNaN(localHour)) localHour = new Date().getHours();
  } catch {
    localHour = new Date().getHours();
  }

  const distanceKm =
    hasZipCoords && region
      ? haversineKm(
          userRow!.latitude!,
          userRow!.longitude!,
          region.latitude,
          region.longitude,
        )
      : null;

  const sun =
    sunLat != null && sunLng != null
      ? getSunTimesForLocalDay(new Date(), sunLat, sunLng, tz)
      : null;

  const [protocols, dayStats, lifetime, favoriteIds, streak] =
    await Promise.all([
      getActiveProtocols(),
      getUserDayStats(session.user.id, date),
      getUserTotalPoints(session.user.id),
      getUserFavoriteIds(session.user.id),
      getUserStreak(session.user.id, date),
    ]);

  return (
    <div className="min-h-screen">
      <SiteHeader active="today" />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accent">
              Daily log
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {format(new Date(`${date}T12:00:00`), "EEEE, MMM d")}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              Search, filter by group, star favorites, log with optional timers.
              Lifetime {formatPoints(lifetime)} pts.
            </p>
          </div>
        </div>

        <div className="mb-6">
          {sun && (region || userRow?.placeLabel) ? (
            <RegionCard
              region={region}
              sun={sun}
              compact
              placeLabel={userRow?.placeLabel}
              postalCode={userRow?.postalCode}
              distanceKm={distanceKm}
              sunFromZip={hasZipCoords}
              timeZone={tz}
            />
          ) : (
            <div className="glass rounded-3xl p-4 text-sm">
              <p className="font-medium">Set your location</p>
              <p className="mt-1 text-muted">
                Enter a US ZIP for sunrise/sunset at your coordinates, plus the
                nearest curated lifestyle score.
              </p>
              <Link
                href="/region"
                className="btn-primary mt-3 inline-flex h-10 items-center rounded-2xl px-4 text-sm font-semibold"
              >
                Enter ZIP code
              </Link>
            </div>
          )}
        </div>

        <ActivityLog
          protocols={protocols}
          favoriteIds={[...favoriteIds]}
          completionCounts={Object.fromEntries(dayStats.completionCounts)}
          dayPoints={dayStats.points}
          streak={streak}
          streakBonusToday={dayStats.streakBonus}
          localHour={localHour}
          showOnboarding={!userRow?.onboardingComplete}
        />
      </main>
    </div>
  );
}
