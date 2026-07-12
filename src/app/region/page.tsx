import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegionPicker } from "@/components/region-picker";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { users } from "@/db/schema";
import { listRegions } from "@/lib/regions";

export const metadata = { title: "Region" };

export default async function RegionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db
    .select({ regionId: users.regionId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const regions = await listRegions();

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="account" />
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <Link href="/today" className="text-sm text-accent hover:underline">
          ← Today
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Region</h1>
        <p className="mt-2 text-sm text-muted">
          Choose where you live (or want to live). We compute sunrise/sunset for
          that location and show a 1–5 lifestyle environment score (light,
          magnetism, policy). Not medical advice — framework for comparison.
        </p>
        <div className="mt-6">
          <RegionPicker
            regions={regions}
            currentId={user?.regionId ?? null}
          />
        </div>
      </main>
    </div>
  );
}
