import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RemindersClient } from "@/components/reminders-client";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { userReminders } from "@/db/schema";
import { effectiveLocation } from "@/lib/location-effective";
import { getUserAppFlags } from "@/lib/require-onboarding";
import { formatTimeInZone, getSunTimesForLocalDay } from "@/lib/sun";
import { displayTimeToHm, shiftHm } from "@/lib/time-hm";

export const metadata = { title: "Reminders" };

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [rows, flags] = await Promise.all([
    db
      .select()
      .from(userReminders)
      .where(eq(userReminders.userId, session.user.id)),
    getUserAppFlags(session.user.id),
  ]);

  const loc = flags ? effectiveLocation(flags) : null;

  let sunPresets:
    | {
        sunrise: string | null;
        sunset: string | null;
        beforeSunset: string | null;
        afterSunrise: string | null;
      }
    | undefined;

  if (loc?.latitude != null && loc.longitude != null) {
    const tz = loc.timezone || "UTC";
    const sun = getSunTimesForLocalDay(
      new Date(),
      loc.latitude,
      loc.longitude,
      tz,
    );
    const rise = displayTimeToHm(formatTimeInZone(sun.sunrise, tz));
    const set = displayTimeToHm(formatTimeInZone(sun.sunset, tz));
    sunPresets = {
      sunrise: rise,
      sunset: set,
      afterSunrise: rise ? shiftHm(rise, 20) : null,
      beforeSunset: set ? shiftHm(set, -30) : null,
    };
  }

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="account" />
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-semibold">Reminders</h1>
        <p className="mt-2 text-sm text-muted">
          Local browser notifications — prefer sun-relative times when you have
          a ZIP set.
        </p>
        <div className="mt-6">
          <RemindersClient
            sunPresets={sunPresets}
            initial={rows.map((r) => ({
              id: r.id,
              label: r.label,
              localTime: r.localTime,
              enabled: r.enabled,
            }))}
          />
        </div>
      </main>
    </div>
  );
}
