import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ScheduleDay } from "@/components/schedule-day";
import { ScheduleEditor } from "@/components/schedule-editor";
import { SiteHeader } from "@/components/site-header";
import { getUserDayStats } from "@/lib/data";
import { getServerTodayIsoDate } from "@/lib/date-server";
import { getUserFavoriteIds, getUserFavoriteProtocols } from "@/lib/favorites";
import { getUserSchedule } from "@/lib/schedule";
import { getUserStreak } from "@/lib/streaks";

export const metadata = { title: "Schedule" };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const editMode = params.edit === "1" || params.edit === "true";

  const date = await getServerTodayIsoDate();
  const [entries, availableRows, availableIds, dayStats, streak] =
    await Promise.all([
      getUserSchedule(session.user.id),
      getUserFavoriteProtocols(session.user.id),
      getUserFavoriteIds(session.user.id),
      getUserDayStats(session.user.id, date),
      getUserStreak(session.user.id, date),
    ]);

  const availableCatalog = availableRows.map((r) => r.protocol);
  const dateLabel = format(new Date(`${date}T12:00:00`), "EEEE, MMM d");

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="schedule" />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {editMode ? (
          <>
            <div className="mb-6">
              <Link
                href="/schedule"
                className="text-sm text-accent hover:underline"
              >
                ← Today&apos;s checklist
              </Link>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Edit schedule
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                Pin activities from your available list into time-of-day slots.
                Only what you marked available on{" "}
                <Link
                  href="/activities"
                  className="text-accent hover:underline"
                >
                  My activities
                </Link>{" "}
                can be scheduled.
              </p>
            </div>

            {availableCatalog.length === 0 ? (
              <div className="glass rounded-3xl border border-dashed border-border p-6 text-center">
                <p className="font-medium">No available activities yet</p>
                <p className="mt-2 text-sm text-muted">
                  Choose what you can do first (equipment, access, preference),
                  then build your day map.
                </p>
                <Link
                  href="/activities"
                  className="btn-primary mt-4 inline-flex h-11 items-center rounded-2xl px-5 text-sm font-semibold"
                >
                  Pick available activities
                </Link>
              </div>
            ) : (
              <ScheduleEditor
                entries={entries}
                catalog={availableCatalog}
                availableCount={availableIds.size}
              />
            )}
          </>
        ) : (
          <ScheduleDay
            entries={entries}
            completionCounts={Object.fromEntries(dayStats.completionCounts)}
            dayPoints={dayStats.points}
            streak={streak}
            streakBonusToday={dayStats.streakBonus}
            dateLabel={dateLabel}
          />
        )}
      </main>
    </div>
  );
}
