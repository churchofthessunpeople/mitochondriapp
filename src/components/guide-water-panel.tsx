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
          Daily keystone · Low-D hydration or meal
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Low-D morning hydration</strong>{" "}
            — mineralized water in daylight (preferred first water of the day)
          </li>
          <li>
            <strong className="text-foreground">Deuterium-aware meal</strong> —
            seafood, quality fats, C3 produce where practical
          </li>
          <li>
            <strong className="text-foreground">Mineralized water</strong> —
            not only deionized / empty water all day
          </li>
        </ul>
        <p className="text-xs">
          Logging any water keystone counts toward today&apos;s water progress.
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
          Kruse-style teaching links deuterium load to mitochondrial water and
          rotary efficiency of ATP production. This app tracks{" "}
          <em>behaviors</em> that reduce heavy-water / high-D inputs in that
          narrative. It does not measure your body deuterium or diagnose disease.
        </p>
      </section>

      <p className="text-xs">
        Educational lifestyle framework only — not medical or nutrition advice.
      </p>
    </div>
  );
}
