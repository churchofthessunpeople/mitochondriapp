import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountPanel } from "@/components/account-panel";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { users } from "@/db/schema";
import { tabFromSearchParam } from "@/lib/app-tabs";
import { getActiveProtocols, getUserDayStats } from "@/lib/data";
import { getServerTodayIsoDate } from "@/lib/date-server";
import { getUserFavoriteIds } from "@/lib/favorites";
import { haversineKm } from "@/lib/geo";
import { buildPlaceFactors, sunPhaseHint } from "@/lib/place-factors";
import { getRegionById } from "@/lib/regions";
import {
  getUserAppFlags,
  redirectIfNeedsOnboarding,
} from "@/lib/require-onboarding";
import { getUserStreak } from "@/lib/streaks";
import { getSunTimesForLocalDay, sunPhase } from "@/lib/sun";

export const metadata = { title: "Home" };

/**
 * Single-page app shell: Schedule / Place / Activities / Account
 * switch client-side without full navigations.
 */
export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await redirectIfNeedsOnboarding(session.user.id);

  const params = await searchParams;
  const initialTab = tabFromSearchParam(params.t);

  const date = await getServerTodayIsoDate();
  const h = await headers();

  const [userFlags, allProtocols, availableIds, dayStats, streak, fullUser] =
    await Promise.all([
      getUserAppFlags(session.user.id),
      getActiveProtocols(),
      getUserFavoriteIds(session.user.id),
      getUserDayStats(session.user.id, date),
      getUserStreak(session.user.id, date),
      db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)
        .then((r) => r[0] ?? null),
    ]);

  if (!fullUser) redirect("/login");

  const region = await getRegionById(userFlags?.regionId);
  const hasCoords =
    userFlags?.latitude != null && userFlags?.longitude != null;
  const sunLat = hasCoords
    ? userFlags!.latitude!
    : (region?.latitude ?? null);
  const sunLng = hasCoords
    ? userFlags!.longitude!
    : (region?.longitude ?? null);
  const tz =
    userFlags?.timezone ||
    region?.timezone ||
    h.get("x-vercel-ip-timezone") ||
    "UTC";

  const sun =
    sunLat != null && sunLng != null
      ? getSunTimesForLocalDay(new Date(), sunLat, sunLng, tz)
      : null;

  const placeFactors =
    sun && sunLat != null && sunLng != null
      ? buildPlaceFactors({
          latitude: sunLat,
          longitude: sunLng,
          sun,
          timeZone: tz,
          elevationM: null,
        })
      : null;

  const distanceKm =
    hasCoords && region
      ? haversineKm(
          userFlags!.latitude!,
          userFlags!.longitude!,
          region.latitude,
          region.longitude,
        )
      : null;

  const phaseHint =
    sun != null
      ? sunPhaseHint(sunPhase(new Date(), sun.sunrise, sun.sunset))
      : null;

  const dateLabel = format(new Date(`${date}T12:00:00`), "EEEE, MMM d");
  const memberSinceLabel = fullUser.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(fullUser.createdAt)
    : null;

  return (
    <AppShell
      initialTab={initialTab}
      dateLabel={dateLabel}
      allProtocols={allProtocols}
      availableIds={[...availableIds]}
      completionCounts={Object.fromEntries(dayStats.completionCounts)}
      dayPoints={dayStats.points}
      streak={streak}
      placeLabel={userFlags?.placeLabel ?? null}
      postalCode={userFlags?.postalCode ?? null}
      region={region}
      sun={sun}
      timeZone={tz}
      phaseHint={phaseHint}
      placeFactors={placeFactors}
      distanceKm={distanceKm}
      accountPanel={
        <AccountPanel
          user={{
            username: fullUser.username,
            displayName: fullUser.displayName,
            name: fullUser.name,
            email: fullUser.email,
            timezone: fullUser.timezone,
            showOnLeaderboard: fullUser.showOnLeaderboard,
            memberSinceLabel,
          }}
        />
      }
    />
  );
}
