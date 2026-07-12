import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegionCard } from "@/components/region-card";
import { SiteHeader } from "@/components/site-header";
import { ZipForm } from "@/components/zip-form";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getServerTodayIsoDate } from "@/lib/date-server";
import { haversineKm } from "@/lib/geo";
import {
  buildPlaceFactorsWithElevation,
  sunPhaseHint,
} from "@/lib/place-factors";
import { getRegionById } from "@/lib/regions";
import { getSunTimesForLocalDay, sunPhase } from "@/lib/sun";

export const metadata = { title: "Place" };

export default async function PlacePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const date = await getServerTodayIsoDate();
  const h = await headers();

  const [user] = await db
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
    .limit(1);

  const region = await getRegionById(user?.regionId);
  const hasCoords = user?.latitude != null && user?.longitude != null;
  const sunLat = hasCoords ? user!.latitude! : (region?.latitude ?? null);
  const sunLng = hasCoords ? user!.longitude! : (region?.longitude ?? null);
  const tz =
    user?.timezone ||
    region?.timezone ||
    h.get("x-vercel-ip-timezone") ||
    "UTC";

  const sun =
    sunLat != null && sunLng != null
      ? getSunTimesForLocalDay(new Date(), sunLat, sunLng, tz)
      : null;

  const placeFactors =
    sun && sunLat != null && sunLng != null
      ? await buildPlaceFactorsWithElevation({
          latitude: sunLat,
          longitude: sunLng,
          sun,
          timeZone: tz,
        })
      : null;

  const distanceKm =
    hasCoords && region
      ? haversineKm(
          user!.latitude!,
          user!.longitude!,
          region.latitude,
          region.longitude,
        )
      : null;

  const phaseHint =
    sun != null
      ? sunPhaseHint(sunPhase(new Date(), sun.sunrise, sun.sunset))
      : null;

  const hasAssignment = Boolean(region || user?.placeLabel);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="place" />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">
          Your environment
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Place
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {format(new Date(`${date}T12:00:00`), "EEEE, MMM d")} · light, scores,
          and place factors for where you are.{" "}
          <Link href="/region/scoring" className="text-accent hover:underline">
            How scoring works
          </Link>
        </p>

        <div className="mt-6">
          {hasAssignment && sun ? (
            <RegionCard
              region={region}
              sun={sun}
              placeLabel={user?.placeLabel}
              postalCode={user?.postalCode}
              distanceKm={distanceKm}
              timeZone={tz}
              placeFactors={placeFactors}
              phaseHint={phaseHint}
            />
          ) : (
            <div className="glass rounded-3xl border border-dashed border-border p-5 text-sm text-muted">
              <p className="font-medium text-foreground">No location yet</p>
              <p className="mt-1">
                Enter your US ZIP below for sunrise/sunset at your coordinates
                and the nearest lifestyle score.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <ZipForm currentZip={user?.postalCode} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
          <Link
            href="/schedule"
            className="glass rounded-2xl border border-border px-4 py-3 font-medium hover:border-accent/40"
          >
            Today&apos;s schedule →
          </Link>
          <Link
            href="/activities"
            className="glass rounded-2xl border border-border px-4 py-3 font-medium hover:border-accent/40"
          >
            My activities →
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Prefer a curated metro score?{" "}
          <Link href="/region" className="text-accent hover:underline">
            Browse rated regions
          </Link>
        </p>
      </main>
    </div>
  );
}
