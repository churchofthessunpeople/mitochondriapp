import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import {
  VOLCANIC_HOTSPOTS,
  compositeHealthRating,
  magnetismScoreFromLocation,
  policyScoreFromFactors,
  sunScoreFromLatitude,
} from "@/lib/region-scoring";

export const metadata = { title: "How region scores work" };

export default async function RegionScoringPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Demo numbers for the docs
  const demoLat = 13.7;
  const demoLon = -89.2;
  const sun = sunScoreFromLatitude(demoLat);
  const mag = magnetismScoreFromLocation(demoLat, demoLon);
  const pol = policyScoreFromFactors({
    bitcoinLegalTender: true,
    outdoorCulture: true,
  });

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="account" />
      <main className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6">
        <div>
          <Link href="/region" className="text-sm text-accent hover:underline">
            ← Region
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            How scores are calculated
          </h1>
          <p className="mt-2 text-sm text-muted">
            Transparent 1–5 model used for curated regions and for explaining
            ZIP-mapped scores. Educational / lifestyle framework only — not
            medical, legal, or investment advice.
          </p>
        </div>

        <section className="glass space-y-3 rounded-3xl p-5">
          <h2 className="text-lg font-semibold">1. Sun score (latitude)</h2>
          <p className="text-sm text-muted">
            Closer to the equator = more year-round solar signal. Far north /
            south winters destroy UV and circadian light timing.
          </p>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>|lat| 0–12°</strong> → 5 (deep tropics)
            </li>
            <li>
              <strong>12–23.5°</strong> → 4 (tropics)
            </li>
            <li>
              <strong>23.5–35°</strong> → 3 (subtropics)
            </li>
            <li>
              <strong>35–48°</strong> → 2 (mid-latitudes)
            </li>
            <li>
              <strong>48°+</strong> → 1 (high latitude)
            </li>
          </ul>
          <p className="text-xs text-muted">
            Example El Salvador ~13.7°N → sun score {sun}.
          </p>
        </section>

        <section className="glass space-y-3 rounded-3xl p-5">
          <h2 className="text-lg font-semibold">
            2. Magnetism score (active magma / volcanoes)
          </h2>
          <p className="text-sm text-muted">
            Distance from major active volcanic arcs and hotspots (proxy for
            free-flowing magma / dynamic geological field narrative).
          </p>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>≤ 250 km</strong> → 5
            </li>
            <li>
              <strong>≤ 600 km</strong> → 4
            </li>
            <li>
              <strong>≤ 1,500 km</strong> → 3
            </li>
            <li>
              <strong>≤ 3,500 km</strong> → 2
            </li>
            <li>
              <strong>Farther</strong> → 1
            </li>
          </ul>
          <p className="text-xs text-muted">
            Example near San Salvador → nearest {mag.nearestName} (~
            {Math.round(mag.nearestKm)} km) → magnetism {mag.score}.
          </p>
          <details className="text-xs text-muted">
            <summary className="cursor-pointer text-foreground">
              Volcanic anchors used ({VOLCANIC_HOTSPOTS.length})
            </summary>
            <ul className="mt-2 max-h-40 list-inside list-disc overflow-y-auto">
              {VOLCANIC_HOTSPOTS.map((h) => (
                <li key={h.name}>
                  {h.name} ({h.lat.toFixed(1)}, {h.lng.toFixed(1)})
                </li>
              ))}
            </ul>
          </details>
        </section>

        <section className="glass space-y-3 rounded-3xl p-5">
          <h2 className="text-lg font-semibold">
            3. Politics / monetary freedom score
          </h2>
          <p className="text-sm text-muted">
            Starts at 3 (mixed free-world baseline), then adjusts:
          </p>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>+2</strong> Bitcoin legal tender / strategic national BTC
            </li>
            <li>
              <strong>+1</strong> crypto-friendly (no legal tender)
            </li>
            <li>
              <strong>+1</strong> strong outdoor culture
            </li>
            <li>
              <strong>−1</strong> active CBDC / forced digital-money pressure
            </li>
            <li>
              <strong>−1</strong> high surveillance / digital ID control
            </li>
            <li>
              <strong>−1</strong> open-border / security stress (framework flag)
            </li>
            <li>
              <strong>−1</strong> authoritarian / extractive economic control
            </li>
          </ul>
          <p className="text-xs text-muted">
            Clamped to 1–5. Example El Salvador (BTC legal tender + outdoor) →
            policy {pol}. Example UK factors (CBDC pressure + surveillance +
            border stress, low crypto friendliness) → low policy band.
          </p>
        </section>

        <section className="glass space-y-3 rounded-3xl p-5">
          <h2 className="text-lg font-semibold">4. Composite health rating</h2>
          <p className="text-sm text-muted">
            Equal average of sun + magnetism + policy, rounded to nearest
            integer 1–5.
          </p>
          <p className="text-sm">
            Demo El Salvador: sun {sun} · mag {mag.score} · policy {pol} →{" "}
            <strong className="text-accent">
              {compositeHealthRating(sun, mag.score, pol)}/5
            </strong>
          </p>
        </section>

        <section className="glass space-y-3 rounded-3xl p-5">
          <h2 className="text-lg font-semibold">5. Place factors (extra context)</h2>
          <p className="text-sm text-muted">
            Shown under your scores — facts and labels, not extra 1–5 ratings:
          </p>
          <ul className="space-y-1 text-sm">
            <li>
              <strong>Solar noon</strong> — local clock time of peak sun path
            </li>
            <li>
              <strong>Latitude + band</strong> — tropics → high latitude (same
              bands as sun score)
            </li>
            <li>
              <strong>UV season</strong> — year-round vs seasonal window from
              latitude
            </li>
            <li>
              <strong>Elevation</strong> — meters/feet from a free elevation API
              (stronger UV per minute at altitude)
            </li>
            <li>
              <strong>Nearest magma</strong> — closest free-flowing magma /
              volcanic system in our catalog (not under your house). Distance
              drives the magnetism score; far away = lower magnetism.
            </li>
          </ul>
          <p className="text-xs text-muted">
            Today also shows a short sun-phase hint (night / sunrise / day /
            sunset) for light timing.
          </p>
        </section>

        <section className="glass space-y-2 rounded-3xl p-5 text-sm text-muted">
          <h2 className="text-lg font-semibold text-foreground">
            ZIP codes
          </h2>
          <p>
            Your ZIP sets <em>exact</em> lat/lng for sunrise/sunset and place
            factors. The 1–5 lifestyle score still comes from the nearest
            curated region (so we do not invent policy stories for every street).
          </p>
          <p>
            Over time we can auto-score any lat/lng with sun + volcano distance,
            and only hand-tune policy flags for places people care about.
          </p>
        </section>
      </main>
    </div>
  );
}
