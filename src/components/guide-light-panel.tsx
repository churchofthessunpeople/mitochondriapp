"use client";

/**
 * Teaching card: Light pillar (Kruse-aligned mitochondrial light).
 */
export function GuideLightPanel() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted">
      <p>
        <strong className="text-foreground">Light is the primary signal</strong>{" "}
        for circadian and mitochondrial timing. Full-spectrum outdoor light to
        the eyes (no glass, no sunglasses for the first dose) sets the day.
      </p>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Daily keystone · Morning light
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Sun over the horizon</strong> —
            best: eyes to the solar disk as it rises (2× day boost)
          </li>
          <li>
            <strong className="text-foreground">Open-sky morning</strong> —
            outdoors under decent sky (1.5×)
          </li>
          <li>
            <strong className="text-foreground">Outside otherwise</strong> —
            trees, streets, overcast still beat indoor LEDs (1.25×)
          </li>
        </ul>
        <p className="text-xs">
          Keystone logs earn base points only; they unlock the multiplier on
          other activities that day.
        </p>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Through the day
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>Outdoor blocks without window glass between you and the sky</li>
          <li>
            Midday UV on skin when season/latitude allows (non-burning)
          </li>
          <li>Sunset / red-NIR for evening circadian wind-down</li>
        </ul>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">At night</h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>Dim screens, warm light, or blockers after sunset</li>
          <li>True dark bedroom — melanopsin needs darkness for recovery</li>
        </ul>
      </section>

      <p className="text-xs">
        Educational lifestyle framework only — not medical advice.
      </p>
    </div>
  );
}
