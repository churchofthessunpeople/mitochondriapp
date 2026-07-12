import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegionPicker } from "@/components/region-picker";
import { ZipForm } from "@/components/zip-form";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { users } from "@/db/schema";
import { listRegions } from "@/lib/regions";

export const metadata = { title: "Region" };

export default async function RegionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db
    .select({
      regionId: users.regionId,
      postalCode: users.postalCode,
      placeLabel: users.placeLabel,
      latitude: users.latitude,
      longitude: users.longitude,
    })
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
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Location & region
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter a US ZIP for local sunrise/sunset. We map you to the nearest
          curated lifestyle score (light · magnetism · policy). You can also
          pick a named region directly.
        </p>

        {user?.placeLabel && (
          <p className="mt-4 rounded-2xl border border-border bg-foreground/[0.03] px-3 py-2 text-sm">
            Current:{" "}
            <span className="font-medium text-foreground">
              {user.placeLabel}
            </span>
            {user.postalCode ? ` · ZIP ${user.postalCode}` : ""}
            {user.latitude != null && user.longitude != null
              ? ` · ${user.latitude.toFixed(2)}°, ${user.longitude.toFixed(2)}°`
              : ""}
          </p>
        )}

        <div className="mt-6">
          <ZipForm currentZip={user?.postalCode} />
        </div>

        <div className="my-8 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          or pick a curated region
          <div className="h-px flex-1 bg-border" />
        </div>

        <RegionPicker
          regions={regions}
          currentId={user?.regionId ?? null}
        />
      </main>
    </div>
  );
}
