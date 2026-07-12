import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HistoryList } from "@/components/history-list";
import { SiteHeader } from "@/components/site-header";
import { getUserHistory, getUserTotalPoints } from "@/lib/data";
import { formatPoints } from "@/lib/utils";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [history, total] = await Promise.all([
    getUserHistory(session.user.id, 45),
    getUserTotalPoints(session.user.id),
  ]);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="history" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Your trail
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">History</h1>
          <p className="mt-2 text-sm text-muted">
            Tap a day for details · lifetime{" "}
            <span className="font-medium text-foreground">
              {formatPoints(total)} pts
            </span>
          </p>
        </div>
        <HistoryList rows={history} linkDays />
        <p className="mt-6 text-center text-sm">
          <Link href="/api/export/csv" className="text-accent hover:underline">
            Export all logs (CSV)
          </Link>
        </p>
      </main>
    </div>
  );
}
