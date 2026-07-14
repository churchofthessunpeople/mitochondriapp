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
          Evening · Sunset
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Watch the sunset</strong> —
            outdoors as the sky dims, bare eyes (no sunglasses); last natural
            light signal before indoor dimming
          </li>
          <li>
            Warm red / near-IR at dusk supports wind-down; avoid jumping straight
            to bright indoor LEDs afterward
          </li>
          <li>
            Pairs with blue-light hygiene and true dark bedroom — sunset hands
            off to darkness, it does not replace it
          </li>
        </ul>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Solar noon · Vitamin D
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Midday sun on skin</strong> —
            UVB near solar noon (see Place) drives natural vitamin D₃ in skin;
            not the same job as morning light to the eyes
          </li>
          <li>
            Short, non-burning outdoor blocks beat window glass or pills-only
            habits when latitude and season allow UV
          </li>
          <li>
            Supplements can help documented deficiency or winter gaps—this stack
            prefers structured sun first; do not stop prescribed D without your
            clinician
          </li>
        </ul>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Through the day
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>Outdoor blocks without window glass between you and the sky</li>
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
