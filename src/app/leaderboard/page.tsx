import { auth } from "@/auth";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { SiteHeader } from "@/components/site-header";
import { getLeaderboard, getWeeklyLeaderboard } from "@/lib/data";
import { redirect } from "next/navigation";

export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [allTime, weekly] = await Promise.all([
    getLeaderboard(25),
    getWeeklyLeaderboard(25),
  ]);

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader active="leaderboard" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Mitochondriac ranks
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-muted">
            Points come from completed daily protocols. Consistency compounds.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-lg font-semibold">This week</h2>
            <LeaderboardTable
              rows={weekly}
              currentUserId={session.user.id}
              emptyMessage="No weekly points yet — be the first to log today."
            />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">All time</h2>
            <LeaderboardTable
              rows={allTime}
              currentUserId={session.user.id}
              emptyMessage="Leaderboard is empty until the first protocol is logged."
            />
          </section>
        </div>
      </main>
    </div>
  );
}
