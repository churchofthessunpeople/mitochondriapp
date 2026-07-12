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
import { getRegionById } from "@/lib/regions";
import { getUserStreak } from "@/lib/streaks";
import { getSunTimes } from "@/lib/sun";
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
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const region = await getRegionById(userRow?.regionId);

  const tz =
    region?.timezone ||
    userRow?.timezone ||
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
          {region ? (
            <RegionCard
              region={region}
              sun={getSunTimes(
                new Date(`${date}T12:00:00Z`),
                region.latitude,
                region.longitude,
              )}
              compact
            />
          ) : (
            <div className="glass rounded-3xl p-4 text-sm">
              <p className="font-medium">Set your region</p>
              <p className="mt-1 text-muted">
                Get sunrise/sunset times and a 1–5 lifestyle environment score
                (light, magnetism, policy).
              </p>
              <Link
                href="/region"
                className="btn-primary mt-3 inline-flex h-10 items-center rounded-2xl px-4 text-sm font-semibold"
              >
                Choose region
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
