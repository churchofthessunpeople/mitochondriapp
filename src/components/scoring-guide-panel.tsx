"use client";

import {
  MAGMA_FULL_INFLUENCE_KM,
  MAGMA_ZERO_INFLUENCE_KM,
  VOLCANIC_HOTSPOTS,
  compositeHealthRating,
  magnetismScoreFromLocation,
  policyScoreFromFactors,
  sunScoreFromLatitude,
} from "@/lib/region-scoring";

/** Scoring docs as an in-page card body (no route). */
export function ScoringGuidePanel() {
  const demoLat = 13.7;
  const demoLon = -89.2;
  const sun = sunScoreFromLatitude(demoLat);
  const mag = magnetismScoreFromLocation(demoLat, demoLon);
  const pol = policyScoreFromFactors({
    bitcoinLegalTender: true,
    outdoorCulture: true,
  });

  return (
    <div className="space-y-4">
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
          Distance to the nearest Holocene volcano or major magma system
          (Smithsonian GVP catalog + USGS US volcanoes + arc/hotspot midpoints).
          Boost uses inverse-square falloff (1/r²): full influence within ~
          {MAGMA_FULL_INFLUENCE_KM} km, zero boost past ~
          {MAGMA_ZERO_INFLUENCE_KM} km. Lifestyle proxy — not a real-time
          eruption alert.
        </p>
        <ul className="space-y-1 text-sm">
          <li>
            <strong>≤ {MAGMA_FULL_INFLUENCE_KM} km</strong> → 5 (full magma
            boost)
          </li>
          <li>
            <strong>
              {MAGMA_FULL_INFLUENCE_KM}–{MAGMA_ZERO_INFLUENCE_KM} km
            </strong>{" "}
            → 2–4 (1/r² taper)
          </li>
          <li>
            <strong>≥ {MAGMA_ZERO_INFLUENCE_KM} km</strong> → 1 (no boost —
            too far to matter)
          </li>
        </ul>
        <p className="text-xs text-muted">
          Example near San Salvador → nearest {mag.nearestName} (~
          {Math.round(mag.nearestKm)} km) → geology {mag.score}/5
          {mag.boost > 0 ? ` (+${mag.boost} boost)` : " (no boost)"}.
        </p>
        <details className="text-xs text-muted">
          <summary className="cursor-pointer text-foreground">
            Volcanic anchors used ({VOLCANIC_HOTSPOTS.length.toLocaleString()})
          </summary>
          <p className="mt-2">
            Full list is large (global Holocene + US systems). Nearest name is
            shown on Place for your coordinates. Cite GVP / USGS.
          </p>
          <ul className="mt-2 max-h-40 list-inside list-disc overflow-y-auto">
            {VOLCANIC_HOTSPOTS.filter((h) => h.source === "system").map((h) => (
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
          policy {pol}.
        </p>
      </section>

      <section className="glass space-y-3 rounded-3xl p-5">
        <h2 className="text-lg font-semibold">4. Composite health rating</h2>
        <p className="text-sm text-muted">
          Equal average of sun + magnetism + policy, rounded to nearest integer
          1–5.
        </p>
        <p className="text-sm">
          Demo El Salvador: sun {sun} · mag {mag.score} · policy {pol} →{" "}
          <strong className="text-accent">
            {compositeHealthRating(sun, mag.score, pol)}/5
          </strong>
        </p>
      </section>

      <section className="glass space-y-3 rounded-3xl p-5">
        <h2 className="text-lg font-semibold">5. Place factors</h2>
        <p className="text-sm text-muted">
          Extra context on Place (not extra 1–5 scores): solar noon, latitude
          band, UV season, elevation, nearest magma system.
        </p>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5 text-sm text-muted">
        <h2 className="text-lg font-semibold text-foreground">ZIP codes</h2>
        <p>
          Your ZIP sets exact lat/lng for sunrise/sunset and place factors. The
          1–5 lifestyle score still comes from the nearest curated region.
        </p>
      </section>
    </div>
  );
}
