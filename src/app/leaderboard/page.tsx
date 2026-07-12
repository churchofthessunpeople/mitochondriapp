import { auth } from "@/auth";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { SiteHeader } from "@/components/site-header";
import {
  getLeaderboard,
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
  getWeeklyLightLeaderboard,
  getLeaderboardPeriod,
} from "@/lib/data";
import { getFriendIds } from "@/lib/friends";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const friendIds = await getFriendIds(session.user.id);
  const friendScope = [...friendIds, session.user.id];

  const [weekly, monthly, allTime, friendsWeek, lightWeek] = await Promise.all([
    getWeeklyLeaderboard(25),
    getMonthlyLeaderboard(25),
    getLeaderboard(25),
    friendIds.length
      ? getLeaderboardPeriod({
          limit: 25,
          fromDate: new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10),
          userIds: friendScope,
        })
      : Promise.resolve([]),
    getWeeklyLightLeaderboard(25),
  ]);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="leaderboard" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accent">
              Ranks
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Leaderboard
            </h1>
            <p className="mt-2 text-sm text-muted">
              Weekly default for fairness · multi-logs are capped
            </p>
          </div>
          <Link
            href="/friends"
            className="rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
          >
            Friends
          </Link>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-lg font-semibold">This week · light</h2>
            <p className="mb-3 text-xs text-muted">
              Points from light-category protocols only (morning outdoor light,
              sun, sunset…) — rewards practice, not gum spam.
            </p>
            <LeaderboardTable
              rows={lightWeek}
              currentUserId={session.user.id}
              emptyMessage="No light logs this week yet."
            />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">This week · all pts</h2>
            <LeaderboardTable
              rows={weekly}
              currentUserId={session.user.id}
              emptyMessage="No weekly points yet."
            />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">This month</h2>
            <LeaderboardTable
              rows={monthly}
              currentUserId={session.user.id}
              emptyMessage="No monthly points yet."
            />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">All time</h2>
            <LeaderboardTable
              rows={allTime}
              currentUserId={session.user.id}
              emptyMessage="Leaderboard is empty."
            />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">Friends · week</h2>
            <LeaderboardTable
              rows={friendsWeek}
              currentUserId={session.user.id}
              emptyMessage="Add friends to see a private board."
            />
          </section>
        </div>
      </main>
    </div>
  );
}
