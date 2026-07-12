import { auth } from "@/auth";
import { HistoryList } from "@/components/history-list";
import { SiteHeader } from "@/components/site-header";
import { getUserHistory, getUserTotalPoints } from "@/lib/data";
import { formatPoints } from "@/lib/utils";
import { redirect } from "next/navigation";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [history, total] = await Promise.all([
    getUserHistory(session.user.id, 21),
    getUserTotalPoints(session.user.id),
  ]);

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader active="history" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Your trail
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">History</h1>
          <p className="mt-2 text-sm text-muted">
            Last {history.length || 21} active days · lifetime{" "}
            <span className="font-medium text-foreground">
              {formatPoints(total)} pts
            </span>
          </p>
        </div>
        <HistoryList rows={history} />
      </main>
    </div>
  );
}
