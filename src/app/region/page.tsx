import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppChrome } from "@/components/app-chrome";
import { RegionCard } from "@/components/region-card";
import { RegionPicker } from "@/components/region-picker";
import { ZipForm } from "@/components/zip-form";
import { db } from "@/db";
import { users } from "@/db/schema";
import { haversineKm } from "@/lib/geo";
import { buildPlaceFactors } from "@/lib/place-factors";
import { getRegionById, listRegions } from "@/lib/regions";
import { redirectIfNeedsOnboarding } from "@/lib/require-onboarding";
import { getSunTimesForLocalDay } from "@/lib/sun";

export const metadata = { title: "Browse regions" };

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
      elevationM: users.elevationM,
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
      ? buildPlaceFactors({
          latitude: sunLat,
          longitude: sunLng,
          sun,
          timeZone: tz,
          elevationM: user?.elevationM ?? null,
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
    <AppChrome backHref="/app" backLabel="← Back to app">
      <h1 className="text-3xl font-semibold tracking-tight">
        Browse rated regions
      </h1>
      <p className="mt-2 text-sm text-muted">
        Optional override of the nearest-match score from your ZIP.{" "}
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
          />
        ) : (
          <div className="glass rounded-3xl border border-dashed border-border p-5 text-sm text-muted">
            No location yet. Set a ZIP on Today → Place, or pick a region below.
          </div>
        )}
      </div>

      <div className="mt-6">
        <ZipForm currentZip={user?.postalCode} />
      </div>

      <div className="mt-8">
        <RegionPicker
          regions={regions}
          currentId={user?.regionId ?? null}
          defaultExpanded
        />
      </div>
    </AppChrome>
  );
}
