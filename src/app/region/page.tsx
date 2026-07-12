import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegionCard } from "@/components/region-card";
import { RegionPicker } from "@/components/region-picker";
import { ZipForm } from "@/components/zip-form";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { users } from "@/db/schema";
import { haversineKm } from "@/lib/geo";
import { buildPlaceFactorsWithElevation } from "@/lib/place-factors";
import { getRegionById, listRegions } from "@/lib/regions";
import { redirectIfNeedsOnboarding } from "@/lib/require-onboarding";
import { getSunTimesForLocalDay } from "@/lib/sun";

export const metadata = { title: "Region" };

export default async function RegionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await redirectIfNeedsOnboarding(session.user.id);

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

  const regions = await listRegions();
  const region = await getRegionById(user?.regionId);

  const hasCoords = user?.latitude != null && user?.longitude != null;
  const sunLat = hasCoords ? user!.latitude! : region?.latitude;
  const sunLng = hasCoords ? user!.longitude! : region?.longitude;
  const tz = user?.timezone || region?.timezone || "UTC";

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

  const hasAssignment = Boolean(region || user?.placeLabel);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="account" />
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <Link href="/place" className="text-sm text-accent hover:underline">
          ← Place
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Location & region
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter a US ZIP for sunrise/sunset at your coordinates. We assign the
          nearest lifestyle score automatically.{" "}
          <Link href="/region/scoring" className="text-accent hover:underline">
            How scoring works
          </Link>
        </p>

        {/* Primary: assigned region after ZIP */}
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
            />
          ) : (
            <div className="glass rounded-3xl border border-dashed border-border p-5 text-sm text-muted">
              No location yet. Enter your ZIP below — your assigned region and
              sun times will show here.
            </div>
          )}
        </div>

        <div className="mt-6">
          <ZipForm currentZip={user?.postalCode} />
        </div>

        {/* Full catalog collapsed */}
        <div className="mt-8">
          <RegionPicker
            regions={regions}
            currentId={user?.regionId ?? null}
            defaultExpanded={false}
          />
        </div>
      </main>
    </div>
  );
}
