import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { db } from "@/db";
import { userReminders, users } from "@/db/schema";
import {
  accountSectionFromSearchParam,
  mitoLessonFromSearchParam,
  tabFromSearchParam,
  todaySectionFromSearchParam,
} from "@/lib/app-tabs";
import { getIsAdminForUserId } from "@/lib/admin";
import { loadAppContent } from "@/lib/content-overrides";
import { scheduleCatalogSync } from "@/lib/catalog-sync";
import {
  getUserDayStats,
  getUserHistory,
  getUserTotalPoints,
} from "@/lib/data";
import { getTodayIsoForTimezone } from "@/lib/date-server";
import { getUserFavoriteIds } from "@/lib/favorites";
import {
  displayNameChangeBlockedUntil,
  formatDisplayNameChangeRetry,
} from "@/lib/display-name-policy";
import { haversineKm } from "@/lib/geo";
import { effectiveLocation } from "@/lib/location-effective";
import {
  buildPlaceFactors,
  latitudeBand,
  sunPhaseHint,
} from "@/lib/place-factors";
import { geomagDipoleFallback, formatGeomagDisplay } from "@/lib/geomag";
import { getZipPlaceCached } from "@/lib/zip-place-cache";
import { seasonCoachLine } from "@/lib/checklist-order";
import { getRegionById, listRegions } from "@/lib/regions";
import {
  getUserAppFlags,
  redirectIfNeedsOnboarding,
} from "@/lib/require-onboarding";
import { ensurePermanentCompletions } from "@/lib/permanent-completions";
import { getSunriseBuffToday } from "@/lib/sunrise-buff";
import { getUserStreak } from "@/lib/streaks";
import { formatTimeInZone, getSunTimesForLocalDay, sunPhase } from "@/lib/sun";
import { displayTimeToHm, shiftHm } from "@/lib/time-hm";
import { ROUTES } from "@/lib/routes";
import { getWeeklySummary } from "@/lib/weekly";
import { hasMorningLightLoggedToday } from "@/lib/scoring";

export const metadata = { title: "Home" };

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; lesson?: string; sunrise?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect(ROUTES.login);
  await redirectIfNeedsOnboarding(session.user.id);

  const params = await searchParams;
  const initialTab = tabFromSearchParam(params.t);
  const initialAccountSection = accountSectionFromSearchParam(params.t);
  const initialTodaySection = todaySectionFromSearchParam(params.t);
  const initialMitoLesson = mitoLessonFromSearchParam(params.lesson);
  const initialOpenAdmin =
    (Array.isArray(params.t) ? params.t[0] : params.t) === "admin";
  const forceSunriseCheckIn =
    (Array.isArray(params.sunrise) ? params.sunrise[0] : params.sunrise) ===
    "1";
  const h = await headers();
  const userId = session.user.id;

  const [userFlags, appContent, availableIds, fullUser, isAdmin] =
    await Promise.all([
      getUserAppFlags(userId),
      loadAppContent(),
      getUserFavoriteIds(userId),
      db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
        .then((r) => r[0] ?? null),
      getIsAdminForUserId(userId),
    ]);

  // FK sync never blocks first paint — runs after the response is sent.
  scheduleCatalogSync();
  const allProtocols = appContent.protocols;

  if (!fullUser) redirect(ROUTES.login);

  const loc = effectiveLocation({
    ...userFlags!,
    elevationM: userFlags?.elevationM ?? null,
  });

  const tz =
    loc.timezone || h.get("x-vercel-ip-timezone") || "UTC";
  const date = getTodayIsoForTimezone(tz);

  // Permanent auto-logs must finish before day stats so checklist counts are right.
  await ensurePermanentCompletions(userId, date);

  const [
    dayStats,
    streak,
    weekly,
    region,
    sunriseBuff,
    history,
    lifetimePoints,
    reminderRows,
    regions,
  ] = await Promise.all([
    getUserDayStats(userId, date),
    getUserStreak(userId, date),
    getWeeklySummary(userId, date),
    getRegionById(userFlags?.regionId),
    getSunriseBuffToday(userId, date),
    getUserHistory(userId, 45),
    getUserTotalPoints(userId),
    db.select().from(userReminders).where(eq(userReminders.userId, userId)),
    listRegions(),
  ]);

  const hasCoords = loc.latitude != null && loc.longitude != null;
  const sunLat = hasCoords ? loc.latitude! : (region?.latitude ?? null);
  const sunLng = hasCoords ? loc.longitude! : (region?.longitude ?? null);

  const sun =
    sunLat != null && sunLng != null
      ? getSunTimesForLocalDay(new Date(), sunLat, sunLng, tz)
      : null;

  // Place factors — sync sun/geology; magnetism from shared ZIP cache when fresh.
  const zipCached = loc.postalCode
    ? await getZipPlaceCached(loc.postalCode)
    : null;

  const placeFactors =
    sun && sunLat != null && sunLng != null
      ? buildPlaceFactors({
          latitude: sunLat,
          longitude: sunLng,
          sun,
          timeZone: tz,
          elevationM: zipCached?.elevationM ?? loc.elevationM,
          geomag:
            zipCached?.geomag ??
            formatGeomagDisplay(geomagDipoleFallback(sunLat, sunLng)),
          artificialEm: zipCached?.artificialEm ?? null,
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
  const band = sunLat != null ? latitudeBand(sunLat).uvSeasonLabel : null;
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

  let reminderSunPresets:
    | {
        sunrise: string | null;
        sunset: string | null;
        beforeSunset: string | null;
        afterSunrise: string | null;
      }
    | undefined;

  if (sun && loc.latitude != null) {
    const rise = displayTimeToHm(formatTimeInZone(sun.sunrise, tz));
    const set = displayTimeToHm(formatTimeInZone(sun.sunset, tz));
    reminderSunPresets = {
      sunrise: rise,
      sunset: set,
      afterSunrise: rise ? shiftHm(rise, 20) : null,
      beforeSunset: set ? shiftHm(set, -30) : null,
    };
  }

  const dateLabel = format(new Date(`${date}T12:00:00`), "EEEE, MMM d");
  const memberSinceLabel = fullUser.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(fullUser.createdAt)
    : null;
  const displayNameChangeBlockedUntilLabel = fullUser.createdAt
    ? (() => {
        const blockedUntil = displayNameChangeBlockedUntil({
          createdAt: fullUser.createdAt,
          displayNameChangedAt: fullUser.displayNameChangedAt ?? null,
        });
        return blockedUntil
          ? formatDisplayNameChangeRetry(blockedUntil)
          : null;
      })()
    : null;

  const morningLightLogged = hasMorningLightLoggedToday(
    Object.fromEntries(dayStats.completionCounts),
  );

  return (
    <AppShell
      initialTab={initialTab}
      initialAccountSection={initialAccountSection}
      initialTodaySection={initialTodaySection}
      initialMitoLesson={initialMitoLesson}
      dateLabel={dateLabel}
      todayIso={date}
      allProtocols={allProtocols}
      availableIds={[...availableIds]}
      completionCounts={Object.fromEntries(dayStats.completionCounts)}
      completionDurations={Object.fromEntries(dayStats.completionDurations)}
      dayPoints={dayStats.points}
      streak={streak}
      placeLabel={loc.placeLabel ?? null}
      postalCode={userFlags?.postalCode ?? null}
      region={region}
      regions={regions}
      sun={sun}
      timeZone={tz}
      isAdmin={isAdmin}
      initialOpenAdmin={initialOpenAdmin && isAdmin}
      forceSunriseCheckIn={forceSunriseCheckIn}
      morningLightLogged={morningLightLogged}
      phaseHint={phaseHint}
      placeFactors={placeFactors}
      distanceKm={distanceKm}
      phase={phase}
      localHour={localHour}
      seasonLine={seasonLine}
      weekly={weekly}
      sunriseMultiplier={sunriseBuff.multiplier}
      sunriseTierLabel={sunriseBuff.tier?.shortLabel ?? null}
      isTravel={loc.isTravel}
      travelUntil={loc.travelUntil}
      homePostalCode={userFlags?.postalCode ?? null}
      travelPostalCode={userFlags?.travelPostalCode ?? null}
      travelLabel={userFlags?.travelPlaceLabel ?? null}
      magneticoGauss={fullUser.magneticoGauss ?? 10}
      sleepRoomTempF={fullUser.sleepRoomTempF ?? 65}
      currentUserId={userId}
      accountUser={{
        username: fullUser.username,
        displayName: fullUser.displayName,
        name: fullUser.name,
        email: fullUser.email,
        timezone: fullUser.timezone,
        showOnLeaderboard: fullUser.showOnLeaderboard,
        memberSinceLabel,
        displayNameChangeBlockedUntilLabel,
      }}
      history={history}
      lifetimePoints={lifetimePoints}
      leaderboards={null}
      reminders={reminderRows.map((r) => ({
        id: r.id,
        label: r.label,
        localTime: r.localTime,
        enabled: r.enabled,
      }))}
      reminderSunPresets={reminderSunPresets}
      appContent={appContent}
    />
  );
}
