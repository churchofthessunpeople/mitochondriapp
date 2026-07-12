import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ScheduleDay } from "@/components/schedule-day";
import { SiteHeader } from "@/components/site-header";
import { getUserDayStats } from "@/lib/data";
import { getServerTodayIsoDate } from "@/lib/date-server";
import { getUserFavoriteProtocols } from "@/lib/favorites";
import { getUserStreak } from "@/lib/streaks";

export const metadata = { title: "Schedule" };

/**
 * Checklist = your available activities only (flat list, no time-of-day).
 * Manage the list on /activities.
 */
export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const date = await getServerTodayIsoDate();
  const [availableRows, dayStats, streak] = await Promise.all([
    getUserFavoriteProtocols(session.user.id),
    getUserDayStats(session.user.id, date),
    getUserStreak(session.user.id, date),
  ]);

  const protocols = availableRows.map((r) => r.protocol);
  const dateLabel = format(new Date(`${date}T12:00:00`), "EEEE, MMM d");

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="schedule" />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <ScheduleDay
          protocols={protocols}
          completionCounts={Object.fromEntries(dayStats.completionCounts)}
          dayPoints={dayStats.points}
          streak={streak}
          dateLabel={dateLabel}
        />
      </main>
    </div>
  );
}
