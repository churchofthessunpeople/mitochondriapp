import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DayBoard } from "@/components/day-board";
import { SiteHeader } from "@/components/site-header";
import { getUserDayStats, getUserTotalPoints } from "@/lib/data";
import { getServerTodayIsoDate } from "@/lib/date-server";
import { getUserSchedule } from "@/lib/schedule";
import { formatPoints } from "@/lib/utils";

export const metadata = { title: "Today" };

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const date = await getServerTodayIsoDate();
  const [entries, dayStats, lifetime] = await Promise.all([
    getUserSchedule(session.user.id),
    getUserDayStats(session.user.id, date),
    getUserTotalPoints(session.user.id),
  ]);

  const completionCounts = Object.fromEntries(dayStats.completionCounts);

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader active="today" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accent">
              Daily log
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {format(new Date(`${date}T12:00:00`), "EEEE, MMMM d")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Log activities from{" "}
              <Link href="/schedule" className="text-accent hover:underline">
                your schedule
              </Link>
              . Multi items can be logged repeatedly; sunrise/sunset stay
              locked to their window.
            </p>
          </div>
          <div className="glass rounded-2xl px-4 py-3 text-sm">
            <p className="text-muted">Lifetime points</p>
            <p className="text-xl font-semibold tabular-nums text-accent">
              {formatPoints(lifetime)}
            </p>
          </div>
        </div>

        <DayBoard
          entries={entries}
          completionCounts={completionCounts}
          dayPoints={dayStats.points}
        />
      </main>
    </div>
  );
}
