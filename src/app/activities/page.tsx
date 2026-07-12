import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AvailablePicker } from "@/components/available-picker";
import { SiteHeader } from "@/components/site-header";
import { getActiveProtocols } from "@/lib/data";
import { getUserFavoriteIds } from "@/lib/favorites";
import { redirectIfNeedsOnboarding } from "@/lib/require-onboarding";

export const metadata = { title: "My activities" };

export default async function ActivitiesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await redirectIfNeedsOnboarding(session.user.id);

  const [protocols, availableIds] = await Promise.all([
    getActiveProtocols(),
    getUserFavoriteIds(session.user.id),
  ]);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="activities" />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">
          Personal catalog
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Available activities
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Build your via list — only what you can realistically do. Those items
          become your{" "}
          <Link href="/schedule" className="text-accent hover:underline">
            daily checklist
          </Link>
          .
        </p>

        <div className="mt-6">
          <AvailablePicker
            protocols={protocols}
            availableIds={[...availableIds]}
          />
        </div>
      </main>
    </div>
  );
}
