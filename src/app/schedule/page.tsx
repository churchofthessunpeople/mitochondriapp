import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ScheduleEditor } from "@/components/schedule-editor";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { protocols } from "@/db/schema";
import { getUserSchedule } from "@/lib/schedule";

export const metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [entries, catalog] = await Promise.all([
    getUserSchedule(session.user.id),
    db
      .select()
      .from(protocols)
      .where(eq(protocols.active, true))
      .orderBy(protocols.sortOrder),
  ]);

  return (
    <div className="min-h-screen pb-16">
      <SiteHeader active="schedule" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Your day map
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Time-of-day schedule
          </h1>
          <p className="mt-2 text-sm text-muted">
            Choose which activities appear under sunrise, morning, afternoon,
            and the rest. Locked items (sunrise / sunset / night) stay in their
            window.{" "}
            <Link href="/today" className="text-accent hover:underline">
              Back to Today
            </Link>
          </p>
        </div>
        <ScheduleEditor entries={entries} catalog={catalog} />
      </main>
    </div>
  );
}
