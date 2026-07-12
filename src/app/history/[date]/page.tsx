import { format, parseISO } from "date-fns";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { getDayDetail } from "@/lib/data";
import { formatPoints } from "@/lib/utils";

export const metadata = { title: "Day detail" };

type Props = { params: Promise<{ date: string }> };

export default async function HistoryDayPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const rows = await getDayDetail(session.user.id, date);
  const total = rows.reduce((s, r) => s + r.completion.pointsEarned, 0);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="history" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/history" className="text-sm text-accent hover:underline">
          ← History
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {format(parseISO(date), "EEEE, MMMM d, yyyy")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {rows.length} event{rows.length === 1 ? "" : "s"} ·{" "}
          {formatPoints(total)} pts
        </p>

        {rows.length === 0 ? (
          <p className="mt-8 text-sm text-muted">No logs this day.</p>
        ) : (
          <ul className="mt-6 space-y-2">
            {rows.map(({ completion, protocol }) => (
              <li
                key={completion.id}
                className="glass flex items-start justify-between gap-3 rounded-2xl p-4"
              >
                <div>
                  <p className="font-medium">
                    {completion.isStreakBonus
                      ? "Streak bonus"
                      : protocol?.name ?? "Activity"}
                  </p>
                  <p className="text-xs text-muted">
                    {completion.durationMinutes
                      ? `${completion.durationMinutes} min · `
                      : ""}
                    {completion.timeOfDay ?? ""}
                    {completion.isStreakBonus ? "consistency reward" : ""}
                  </p>
                </div>
                <span className="font-semibold text-accent-2">
                  +{completion.pointsEarned}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
