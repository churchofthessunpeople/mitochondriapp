import type { MitoEntrySection } from "@/lib/mitoversity";
import type { MitoReadingLevels } from "@/lib/mitoversity-reading-levels";

/**
 * Reading tiers build upward — each level assumes you already know the prior one.
 * Simple = what & how. Intermediate = environmental / melatonin / CO₂ story.
 * Advanced = geophysics, redox chemistry, and field topology.
 */

export const MAGNETICO_SLEEP_PAD_SIMPLE_SECTIONS: MitoEntrySection[] = [
  {
    heading: "What it is",
    body: "A Magnetico sleep pad is a strong permanent-magnet system installed under the mattress (not a topper on the sheets). Magnets are arranged so one main field direction passes through your body while you sleep—meant to feel more like Earth’s steady background field than a patchwork of opposite poles.",
  },
  {
    heading: "Why people use one at night",
    body: "Earth’s magnetic environment is one of the narrow conditions life evolved inside. At night that background is often quieter relative to daytime solar electric drive. In electro-polluted bedrooms—phones, Wi‑Fi, wiring—plus sealed indoor air, recovery can feel harder. The pad’s job in this lifestyle stack is to restore a calm, one-direction static field for the sleep window.",
  },
  {
    heading: "What it does not replace",
    body: "Dark room, phone away from the bed, cool temperature, and regular sleep timing still come first. Fresh air helps too—closed bedrooms raise CO₂. The pad is an optional Magnetism-pillar layer, not a fix for bright screens or a hot, noisy room.",
  },
  {
    heading: "How this fits the app",
    body: "Own a Magnetico or equivalent under-mattress unidirectional pad? Add “Magnetico sleep pad” to your available list—it auto-logs nightly. Set strength on the checklist: 5 G = 10 pts, 10 G = 25 pts, 20 G = 50 pts. Skip nights when traveling. No pad? Leave it off and use grounding plus low artificial-field hours instead.",
  },
];

export const MAGNETICO_SLEEP_PAD_READING_LEVELS: MitoReadingLevels = {
  simple: { sections: MAGNETICO_SLEEP_PAD_SIMPLE_SECTIONS },
  intermediate: {
    sections: [
      {
        heading: "Night free-radical maintenance (new framing)",
        body: "Building on Simple: Kruse’s sharper question is whether a relatively stable nocturnal magnetic field maintains free-radical pulses that help mitochondria regenerate while you sleep. Humans measure geomagnetism with instruments; many animals sense it. The field varies with light/dark and can reverse on geologic timescales with huge biotic change. Artificial AC/RF in modern homes can drown the quieter night vector—hence interest in a static pad when you cannot move out of an electro-polluted city.",
      },
      {
        heading: "Schumann cavity, telluric currents, grounding",
        body: "Between ground and ionosphere, a resonant cavity supports micropulsations (~0.01–20 Hz, often discussed near ~7.83–10 Hz—the Schumann band). Lightning and solar storms modulate them; energy rides geomagnetic field lines. Currents in Earth (telluric) and in the atmosphere couple living things to that cavity. Barefoot grounding is about telluric contact. Van Allen and solar-wind currents further shape the micropulsation environment. Indoor insulated beds can cut you off from that Earth coupling while nnEMF adds noise—the pad is a static substitute for directional B, not a Schumann generator.",
      },
      {
        heading: "Melatonin’s night shift",
        body: "Simple said “recovery at night.” Intermediate adds: melatonin is timed by the light–dark cycle but, in Kruse’s teaching, does deep work under darkness when magnetic effects dominate daytime electric drive. It helps steer mitochondrial autophagy and apoptosis. Scrambled night magnetism (tech fields, no Earth-like vector) is argued to blunt that program. The pad does not make melatonin—it is proposed as magnetic stage-setting for melatonin’s window. Pair it with true dark and morning outdoor light; those set the hormone timing the pad cannot.",
      },
      {
        heading: "Indoor CO₂ and pseudohypoxia",
        body: "Sealed bedrooms raise CO₂; outdoor sleep does not. Rising dissolved CO₂ can make you feel sleepy or foggy and couples to cooling as core temperature falls a few °F overnight. Kruse calls chronic indoor sleep a pseudohypoxia aging load on the mitochondrial colony and links magnetic environment to how CO₂ behaves in tissues. He also notes recent centuries of declining geomagnetic intensity on satellite records as another stressor climatologists ignore. Practical stack beyond the pad: crack a window when safe, keep the room cool, cut night RF.",
      },
      {
        heading: "Dual-polar toppers vs under-mattress unidirectional",
        body: "Simple described one field direction. Why it matters: every magnet has two poles. On-mattress dual-polar arrays leave a +/− checkerboard near the skin—more like acute local stimulus than ambient Earth. Magnetico-class installs go under the mattress with spacing so return-flux spikes fall off and one polarity dominates through the torso. That topology matches the night-stable-vector story above; cycling dual-polar toppers every few weeks is a different product class.",
      },
      {
        heading: "Where Kruse goes beyond consensus",
        body: "Schumann existence, melatonin circadian biology, indoor CO₂ rise, and geomagnetic secular decline are real. Coupling them into “pad fixes free-radical Rosetta formatting and tech hypoxia” is Kruse’s light–water–magnetism prescription. Use Intermediate for the environmental story; do not treat it as a clinical protocol.",
      },
      {
        heading: "In this app (same habit, deeper why)",
        body: "Logging and gauss scoring are unchanged from Simple. Add grounding and nnEMF-reduction blocks on the same nights you credit the pad so Magnetism keystones match the telluric / artificial-EM story.",
      },
    ],
  },
  advanced: {
    sections: [
      {
        heading: "WMM baseline and cavity physics",
        body: "Assumes Intermediate’s Schumann/telluric picture. Surface field from WMM/IGRF-class models: mid-latitude total intensity typically ~25–65 µT (~0.25–0.65 G), with inclination and declination by place. Secular variation (Ørsted, CHAMP, Swarm) shows dipole moment weakening on the order of a few percent per century recently—not an imminent reversal forecast. Cavity modes between crust and ionosphere are driven by global lightning; solar wind and Van Allen current systems modulate micropulsation amplitude. Place tab WMM numbers are ambient geophysics; they are not your pad’s local gauss at the body.",
      },
      {
        heading: "Magnetohydrodynamics and haplotype claims",
        body: "Blood as a conducting fluid admits magnetohydrodynamic description; peroxiredoxins sit in peroxide / stress-sensing chemistry. Kruse extends this to oxygen-, nitrogen-, and sulfur-centered radical “formatting” under Earth–ionosphere discharge, and to mtDNA haplotypes (e.g. L0–L3) favored under equatorial magnetic current teaching maps. That ancestry–magnetism coupling is evolutionary narrative, not something this app genotypes. Advanced readers should keep haplotype maps separate from nightly pad logging.",
      },
      {
        heading: "Aromatic chemistry → tryptophan → melatonin",
        body: "Intermediate covered melatonin’s night role. Advanced adds the chemistry path Kruse uses: abiotic EM/heat rearranging atoms (Wöhler urea; Kekulé aromatics as photon-capable rings) → aromatic amino acids → tryptophan → melatonin, with chromophores (melatonin, thyroid hormones, NAD⁺, leptin in his list) as light/redox traps. Smell and vision are framed as ancient aromatic sensing. This justifies why magnetic night and light day are one stack—but it does not prove residential static magnets restore that chemistry.",
      },
      {
        heading: "CO₂–RNS/ROS mechanisms and lab proxies",
        body: "Intermediate named indoor CO₂. Mechanisms: CO₂ interacts with reactive nitrogen and oxygen species—e.g. peroxynitrite pathways via nitrosoperoxycarbonate that can rearrange; in aqueous environments hydrolysis toward carbonate/nitrate can net-scavenge nitration stress, while nonpolar membrane contexts favor other nitration outcomes. CO₂ can protect SOD in some H₂O₂ settings yet generate carbonate radicals that propagate damage. Hypercapnia can protect in some ischemia models (iron-transferrin stabilization among hypotheses). Kruse watches low serum CO₂ as a rough proxy for slowed mitochondrial oxidation under alien magnetic stress. Geomagnetic intensity ↔ climate CO₂ solubility is his speculative geophysical link—not standard climatology. None of this is a licensed indication for a mattress pad.",
      },
      {
        heading: "Near-field magnetostatics of the pad",
        body: "Intermediate contrasted topologies. Physics: dipole fields fall ~1/r³; top-of-bed arrays create large spatial gradients (∇B) at the skin. Under-mattress spacing (≥4″ / ~10 cm) attenuates high-spatial-frequency bipolar spikes if magnet moment density (NdFeB-class) is high enough to leave a usable directional component after foam attenuation. Marketed ~5 / 10 / 20 G at the body are engineering targets, not clinical dose metrics. PEMF wearables are a different waveform class—not interchangeable with static unidirectional arrays.",
      },
      {
        heading: "Epistemic boundary and measurement limits",
        body: "Established: geomagnetic field and Schumann resonances exist; melatonin is circadian; sealed rooms elevate CO₂; static magnet sleep products show mixed, usually small effects in sleep/pain reviews. Speculative: pad restores nocturnal free-radical pulses, corrects tech hypoxia via magnetic CO₂ chemistry, or couples haplotype to ionospheric currents. This app logs behavior and Place WMM/artificial-EM proxies—it does not measure radical flux, Schumann amplitude at your pillow, or serum CO₂ from a checkbox.",
      },
      {
        heading: "In this app",
        body: "Same Magnetico protocol and gauss variants as Simple. Use Place magnetism for planetary vs infrastructure context; use the pad log only for nights you actually slept on the system.",
      },
    ],
  },
};
