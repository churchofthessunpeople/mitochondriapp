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
import { getTodayIsoForTimezone } from "@/lib/date-server";
import { getUserFavoriteIds } from "@/lib/favorites";
import { haversineKm } from "@/lib/geo";
import { effectiveLocation } from "@/lib/location-effective";
import {
  buildPlaceFactors,
  latitudeBand,
  sunPhaseHint,
} from "@/lib/place-factors";
import { seasonCoachLine } from "@/lib/checklist-order";
import { getRegionById } from "@/lib/regions";
import {
  getUserAppFlags,
  redirectIfNeedsOnboarding,
} from "@/lib/require-onboarding";
import { hasSunriseBuffToday } from "@/lib/actions/completions";
import { getUserStreak } from "@/lib/streaks";
import { getSunTimesForLocalDay, sunPhase } from "@/lib/sun";
import { getWeeklySummary } from "@/lib/weekly";

export const metadata = { title: "Home" };

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
  const h = await headers();

  const [userFlags, allProtocols, availableIds, fullUser] = await Promise.all([
    getUserAppFlags(session.user.id),
    getActiveProtocols(),
    getUserFavoriteIds(session.user.id),
    db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
  ]);

  if (!fullUser) redirect("/login");

  const loc = effectiveLocation({
    ...userFlags!,
    elevationM: userFlags?.elevationM ?? null,
  });

  const tz =
    loc.timezone ||
    h.get("x-vercel-ip-timezone") ||
    "UTC";

  const date = getTodayIsoForTimezone(tz);

  const [dayStats, streak, weekly, region, sunriseBuffActive] =
    await Promise.all([
      getUserDayStats(session.user.id, date),
      getUserStreak(session.user.id, date),
      getWeeklySummary(session.user.id, date),
      getRegionById(userFlags?.regionId),
      hasSunriseBuffToday(session.user.id, date),
    ]);

  const hasCoords = loc.latitude != null && loc.longitude != null;
  const sunLat = hasCoords ? loc.latitude! : (region?.latitude ?? null);
  const sunLng = hasCoords ? loc.longitude! : (region?.longitude ?? null);

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
          elevationM: loc.elevationM,
        })
      : null;

  const distanceKm =
    hasCoords && region && !loc.isTravel
      ? haversineKm(
          loc.latitude!,
          loc.longitude!,
          region.latitude,
          region.longitude,
        )
      : null;

  const phase =
    sun != null
      ? sunPhase(new Date(), sun.sunrise, sun.sunset)
      : ("day" as const);

  const phaseHint = sun != null ? sunPhaseHint(phase) : null;
  const band =
    sunLat != null ? latitudeBand(sunLat).uvSeasonLabel : null;
  const seasonLine = seasonCoachLine(band, phase);

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
      placeLabel={loc.placeLabel ?? null}
      postalCode={userFlags?.postalCode ?? null}
      region={region}
      sun={sun}
      timeZone={tz}
      phaseHint={phaseHint}
      placeFactors={placeFactors}
      distanceKm={distanceKm}
      phase={phase}
      localHour={localHour}
      seasonLine={seasonLine}
      weekly={weekly}
      sunriseBuffActive={sunriseBuffActive}
      isTravel={loc.isTravel}
      travelUntil={loc.travelUntil}
      homePostalCode={userFlags?.postalCode ?? null}
      travelLabel={userFlags?.travelPlaceLabel ?? null}
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
