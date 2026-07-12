import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RemindersClient } from "@/components/reminders-client";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { userReminders } from "@/db/schema";

export const metadata = { title: "Reminders" };

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rows = await db
    .select()
    .from(userReminders)
    .where(eq(userReminders.userId, session.user.id));

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="account" />
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-semibold">Reminders</h1>
        <p className="mt-2 text-sm text-muted">
          Local browser notifications (sunrise/evening stack check-ins).
        </p>
        <div className="mt-6">
          <RemindersClient
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
