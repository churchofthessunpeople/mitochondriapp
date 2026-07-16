"use client";

/**
 * Teaching card: Magnetism pillar (Earth field + nnEMF + grounding).
 */
export function GuideMagnetismPanel() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted">
      <p>
        <strong className="text-foreground">Magnetism has two layers here:</strong>{" "}
        (1) <em>where you are</em> — geological / volcanic context as a lifestyle
        proxy for living Earth systems, and (2){" "}
        <em>what you do daily</em> — grounding and cutting artificial RF/EM
        load. Related cosmology (e.g. Van Allen belt / latitudinal radiation
        stories in Kruse teaching) is educational context for{" "}
        <strong className="text-foreground">place + light + water</strong>, not
        a live sensor in the app.
      </p>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Place · two magnetism layers
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Main field (WMM)</strong> —
            total intensity (µT), inclination (dip), declination at your ZIP.
            Planetary core field from models like NOAA/BGS WMM—not phones.
          </li>
          <li>
            <strong className="text-foreground">Geology</strong> — distance to
            Holocene magma systems (GVP/USGS). Lifestyle proxy, not a field
            meter or hazard alert.
          </li>
          <li>
            <strong className="text-foreground">Inclination drop zones</strong> —
            April 2026 NA map: decay corridor (30–40°N · 80–95°W) and ten
            named decline metros from your ZIP. Kruse-framework education, not
            a live decay sensor.
          </li>
          <li>
            <strong className="text-foreground">Artificial EM load</strong> —
            open-map proxy for cells/masts and nearby power plants (1–5). Not a
            personal RF/ELF reading.
          </li>
        </ul>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Daily keystone · Ground or low-field hour
        </h2>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Barefoot earth</strong> — soil,
            grass, sand, stone
          </li>
          <li>
            <strong className="text-foreground">Low artificial field hour</strong>{" "}
            — outdoors or lower EM environment
          </li>
          <li>
            <strong className="text-foreground">nnEMF reduction block</strong> —
            airplane mode, distance from routers, outdoor low-RF
          </li>
          <li>Nature immersion away from dense RF and artificial light</li>
        </ul>
      </section>

      <section className="glass space-y-2 rounded-3xl p-5">
        <h2 className="text-base font-semibold text-foreground">
          Night magnetism hygiene
        </h2>
        <p>
          Phone away from the bed (or airplane mode far from the head) — simple
          field hygiene while you recover in darkness.
        </p>
      </section>

      <p className="text-xs">
        Educational lifestyle framework only — not medical or radiation-safety
        advice.
      </p>
    </div>
  );
}
