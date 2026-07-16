import type { MitoEntrySection } from "@/lib/mitoversity";
import type { MitoReadingLevels } from "@/lib/mitoversity-reading-levels";

export const MAGNETICO_SLEEP_PAD_SIMPLE_SECTIONS: MitoEntrySection[] = [
  {
    heading: "What is a Magnetico sleep pad?",
    body: "A Magnetico sleep pad is a flat magnetic system that goes under your mattress—not on top of your pillow or sheets. It uses strong permanent magnets arranged so one main direction of magnetic field passes up through your body while you sleep. Magnetico and similar brands market it as a way to add back a steady “Earth-like” magnetic field at night, because modern bedrooms are often far from natural outdoor environments and surrounded by phones, Wi‑Fi, and other artificial electromagnetic fields.",
  },
  {
    heading: "How is it supposed to work?",
    body: "The basic idea is simple: your body evolved with Earth’s magnetic field as a constant background signal. That field is weak compared to a fridge magnet, but it is always there and points in one general direction through your body. Magnetico’s story is that sleeping for hours without that steady field—and while bombarded by pulsing artificial EMFs—makes night recovery harder. Their pad is meant to restore a calm, one-direction static field through your whole body during sleep, when repair and growth processes are most active.",
  },
  {
    heading: "How is it different from other magnetic pads?",
    body: "Many magnetic mattress toppers sit on top of the bed. Every magnet has a north pole and a south pole, so those pads can expose you to a patchwork of opposite directions all night. Magnetico argues that mixed polarity is more like a short-term stimulus than steady environmental support. Their design goes under the mattress with enough spacing and magnet strength that the field through your body is mostly one direction—closer to how Earth’s field is described in the northern hemisphere. That is why Kruse-community teaching often prefers under-mattress unidirectional systems over generic dual-polar toppers.",
  },
  {
    heading: "What you still need for good sleep",
    body: "A magnetic pad is not a substitute for the basics: a dark room, phone away from the bed, a cool temperature, and a regular sleep schedule. Think of the pad as an optional extra layer for people who already take night recovery seriously—not a magic fix for poor sleep habits.",
  },
  {
    heading: "How this fits the app",
    body: "If you own a Magnetico or equivalent under-mattress unidirectional pad, add “Magnetico sleep pad” to your available list. It auto-logs each night while it stays on your list. On the checklist, choose your pad strength (5, 10, or 20 gauss) for scoring. If you do not own one, leave it off your list and use grounding and low artificial-field hours instead.",
  },
];

export const MAGNETICO_SLEEP_PAD_READING_LEVELS: MitoReadingLevels = {
  simple: { sections: MAGNETICO_SLEEP_PAD_SIMPLE_SECTIONS },
  intermediate: {
    sections: [
      {
        heading: "Magnetism, sleep, and the body",
        body: "Cells use electrical gradients across membranes; nerves and the brain generate measurable electromagnetic activity. Sleep is when growth hormone release, tissue repair, and immune housekeeping are concentrated. Magnetico’s educational material (magneticosleep.com) describes two natural magnetic inputs: pulsed activity from the brain (especially glia) and Earth’s relatively steady geomagnetic field. Their biomagnetic model proposes that during sleep these signals can briefly align in “resonance” windows—often quoted around 90–100 minutes—supporting repair chemistry. That is manufacturer-side theory, not something this app measures, but it explains why they target sleep rather than daytime wearables.",
      },
      {
        heading: "Why supplement Earth’s field?",
        body: "Earth’s field today is on the order of ~50 microtesla (~0.5 gauss) at mid-latitudes, and satellite data show slow long-term weakening (secular variation). Historical popular estimates of much stronger ancient fields are debated among geophysicists. Separately, bedrooms add artificial AC and RF fields from wiring, chargers, and routers. Dr. Kyoichi Nakagawa’s mid-20th-century “magnetic field deficiency syndrome” linked low ambient field exposure to fatigue and aches in some patients; Magnetico cites his work but notes patients often plateaued after a few weeks—later attributed partly to not distinguishing north vs south pole effects. Mainstream sleep medicine still ranks darkness, timing, temperature, and noise above magnetic accessories.",
      },
      {
        heading: "Why direction matters (hemisphere polarity)",
        body: "Earth’s field lines enter and exit the planet with a geographic pattern: in the northern hemisphere, the vertical component is commonly treated as negative at the surface; southern hemisphere as positive. Magnetico’s atomic-level story is that field direction affects electron behavior in molecules and that sleeping in the wrong polarity is like building new cells with misaligned “valence” orientation during the first deep-sleep hours when division and repair peak. For northern-hemisphere users they specify a pure negative field passing fully through the body—not alternating patches of + and −. Product tiers (Classic ~5 G, Core ~10 G, Super ~20 G class marketing) reflect how much field should survive after mattress spacing.",
      },
      {
        heading: "The bi-polar pad problem",
        body: "Permanent magnets always have two poles. Pads on top of the mattress place magnets close to the body; even “all north up” layouts still produce positive return fields between magnet centers. Magnetico frames that as an emergency-style stimulus: more local blood flow and neuromodulatory chemistry short term (they cite magnet-on-acupoint studies showing serotonin, beta-endorphin, and ACTH shifts), with fatigue if used continuously without breaks—why many dual-polar brands recommend cycling on and off every few weeks.",
      },
      {
        heading: "Under-mattress unidirectional design",
        body: "Magnetico (Dr. Dean Bonlie lineage) installs under the mattress with ≥4 inches of non-magnetic spacing so unwanted positive spikes fall off with distance, leaving a more uniform directional field through the sleeper. Competitors that keep thin top-of-bed pads retain mixed polarity at the skin; moving those pads under a thick mattress without enough magnet density may collapse the usable field. Their comparison claims: no whole-night +/− checkerboard, enough penetration after spacing, long product history. Treat these as engineering and marketing assertions about static field geometry—not FDA-cleared therapeutic outcomes.",
      },
      {
        heading: "Sleep hygiene and nnEMF",
        body: "Circadian biology expects darkness and relative quiet at night. True dark, phone away from the head, cool room, and stable bed/wake times support recovery with or without a pad. Static DC magnet arrays and pulsing RF from phones are different physics; reduce artificial EM load and use magnetic sleep gear as separate levers if you choose both.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public light–water–magnetism framework treats sleep as when mitochondrial recovery should not fight non-native EMFs, while beneficial magnetic context—including Earth-aligned static fields—is part of place and night environment. He and adjacent communities specifically recommend Magnetico-class under-mattress unidirectional systems over generic dual-polar toppers. Strong overnight mitochondrial claims are his teaching layer, not clinical proof or an in-app measurement.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Magnetico sleep pad” when you slept on a Magnetico or equivalent under-mattress unidirectional system. Set gauss on the checklist (5 / 10 / 20) for point multipliers. Pair with phone-away-from-bed and dark-bedroom habits. Equipment required—omit from your available list if you do not own a pad.",
      },
    ],
  },
  advanced: {
    sections: [
      {
        heading: "Geomagnetic baseline and secular variation",
        body: "The World Magnetic Model describes the core-dominated field at the surface: total intensity F, inclination I (dip angle), and declination D vary with latitude and longitude. Mid-latitude surface intensities are ~25–65 µT (0.25–0.65 G). Satellite missions (Ørsted, CHAMP, Swarm) document secular variation—a few percent per century weakening of the dipole moment in recent epochs—without implying imminent reversal. Magnetico’s narrative of multi-thousand-year collapse from ~5 G to ~0.5 G blends popular geomagnetic history with contested ancient field reconstructions from archaeomagnetism and paleointensity. For lifestyle education, the defensible anchor is: the field you sleep under is measurably non-zero, slowly changing, and weaker in some regions than historical baselines in rock records—not that your bedroom lacks measurable magnetism entirely.",
      },
      {
        heading: "Static fields and biological tissue: established vs speculative",
        body: "Established biophysics: moving charges in ion channels, neurons, and cardiomyocytes produce endogenous EM fields; strong static B-fields exert Lorentz forces on moving charges and can align diamagnetic/anisotropic tissues at very high field strengths (MRI uses 1.5–7 T). At millitesla static fields, detectable effects in vitro often require engineered sensitivity; human double-blind trials of weak static mattress magnets show mixed, generally small effect sizes for pain and sleep outcomes in systematic reviews. Speculative layers in the Magnetico/Kruse stack couple weak whole-body static B to mitochondrial membrane potential, ATP synthase torque, and “liquid crystalline water” chemistry—mechanisms not established at residential gauss levels in peer-reviewed human physiology. This article separates measurable WMM context from product biomagnetic theory.",
      },
      {
        heading: "Polarity, hemisphere alignment, and vector continuity",
        body: "A dipole approximation gives inclined field lines entering the northern hemisphere surface with downward vertical component (positive inclination in the northern hemisphere in IGRF/WMM sign conventions—manufacturer literature sometimes uses “negative” as marketing hemispheric language; users should follow install polarity for their product and latitude). Magnetico’s design goal is vector continuity: one dominant B direction through torso and cranium during sleep, mimicking extended exposure to a uniform ambient field rather than spatially alternating ∇B from a near-field magnet array. Near-field magnetostatics decay as ~1/r³ from dipole sources; inter-magnet spacing on top-of-bed arrays creates spatially alternating Bz and large spatial gradients at the skin—biologically distinct from a slowly varying ambient geomagnetic vector.",
      },
      {
        heading: "Bipolar arrays vs under-mattress unidirectional topology",
        body: "A planar array of permanent magnets produces local loops of flux; even “monopole face up” configurations cannot eliminate return flux at the opposite pole side. Placing the array under mattress + box spring with ≥4″ (≈10 cm) separation increases the effective source–body distance, attenuating high-spatial-frequency components (positive spikes between magnets) while retaining a lower-frequency uniform component if magnet moment density is sufficient. Magnet density and coercivity (neodymium-iron-boron class) determine remnant B at the body after attenuation through foam; manufacturer tier labels (~5 / 10 / 20 G at body) are engineering targets, not clinical dose metrics. Comparison with pulsed PEMF devices: different waveform, different coupling physics; not interchangeable.",
      },
      {
        heading: "Nakagawa deficiency syndrome and acute neuromodulation",
        body: "Nakagawa (1950s–1970s) reported symptom clusters in urban dwellers with limited outdoor exposure, improved transiently with magnetic necklaces—later popularized as magnetic field deficiency syndrome. Magnetico interprets plateau after ~3 weeks as failure to provide correct pole dominance. Separately, localized high-gradient static or pulsed fields at acupoints can trigger short-term neuroendocrine shifts (e.g., Liss and colleagues: serotonin, β-endorphin, ACTH changes with magnet stimulation)—consistent with acute neuromodulation, not proof of whole-body nightly supplementation requirements. Distinguish: (a) acute point stimulation, (b) whole-night uniform static exposure, (c) geomagnetic secular trend as chronic environmental context.",
      },
      {
        heading: "Sleep neurophysiology and environmental confounds",
        body: "Slow-wave sleep and early-night growth hormone secretion dominate anabolic repair windows; melatonin onset depends primarily on light–dark scheduling via retinohypothalamic input to the SCN—not on static B. Thermoregulation, cortisol awakening response, and autonomic downshift remain first-order sleep drivers in clinical sleep medicine. nnEMF (ELF from wiring, RF from handsets) introduces time-varying fields qualitatively different from static magnet arrays; coupling pathways (induced currents, thermal, psychophysical expectation) should not be conflated. A pad does not replace dark, cool, low-RF sleep hygiene; it is an orthogonal environmental variable in the Kruse magnetism pillar narrative.",
      },
      {
        heading: "Mitochondrial coupling claims: epistemic boundary",
        body: "Kruse-community material links nocturnal static field restoration to mitochondrial redox, cytochrome c oxidase activity, and sulfated vitamin D chemistry—these are integrated lifestyle conclusions spanning light, water, and magnetism pillars, not endpoints validated in residential sleep trials. In vitro, strong static or PEMF fields can alter some cell behaviors; extrapolation to whole-organism mitochondrial “torque” at sub-gauss body exposures remains hypothesis. Readers should map: WMM-measured place context (this app’s Place tab) ≠ personal therapeutic dosing; logging a Magnetico night in the app is behavioral tracking, not biomarker confirmation.",
      },
      {
        heading: "How this fits the app",
        body: "Protocol “Magnetico sleep pad” logs nightly use of an under-mattress unidirectional DC system; gauss variant (5 / 10 / 20) scales base points via catalog multipliers. Permanent auto-log applies while the activity remains on the available list. Pair with Magnetism keystones (grounding, nnEMF reduction) and Light/Sleep hygiene protocols. Educational only—not medical advice, not a recommendation to purchase, and not an endorsement of all manufacturer disease claims.",
      },
    ],
  },
};
