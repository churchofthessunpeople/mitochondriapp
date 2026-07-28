"use client";

/**
 * Teaching card: Water pillar (deuterium / hydration framework).
 */
export function GuideWaterPanel() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted">
      <p>
        <strong className="text-foreground">Water is not just “drink more.”</strong>{" "}
        In this lifestyle model, the hydrogen story around mitochondrial
        water—and deuterium (heavy hydrogen) load from food and drink—is treated
        as a lever on how cleanly cells can run energy chemistry (including
        narratives around ATP synthase). We use simple habits, not lab assays.
      </p>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Daily water habit · Hydration or meal
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Morning hydration</strong>{" "}
            — mineralized water in daylight (preferred first water of the day)
          </li>
          <li>
            <strong className="text-foreground">Lower-deuterium meal</strong> —
            seafood, quality fats, C3 plants (most trees/grains; vs C4 like corn)
            where practical
          </li>
          <li>
            <strong className="text-foreground">Drinking water</strong> —
            filtered, spring, or lower-deuterium water — not only empty water all
            day
          </li>
        </ul>
        <p className="text-xs">
          Logging any water habit counts toward today&apos;s water progress.
        </p>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Supporting water habits
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>Seafood-forward meals (marine fats / DHA lifestyle stack)</li>
          <li>Hydrate earlier in the day; taper late for sleep</li>
          <li>Earlier last meal — less metabolic load overnight</li>
        </ul>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5 text-xs">
        <h2 className="text-sm font-semibold text-foreground">
          How we talk about ATP synthase
        </h2>
        <p>
          Established bioenergetics describes ATP synthase as a proton-driven
          rotary enzyme. Dr. Jack Kruse&apos;s public teaching additionally
          stresses environmental deuterium load as a lifestyle lever on that
          water/hydrogen story. This app tracks{" "}
          <em>behaviors</em> (hydration and meal patterns)—it does not measure
          body deuterium or diagnose disease. See Mitoversity for the full
          explainer.
        </p>
      </section>

      <p className="text-xs">
        Educational lifestyle framework only — not medical or nutrition advice.
      </p>
    </div>
  );
}
