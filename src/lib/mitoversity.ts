/**
 * Mitoversity — educational lessons on mitochondrial lifestyle levers
 * (light, water, magnetism, support habits).
 *
 * Entries are written as stand-alone research-style explainers.
 * Dr. Jack Kruse is cited where a claim is specific to his public teaching,
 * not as the sole authority for established biology.
 *
 * Expand this catalog over time. Educational only — not medical advice.
 */

export type MitoPillar = "light" | "water" | "magnetism" | "support";

export type MitoEntrySection = {
  heading: string;
  body: string;
};

export type MitoEntry = {
  id: string;
  title: string;
  pillar: MitoPillar;
  /** One-line list preview */
  summary: string;
  /** Related catalog protocol ids */
  relatedProtocolIds?: string[];
  sections: MitoEntrySection[];
};

export const MITO_PILLAR_LABEL: Record<MitoPillar, string> = {
  light: "Light",
  water: "Water",
  magnetism: "Magnetism",
  support: "Support",
};

/**
 * Curriculum entries. Add new objects here as the library grows.
 */
export const MITOVERSITY_ENTRIES: readonly MitoEntry[] = [
  {
    id: "sunrise-why",
    title: "Why morning outdoor light—and sunrise—matter",
    pillar: "light",
    summary:
      "Established circadian biology plus place-based lifestyle teaching on why first outdoor light is a high-leverage daily signal.",
    relatedProtocolIds: [
      "sunrise-horizon",
      "sunrise-open-sky",
      "sunrise-outside",
    ],
    sections: [
      {
        heading: "Circadian clocks are light-trained",
        body: "Almost every tissue has a molecular clock. The master pacemaker in the brain (suprachiasmatic nucleus) is reset primarily by light detected in the eye—not by clocks on the wall. When that signal is strong and well timed, peripheral clocks (including in metabolic tissues) tend to stay aligned. When people live under dim days and bright nights, clocks drift: sleep, hormones, and daytime energy often follow. This core idea is mainstream chronobiology, not a niche invention.",
      },
      {
        heading: "Non-visual photoreception (melanopsin)",
        body: "Specialized retinal cells that contain melanopsin project to the circadian system. They are especially responsive to short-wavelength (blue-enriched) light and to the overall intensity of outdoor daylight. That is why a bright outdoor morning differs from indoor LEDs or phone screens: spectrum, intensity, and timing all matter. Glass filters and sunglasses change the dose; indoor lighting rarely matches outdoor radiance at dawn.",
      },
      {
        heading: "Sunrise as a distinct outdoor cue",
        body: "Dawn and early morning light have a characteristic intensity ramp and spectral mix as the sun rises. Practically, being outdoors then couples you to the solar day more cleanly than “bright screens at 7 a.m.” Research on circadian phase shifting emphasizes morning light for advancing clocks and evening light for delay—supporting the habit of front-loading outdoor light and dimming late.",
      },
      {
        heading: "Mitochondria and daily metabolic timing",
        body: "Mitochondrial activity, insulin sensitivity, and many metabolic pathways show circadian rhythms. Aligning the light–dark cycle is one of the strongest non-drug levers studied for keeping those rhythms coherent. Better clock alignment is associated, in research literature, with more stable sleep and metabolic markers; mechanisms include hormone timing (e.g. melatonin, cortisol patterns) and cellular redox cycles that vary across 24 hours.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Dr. Jack Kruse’s public writing stresses a stronger hierarchy than generic “get morning light”: true outdoor sunrise with an unobstructed solar path (eyes to the horizon disk, no glass) as the day’s primary “solar call,” UV-A/full-spectrum outdoor light as non-substitutable by indoor LEDs, and tight coupling of that signal to mitochondrial redox and the wider light–water–magnetism stack (including DHA in retinal membranes). Those emphases and the exact lifestyle prescriptions are his framework; this app’s sunrise quality tiers (horizon / open sky / outside) are a pedagogical mirror of that hierarchy, not lab dosimetry.",
      },
      {
        heading: "How this app uses the idea",
        body: "Logging a morning outdoor light keystone can unlock a day points boost on other habits—teaching “light first.” Quality tiers reward clearer outdoor signals. That is product design grounded in circadian priority, with Kruse’s sunrise ranking as the lifestyle inspiration for the tiers.",
      },
    ],
  },
  {
    id: "sunset-viewing-why",
    title: "Why watching the sunset matters",
    pillar: "light",
    summary:
      "Evening outdoor light as circadian wind-down: spectral shift, melatonin timing, and the Light-pillar habit of bare-eye sunset before true dark.",
    relatedProtocolIds: [
      "sunset-viewing",
      "blue-light-hygiene",
      "red-nir-light",
      "dark-bedroom",
    ],
    sections: [
      {
        heading: "Sunset closes the outdoor light arc",
        body: "Morning light advances and anchors the circadian day; sunset closes the outdoor arc before true dark. The solar spectrum shifts toward longer wavelengths as the sun lowers—more red and near-infrared relative to blue. Melanopsin-containing retinal ganglion cells are less driven by that warm, lower-intensity evening light than by noon blue sky, which is part of why evening outdoor viewing feels calmer than a laptop screen. Chronobiology research emphasizes consistent light–dark structure: bright day, dim warm evening, dark night. Sunset viewing is the last natural outdoor photon dose—signaling “day is ending” to clocks that never read wall-clock time.",
      },
      {
        heading: "Melatonin timing and evening screens",
        body: "Melatonin onset is delayed by evening blue-enriched artificial light. Watching the actual sun go down with bare eyes (no sunglasses in that window) gives a natural, low-blue outdoor signal before you move indoors. It pairs with “Evening blue-light hygiene”: sunset outdoors first, then dim warm bulbs and screens down. Skipping sunset and jumping from indoor LEDs to bed fights the gradient your SCN expects. You do not need a horizon disk at sunset the way sunrise keystone tiers work—being outside as the sky dims is the habit this app logs.",
      },
      {
        heading: "Red / near-IR and the wind-down spectrum",
        body: "Twilight and sunset carry more red and near-infrared energy than midday zenith light. Lifestyle communities discuss that band for evening relaxation and skin exposure without mid-day UV burn risk—distinct from therapeutic red-light panels but overlapping in spectrum conversation. The catalog activity “Red / near-IR light” can include natural dusk exposure. Sunset is the free, place-timed version tied to your ZIP’s ↓ time on the Today place strip.",
      },
      {
        heading: "Practical sunset habit",
        body: "Be outside 10–20 minutes bracketing local sunset when weather allows—patio, yard, walk, or west-facing view. Bare eyes; avoid sunglasses for this window unless glare forces them. Afterward, dim indoor lighting rather than snapping back to bright kitchen LEDs. Log “Watch the sunset” in the sunset slot only (locked to that phase in the catalog). Reminders can preset “30 min before sunset” or “At sunset” from your ZIP sun times. Cloudy days still count: open-sky dimming trains timing even without a visible solar disk.",
      },
      {
        heading: "Stacking with night Light habits",
        body: "Sunset viewing is not a substitute for true dark sleep—it hands off to “Evening blue-light hygiene” and “True dark sleep environment” (see Mitoversity lessons on dark bedroom and cool room). Think dawn → day outdoor light → sunset → dim evening → pitch black. Magnetism habits like sunset grounding were removed from the catalog; barefoot earth can still happen in the same outdoor window if you choose, but the Light keystone here is eyes to the evening sky.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public material treats sunset as circadian bookend to sunrise—outdoor natural light at both transitions, with evening emphasis on blocking artificial blue after the solar signal ends. He discusses UV-A exhaustion at sunset at latitude and coupling sunset timing to melatonin and mitochondrial repair at night. Stronger claims about mandatory horizon viewing or exact minute counts are his lifestyle prescriptions; mainstream sleep medicine agrees on dim evenings and consistent timing without requiring a ritual disk sighting.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Watch the sunset” when you viewed sunset light outdoors with bare eyes. It earns Light-category points and appears in suggested-now during the sunset phase on your checklist. Pair with sunrise keystones for a full Light day. Read “Why morning outdoor light—and sunrise—matter” and “Fully dark sleep environment” for the full Light pillar arc. Educational only—not medical advice.",
      },
    ],
  },
  {
    id: "solar-noon-vitamin-d",
    title: "Solar noon sun for vitamin D (not pills first)",
    pillar: "light",
    summary:
      "Why UVB at solar noon on skin is the natural vitamin D pathway, how it differs from morning eye light, and why this stack prefers sun over routine supplementation when latitude and season allow.",
    relatedProtocolIds: [
      "midday-sun-skin",
      "morning-natural-light",
      "sunrise-horizon",
    ],
    sections: [
      {
        heading: "Two different jobs: eyes at dawn, skin at noon",
        body: "Morning outdoor light to the eyes trains circadian clocks—that is the sunrise keystone story. Vitamin D is a separate solar product: UVB photons hitting skin convert 7-dehydrocholesterol to previtamin D₃ and then cholecalciferol (vitamin D₃), which is further processed in liver and kidney to active hormone. Eyes do not make meaningful vitamin D; skin does, with dose set by UVB intensity, skin area exposed, duration, and your melanin. In this app’s Light pillar, log morning light and midday skin as complementary habits, not interchangeable.",
      },
      {
        heading: "Why solar noon matters",
        body: "When the sun is highest, more UVB penetrates the atmosphere than at low solar angles—local solar noon (shown on Place when you have a ZIP) is the practical window for efficient D synthesis per minute of exposure, seasonal latitude permitting. Mid-morning and late afternoon deliver more UVA relative to UVB for the same “nice day” feeling. That does not mean burn yourself at noon: it means if your season and latitude allow safe skin UV, prioritize a short outdoor block near solar noon over random indoor time. High latitude winters may not provide enough UVB for repletion—see the supplement section honestly.",
      },
      {
        heading: "Mainstream vitamin D physiology",
        body: "Dermatology and endocrinology agree: sensible sun exposure contributes to vitamin D status; deficiency is common indoors and at high latitude. Oral vitamin D₃ supplements reliably raise blood 25(OH)D and are standard care when labs show deficiency, in winter, or when sun is impractical. Synthesis and supplementation both work—they are not enemies in clinical medicine. Responsible sun hygiene means non-burning exposure: start short, expose arms/legs or more when appropriate, and respect skin type, medications, and history of skin cancer—see a clinician for labs and dermatology advice.",
      },
      {
        heading: "Why some lifestyle frameworks de-prioritize daily pills",
        body: "A debated layer—not consensus—is whether chronic high-dose oral vitamin D without concurrent UV signaling blunts skin synthesis via feedback on enzymes like 7-dehydrocholesterol pathways or gives a “false sufficiency” while missing other solar effects (nitric oxide, POMC peptides, circadian coupling). Some studies note reduced cutaneous production after supplementation; others focus on safety of supplements. Kruse-community teaching often says: get D from structured outdoor UV when possible; reserve pills for documented deficiency or impossible seasons, not as a substitute for never going outside. This app echoes that preference as lifestyle design, not as instruction to stop prescribed treatment.",
      },
      {
        heading: "Practical solar noon habit",
        body: "Check solar noon on Place. When UV season allows (latitude band and season coach lines on Today hint at this), get outdoors with unprotected skin on arms, legs, or torso for a non-burning interval—often quoted in popular guides as roughly 10–20 minutes for lighter skin types at mid-latitudes in summer, shorter at high noon in strong sun or for darker melanin (which needs longer but tolerates more). Build gradually. Glass blocks UVB; windows do not count. Log “Pure / midday sun on skin” with duration; points scale from the 15-minute reference up to the cap. Pair with morning light keystones so the full Light arc is eyes + skin, not pills alone.",
      },
      {
        heading: "When supplements still belong",
        body: "Winter at high latitude, night-shift life, malabsorption, osteoporosis treatment plans, or confirmed low 25(OH)D on labs are legitimate supplement contexts—follow your clinician. The lifestyle argument is ordering: default to solar noon skin when UV exists; do not use a daily gummy to excuse zero outdoor UV all summer. Re-test labs if you change sun habits or doses. Seafood and fortified foods add dietary D but do not replace the UVB message for skin synthesis.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public work strongly ranks full-spectrum solar UV at the right time of day over routine vitamin D capsules, tying skin photoproduction to mitochondrial signaling, sulfated vitamin D chemistry in his essays, and latitude/season place rules. He has argued oral vitamin D can short-circuit natural production and miss solar frequencies the pill does not carry. Those mechanistic and anti-supplement-default claims are his teaching layer—stronger than standard endocrinology’s “sun plus supplement when needed.” Treat them as framework, not a reason to ignore deficiency or medical prescriptions.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Pure / midday sun on skin” near solar noon when season and latitude allow safe UV. Use morning light keystones separately for circadian boost. Read “Why morning outdoor light—and sunrise—matter” and Place’s solar noon line for timing. Mitoversity does not track 25(OH)D labs. Educational only—not medical advice; do not stop prescribed vitamin D without your doctor.",
      },
    ],
  },
  {
    id: "earth-field-vs-geology",
    title: "Earth’s magnetic field, crustal geology, and artificial EM",
    pillar: "magnetism",
    summary:
      "Three different “magnetism” ideas: planetary main field models, crustal/volcanic place context, and human infrastructure—kept separate on purpose.",
    relatedProtocolIds: [
      "barefoot-earth",
      "magnetic-awareness",
      "reduce-nnemf-block",
    ],
    sections: [
      {
        heading: "Main field (what Place may show as µT / dip)",
        body: "The World Magnetic Model (WMM) and related models (e.g. services used by NOAA and the British Geological Survey) estimate Earth’s core-dominated magnetic field at a latitude, longitude, and elevation. Typical surface total intensity is on the order of tens of microtesla; inclination (dip) increases toward the poles; declination is the offset between magnetic and true north. These quantities change slowly (secular variation). They are geophysical estimates, not a reading of your body or of Wi‑Fi.",
      },
      {
        heading: "Crustal anomalies vs smooth models",
        body: "Finer models and grids (e.g. Enhanced Magnetic Model / EMAG-type products) add shorter-wavelength crustal magnetic anomalies from rock magnetization. Resolution is still regional (tens of kilometers class), not house-by-house. That is true solid-Earth science used in geology and navigation error budgets—not a health meter.",
      },
      {
        heading: "Geology score in this app (volcano / magma proximity)",
        body: "Separately, the app scores “geological vitality” as distance to Holocene volcanic and magma-system anchors (Smithsonian Global Volcanism Program–derived catalogs and USGS lists). That is a transparent lifestyle proxy for living crustal systems—not the same number as total field F from WMM, and not a volcanic hazard product.",
      },
      {
        heading: "Artificial EM infrastructure",
        body: "Cell sites, masts, power plants, and dense urban electronics create non-native electromagnetic environments. They do not appear in WMM. This app’s artificial EM load score is an open-map proxy (e.g. OpenCelliD when available, OpenStreetMap masts and plants)—useful for “how built-up is the RF/power landscape,” not a personal V/m or µW/m² measurement at your pillow.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public work often binds latitude, geomagnetic environment, geology, and non-native EMF into one mitochondrial place story, and invokes broader themes (including space-weather / Van Allen–related narratives in popular teaching) as context for where humans live. Those integrated lifestyle conclusions and prescriptions are his. The app deliberately separates layers—main field model, magma proximity, infrastructure proxy, daily habits—so users can see data sources without treating them as one medical score.",
      },
    ],
  },
  {
    id: "deuterium-atp-synthase",
    title: "Deuterium, mitochondrial water, and ATP synthase",
    pillar: "water",
    summary:
      "Mainstream mitochondrial bioenergetics plus the lifestyle debate on deuterium (heavy hydrogen) load—citing Kruse where his ATP-synthase story is specific.",
    relatedProtocolIds: [
      "low-d-hydration",
      "deuterium-aware-meal",
      "mineralized-water",
      "seafood-meal",
      "hydration-timing",
    ],
    sections: [
      {
        heading: "What deuterium is",
        body: "Hydrogen’s common form is protium. Deuterium is a stable heavier isotope (one proton + one neutron). Natural water and organic molecules always contain some deuterium; the fraction varies with geography, altitude, and food webs. Chemists know deuterium can slow certain proton-transfer and hydrogen-bond dynamics relative to protium (kinetic isotope effects). That chemistry is established; how much it matters in everyday human diets is an active and contested area.",
      },
      {
        heading: "ATP synthase in standard bioenergetics",
        body: "In mitochondria, the electron transport chain builds a proton gradient across the inner membrane. ATP synthase is the rotary enzyme that lets protons return and couples that flow to ATP synthesis from ADP and phosphate. Textbooks describe this proton-motive force and rotary catalysis in detail. Mitochondrial water and proton pathways are real structural and chemical topics in biophysics research—independent of any single lifestyle author.",
      },
      {
        heading: "Isotope effects and “heavy” water (research context)",
        body: "High concentrations of heavy water (D₂O) are toxic and disrupt biology in experimental settings; that does not mean ordinary variation in environmental deuterium equals the same effect. Researchers have studied deuterium depletion and isotope ratios in specialized contexts (including some oncology and metabolic hypotheses). Evidence quality and practical relevance for healthy people remain debated. Responsible communication separates: (1) isotope chemistry is real; (2) clinical “deuterium depletion protocols” as disease treatment are not established standard of care.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Dr. Kruse’s public teaching popularizes a strong lifestyle narrative: environmental and dietary deuterium as “grit” in mitochondrial water and in the proton circuits of ATP synthase, such that lowering body deuterium load over time is framed as supporting cleaner ATP production. He ties that water story tightly to light timing and magnetism/place (light–water–magnetism). Those mechanistic lifestyle claims and the exact food/water prescriptions are his synthesis and should be read as such—not as a measured D/H ratio from this app, and not as a substitute for clinical nutrition or medicine.",
      },
      {
        heading: "Practical habits this app tracks",
        body: "Water-related keystones (e.g. mineralized or “low-D–aware” morning hydration, deuterium-aware meal patterns, seafood-forward meals, daylight-aligned hydration) are behavioral checkboxes. They encourage attention to water and food quality within a mitochondrial lifestyle stack. They do not prove your cellular deuterium fraction changed.",
      },
    ],
  },
  {
    id: "carbonated-water-co2",
    title: "Carbonated water and CO₂",
    pillar: "water",
    summary:
      "Carbon dioxide in drinks and metabolism: Bohr effect, acid–base balance, and where Kruse’s sparkling-water lifestyle advice sits on top of that physiology.",
    relatedProtocolIds: [
      "carbonated-water",
      "mineralized-water",
      "low-d-hydration",
      "hydration-timing",
    ],
    sections: [
      {
        heading: "CO₂ is not only a waste gas",
        body: "Cells produce carbon dioxide as a normal end product of aerobic metabolism. In blood, CO₂ is carried largely as bicarbonate and dissolved gas, and it participates in acid–base balance via the carbonic anhydrase reaction (CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻). Far from being only “pollution” to blow off, CO₂ is a regulated physiological signal. Very low CO₂ (as in chronic over-breathing in some contexts) can shift oxygen unloading and vascular tone; clinicians already use CO₂-related blood gases in critical care. That baseline physiology is standard medical science.",
      },
      {
        heading: "The Bohr effect: CO₂, pH, and oxygen delivery",
        body: "Hemoglobin’s affinity for oxygen falls when CO₂ rises and pH falls in active tissues (Bohr effect), which helps unload oxygen where metabolism is high. Conversely, high oxygen and low CO₂ in the lungs favor loading. This is textbook cardiorespiratory physiology. It explains why tissue CO₂/pH and oxygen delivery are coupled—and why “more oxygen always” is an incomplete slogan without context for CO₂ and blood flow.",
      },
      {
        heading: "What carbonating water actually does",
        body: "Dissolving CO₂ under pressure makes carbonic acid; the drink is mildly acidic and releases CO₂ gas when opened. Ingested sparkling water can produce transient sensations (fullness, burping) and small, short-lived changes in gastric and systemic acid–base handling as CO₂ is absorbed or expelled. Evidence on long-term metabolic outcomes of sparkling vs still water is mixed and modest; hydration still depends mainly on fluid volume and minerals, not bubbles alone. Natural mineral waters that are both carbonated and mineral-rich differ from plain seltzer in electrolyte content.",
      },
      {
        heading: "Research angles people often cite",
        body: "Some studies explore sparkling water and satiety, gastric emptying, or preference (people may drink more if they like the taste). Others examine mineral waters (magnesium, bicarbonate springs) for digestive comfort. None of that requires a mitochondrial brand name—and none replaces sleep, light, or diet quality. Practical upside for many people is simply: an appealing way to hydrate, sometimes with useful minerals if the source is mineral water rather than flavored soda.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "In Kruse’s public light–water–magnetism framework, CO₂ is framed as a beneficial mitochondrial and oxygen-delivery ally rather than a pure waste product to minimize. He has promoted carbonated (often mineral) water as a lifestyle tool to raise CO₂ exposure in the water you drink, linking that idea to Bohr-type oxygen delivery, redox, and the broader water story (including how water and light timing interact). Those strong causal lifestyle claims—that sparkling water meaningfully optimizes ATP/oxygen economics the way his essays describe—are his teaching layer. They go beyond the cautious clinical reading of Bohr physiology and should be treated as framework, not as a measured blood-gas prescription from this app.",
      },
      {
        heading: "How this fits the app’s water habits",
        body: "Log the catalog activity “Carbonated / sparkling water” when you drink unsweetened sparkling or carbonated mineral water. It sits under the Water pillar alongside mineralized hydration: prioritize clean source and minerals, then bubbles as an optional CO₂-rich form. Prefer unsweetened sparkling or natural mineral water over sugary sodas.",
      },
    ],
  },
  {
    id: "magnetico-sleep-pad",
    title: "Magnetic sleep systems (Magnetico & dual-polar pads)",
    pillar: "magnetism",
    summary:
      "Why sleep-time magnetism is discussed, how Magnetico’s under-mattress unidirectional design differs from dual-polar / top-of-bed pads, and where Kruse’s advice is specific.",
    relatedProtocolIds: [
      "magnetico-sleep-pad",
      "phone-away-sleep",
      "dark-bedroom",
      "magnetic-awareness",
    ],
    sections: [
      {
        heading: "Magnetism and the body (two natural sources)",
        body: "Living cells are electromagnetic in character: charge separation, membrane potentials, and ion currents are core biology. Commercial education from Magnetico (magneticosleep.com) frames two natural magnetic sources available during life: (1) the brain—astrocyte cells (a large fraction of brain glia) generate pulsed electromagnetic activity; (2) the Earth—a largely steady geomagnetic field that, in their model, supports molecular and restorative chemistry. During sleep, their biomagnetic theory holds that brain-generated pulsed frequencies and the Earth’s steady field can work together in “magnetic resonance”—periods (often described as ~90–100 minute cycles while sleeping) when brain output matches tissue/organ frequencies, which they claim enhances repair chemistry, enzyme work, and immune readiness. That framing is product-side biomagnetic theory, not a measured clinical protocol in this app—but it explains why sleep is the window they target for whole-body magnetic supplementation.",
      },
      {
        heading: "Why supplement Earth’s field at all?",
        body: "Magnetico’s About Magnetism and Magnetism & Your Body pages argue two pressures against natural resonance: (1) long-term decline of Earth’s field strength—historically discussed from ~5 gauss-class estimates millennia ago down toward ~0.5 gauss (~50 µT) order today (they cite figures in the 70–90% loss range over ~4,000 years; independent geomagnetism agrees the field has varied and has weakened over recent centuries, while exact ancient multiplications are model-dependent); (2) modern artificial EMFs that can be stronger or higher-frequency than the brain’s restorative band and may interfere with quiet night recovery. Separately, Dr. Kyoichi Nakagawa (1950s onward) coined “magnetic field deficiency syndrome” and linked low ambient field exposure to aches and fatigue; Magnetico notes his patients often improved for roughly three weeks then plateaued—attributed by later bipolar analysis to not distinguishing north vs south pole effects. Mainstream sleep science still puts darkness, schedule, temperature, and low night light/noise first; magnetic pads are an optional environmental layer on top of that baseline.",
      },
      {
        heading: "Biomagnetic theory: direction matters (N vs S hemisphere)",
        body: "In Magnetico’s atomic story, raising field strength changes electron/proton velocity and valence-electron sharing depending on field direction; correct orientation is said to raise energy state and catalyze chemistry (including detoxification claims from their clinical observations). Critically, Earth’s field passes through the body in one direction: northern hemisphere surface field is treated as negative (−); southern hemisphere as positive (+). Most cell division and growth-hormone-rich recovery is described as concentrated in the first hours of sleep, so valence orientation of new cells would, in this model, track the polarity you sleep in. For North America / northern hemisphere, their requirement is a pure negative field that fully passes through the body—complementing local Earth polarity—not a patchwork of both poles. Southern-hemisphere users need the matching Earth-aligned polarity for that region. Field strength at the body must still be high enough after mattress spacing to matter; that is why magnet count and strength (Classic ~5 G, Core ~10 G, Super ~20 G class products on their site) are part of their design story.",
      },
      {
        heading: "The bi-polar problem: dual-polar & top-of-bed pads",
        body: "Any permanent magnet has both poles. Magnetico’s Bi-Polar Theory page argues that pads used on top of the mattress expose the sleeper to alternating negative (−) and return positive (+) fields around each magnet. Even “all north / negative face up” layouts still produce positive spikes between magnets when the pad is close to the body. That dual exposure is framed as an emergency-type stimulus: the brain and circulation respond (more EM drive and blood flow to the stimulated region)—similar in spirit to short-term magnetic or electroacupuncture responses (they cite work such as Dr. Saul Liss showing serotonin, beta-endorphin, and ACTH shifts with magnet-on-point stimulation). Initial relief can feel strong, but over weeks the model says vitality reserves deplete; many dual-polar brands advise 2–4 week breaks so people do not become fatigued. Bottom line of their critique: bi-polar and top-of-bed “negative-only” marketing still deliver mixed polarity at the body surface.",
      },
      {
        heading: "Why Magnetico claims superiority over dual-polar pads",
        body: "Magnetico’s design (Dr. Dean Bonlie lineage) places the pad under the mattress—between box spring and mattress, or over any non-magnetic spacer ≥ about 4 inches—not on top of the bed. At that distance, unwanted positive return spikes fall off so the field through the sleeper is described as pure unidirectional negative (northern hemisphere), closer to an Earth-type steady field than a checkerboard of +/−. Competitors that copy “all magnets negative-up” but still instruct top-of-bed use keep those positive spikes; if those same thin pads are moved under a thick mattress without enough magnet density, the usable field through the body collapses. Magnetico’s counter is denser / stronger magnet arrays so a meaningful field still penetrates after the 4″+ spacer—Classic, Core (+ optional Booster), and Super Sleep System (~5 / 10 / 20 gauss class marketing levels). Their “dare to compare” list: no unnatural alternating +/− whole-night exposure; field strong enough after under-mattress placement; long product history and satisfaction policy. Treat these as manufacturer claims about field geometry and use-case, not FDA-cleared medical outcomes. Practically: dual-polar top pads ≈ short-term stimulus + mixed polarity; Magnetico under-mattress ≈ continuous Earth-like unidirectional supplementation through the body.",
      },
      {
        heading: "Sleep hygiene still comes first",
        body: "Night is when circadian systems expect darkness and relative quiet. True dark, phone away from the head, cool room, and stable schedule support recovery with or without magnetic accessories. A pad does not replace outdoor light by day or darkness by night. Artificial RF/EMF in the bedroom (phones, routers) is a separate problem from static DC magnet arrays—reduce nnEMF and use magnetic sleep gear as independent levers if you use both.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "In Kruse’s public light–water–magnetism framework, sleep is when mitochondrial and redox recovery should not be fought by non-native EMFs, while beneficial magnetic context (Earth-oriented and engineered static fields) is part of place and night environment. He and communities around his work have specifically pointed to Magnetico-type under-mattress unidirectional systems—not generic dual-polar mattress toppers—as the sleep magnetic tool that matches their geomagnetic-supplementation story. Those product-level prescriptions and strong overnight mitochondrial claims are his teaching layer: not a measurement this app performs, and not a proven medical therapy.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Magnetico sleep pad” when you slept the night on a Magnetico (or equivalent under-mattress unidirectional DC system). It counts toward the Magnetism pillar. Install per manufacturer guidance: under mattress / ≥4″ spacer, correct hemisphere polarity. Pair with phone-away-from-bed and a dark bedroom. Equipment is required—if you do not own a pad, leave it off your available list and use grounding / low-field outdoor hours instead.",
      },
    ],
  },
  {
    id: "mastic-gum-chewing",
    title: "Chewing mastic gum",
    pillar: "support",
    summary:
      "What Chios mastic resin is, how intentional chewing differs from soft modern diets and candy gum, oral-research angles, and how this app logs the habit.",
    relatedProtocolIds: [
      "mastic-gum",
      "morning-movement",
      "seafood-meal",
      "early-dinner",
    ],
    sections: [
      {
        heading: "What mastic gum actually is",
        body: "Mastic (often labeled Chios mastic) is the dried resin (tears) of the evergreen shrub Pistacia lentiscus, traditionally harvested on the Greek island of Chios. You chew the raw resin or commercial “mastic gum” pieces made from it—not bubble gum with synthetic rubber and sweeteners. Authentic mastic starts hard, softens with saliva and heat, stays firm for a long chew, and has a piney, slightly bitter aromatic flavor. That firmness is the practical point for many users: it demands more sustained jaw work than soft commercial gum. Quality products list mastic resin (Pistacia lentiscus) as the base; cheap “mastic-flavored” candy gums are not the same material.",
      },
      {
        heading: "Mastication load in a soft-food world",
        body: "Human jaws and chewing muscles evolved under diets that required long, forceful mastication (tough plants, unprocessed meat, fibrous foods). Modern ultra-processed soft diets shorten chewing time and lower peak bite force for many people. Exercise physiology is straightforward: underused skeletal muscle deconditions; jaw elevators (masseter, temporalis, medial pterygoid) are still skeletal muscle. Intentional hard chewing is one voluntary way to load those muscles—similar in spirit to resistance training, not magic. Orthodontic and anthropological literature has long discussed diet consistency, jaw growth in children, and adult muscle tone; adult facial “bone change” claims from gum alone are often overstated. Realistic expectations: better awareness of jaw use, possible endurance/tone of chewing muscles with progressive practice, and a structured alternative to mindless snacking—not overnight bone remodeling.",
      },
      {
        heading: "Why people choose mastic over candy gum",
        body: "Sugar-free commercial gums can still be ultra-soft, heavily flavored, and easy to chew for hours with little resistance. Mastic’s higher chew resistance makes short sessions (often 10–20 minutes) feel like work. It also lacks the sugar alcohols some people prefer to avoid in bulk. Lifestyle communities treat a daily mastic session as a discrete “jaw workout” plus an oral ritual that replaces grazing. That is behavioral design more than pharmacology: same principle as putting shoes by the door for a walk—make the healthy default obvious and slightly effortful.",
      },
      {
        heading: "Oral and GI research angles (not medical claims)",
        body: "Mastic resin has been studied for antimicrobial and oral-ecology properties (including work on plaque-related bacteria and traditional use for digestive comfort). Some clinical and lab studies explore mastic extracts or chewing gum formulations for gingival markers or Helicobacter-related hypotheses; results vary by preparation, dose, and study quality. None of that turns recreational chewing into a treatment for gum disease, ulcers, or infection—see a clinician for diagnosis. Separately, chewing any gum can increase saliva flow (helpful for oral clearance after meals) and can be a habit cue for nasal breathing if you keep the mouth mostly closed while chewing. Swallow air and open-mouth chewing are common technique mistakes.",
      },
      {
        heading: "How to chew without wrecking your TMJ",
        body: "Start short (5–10 minutes) if you are new to hard resin. Chew evenly on both sides; do not clamp only on one molar or “max effort” every second. Stop if you get joint clicking with pain, ear pain, headaches that track with sessions, or tooth sensitivity—TMJ disorders and cracked restorations are real risks with aggressive hard chewing. People with braces, recent dental work, active jaw pain, or night grinding should clear hard mastic with their dentist or skip it. Children need age-appropriate products and supervision (choking risk with hard pieces). Progressive load beats hero sessions: consistency at moderate effort outperforms occasional marathon chews.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public material emphasizes real-food mastication, facial and airway development context, and rejecting soft processed diets as part of a broader light–water–magnetism and ancestral-input stack—not a single “gum protocol.” Hard chewing and jaw use show up in that lifestyle conversation as one way to restore mechanical signals modern food removed. Product-level enthusiasm for Chios mastic gum is common in communities that follow his work and related biohacking spaces; treat brand-level prescriptions and extreme facial-change claims as community culture layered on top of ordinary muscle-use and oral-hygiene ideas. This app does not measure bite force or craniofacial growth.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Mastic gum chewing” when you complete a session of real mastic resin/gum (not candy gum). It sits under Support via the movement category—jaw work as a small physical practice. Duration logging is enabled so longer sessions can scale points within the cap. Equipment is required: if you do not own mastic, leave the habit off your available list. Pair with real meals that still require chewing (e.g. seafood-forward, less ultra-processed food) rather than using gum as the only mechanical load in the day.",
      },
    ],
  },
  {
    id: "true-dark-bedroom",
    title: "Fully dark sleep environment",
    pillar: "light",
    summary:
      "Why pitch-black nights are a Light-pillar habit—melanopsin, melatonin, and blocking nnEMF glow so darkness matches what your clock expects after sunset.",
    relatedProtocolIds: [
      "dark-bedroom",
      "blue-light-hygiene",
      "phone-away-sleep",
      "consistent-sleep-window",
    ],
    sections: [
      {
        heading: "Darkness is the other half of the light story",
        body: "The Light pillar is not only sunrise and outdoor day spectrum—it is also denying wrong light at night. Circadian biology trains on contrast: bright, blue-rich outdoor day versus dim, warm evening versus true dark during sleep. The suprachiasmatic nucleus and peripheral clocks anticipate that arc. When street glow, charger LEDs, or a phone screen keeps melanopsin-active signals after sunset, melatonin suppression and sleep fragmentation follow in controlled studies. Sleep medicine ranks a dark bedroom with morning light and stable timing as baseline hygiene. In this app, darkness is categorized under Light because you are managing photons, not just “sleep” in the abstract.",
      },
      {
        heading: "What “fully dark” actually means",
        body: "Fully dark is not “I closed my eyes.” It means the room stays dark if you open them: no street glow through curtains, no TV standby LEDs, no charger indicators, no bright clock faces. Researchers discuss bedroom illuminance in lux; even low single-digit lux can matter for sensitive people during brief awakenings. Practical targets: blackout curtains or shades, tape or cover status LEDs, phone in another room or far from the bed on airplane mode, and an eye mask when travel or partners make perfect blackout impossible. Log “True dark sleep environment” when you hit that standard—it is a behavioral check, not a lux reading from this app.",
      },
      {
        heading: "Melatonin, cortisol, and sleep depth",
        body: "Melatonin rises in dim evening light and is blunted by blue-enriched screens or bright room light. Cortisol should fall through the evening and stay low in the first half of the night. Light leaks wobble that choreography—lighter sleep and less deep-stage time in some polysomnography work. Pair bedroom darkness with “Evening blue-light hygiene” so you are not fighting an hour of phone brightness before you expect pitch black. Deep sleep is when glymphatic clearance and growth-hormone pulses concentrate; light at night degrades that window independently of room temperature.",
      },
      {
        heading: "nnEMF glow counts as light pollution",
        body: "Standby LEDs and charging indicators are tiny light sources inches from the bed; routers and TVs add RF and optical noise. “Phone away from bed” is both Magnetism (nnEMF) and Light (no midnight screen photons). Kill visible emitters you do not need; cover the rest. If you must have a device in the room, airplane mode, lowest brightness, and physical distance reduce dose. Darkness and low artificial field stack together in Kruse-style night protocols.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse stresses true darkness—not dim—plus removing routers and phones from the sleeping space as non-negotiable for mitochondrial recovery. He treats bedroom light as actively harmful nnEMF-adjacent stress, tighter than generic sleep-hygiene leaflets. Those prescriptions sit in his light–water–magnetism night stack alongside cold room temperature (see the separate cool-sleep lesson). Mainstream chronobiology already agrees on dark sleep; Kruse adds stronger redox and nnEMF coupling.",
      },
      {
        heading: "How this fits the app",
        body: "Log “True dark sleep environment” for pitch black or effective eye mask nights. Log “Evening blue-light hygiene” and “Phone away from bed” as upstream Light and Magnetism habits. Log “Circadian sleep window” for consistent bed/wake timing. Read “Why morning outdoor light—and sunrise—matter” and “Why watching the sunset matters” for the day arc. Educational only—not medical advice for insomnia or sleep apnea.",
      },
    ],
  },
  {
    id: "cool-sleep-65",
    title: "Cool bedroom sleep (~65 °F)",
    pillar: "support",
    summary:
      "Thermoregulation at night: why a bedroom near 65 °F (18 °C) supports sleep onset, deep stages, and recovery—and how to tune it without over-chilling.",
    relatedProtocolIds: [
      "consistent-sleep-window",
      "dark-bedroom",
      "cold-thermogenesis",
    ],
    sections: [
      {
        heading: "Sleep onset needs a falling core temperature",
        body: "Circadian timing drives a drop in core body temperature before sleep. Heat leaves through hands, feet, and skin; vasodilation in extremities helps. A bedroom that is too warm forces your thermoregulatory system to work overtime—sweating, kicking off covers, restless legs. A cool room lets the gradient do its job. That is standard physiology, not fringe theory. Most people sleep worse during heat waves; your nervous system is reporting a setpoint mismatch.",
      },
      {
        heading: "Why ~65 °F (18 °C) keeps appearing in guidance",
        body: "Sleep literature often cites roughly 60–67 °F (15–19 °C) as supportive for onset and maintenance, with individual variation for age, bedding, and health. Sixty-five Fahrenheit (~18 °C) sits mid-band: cool enough to encourage the overnight temperature drop, warm enough that most adults under a light duvet are not shivering. Infants, older adults, and some medications call for warmer setpoints. Principle: cool, not cold—comfortable under covers. Fans, breathable linen, and a warm shower before a cool room are low-tech tools without precision HVAC.",
      },
      {
        heading: "Deep sleep, recovery, and heat stress",
        body: "Slow-wave sleep concentrates growth hormone release, autonomic recovery, and glymphatic clearance. Overheated rooms fragment sleep architecture in population data independent of light mistakes. Aligning cool temperature with a consistent sleep window protects that block. Daytime cold thermogenesis (plunges, cold showers) is a separate Support lever; night cool room is passive thermal hygiene. Pair both only if you tolerate them—cold plunge before bed can raise core temp briefly via rebound.",
      },
      {
        heading: "Tuning your room",
        body: "Start near 65 °F and adjust over a week: faster sleep onset and fewer wake-ups suggest you are close. Too cold → muscle tension and early waking; too warm → difficulty falling asleep. Season matters—winter may need less AC, summer may need more fan flow. Shared beds need compromise. Track alongside darkness (Light pillar lesson) and nnEMF habits; temperature does not fix light leaks.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse lists a cold sleep environment among non-negotiable night rules in his mitochondrial stack—often alongside true darkness and phone removal. He couples thermoregulation to leptin and seasonal light at latitude in forum material. Exact Fahrenheit targets in community practice vary; 65 °F is a mainstream-compatible anchor within his stricter environment design. Treat strong metabolic claims as his framework; treat cool room as widely supported sleep hygiene.",
      },
      {
        heading: "How this fits the app",
        body: "There is no separate thermostat checkbox—note cool-room success when you log “Circadian sleep window” or “True dark sleep environment” if both were met. Read “Fully dark sleep environment” (Light pillar) for the photon side of night. Use “Cold thermogenesis session” only for deliberate daytime cold exposure, not bedroom HVAC. Educational only; see a clinician for night sweats, fever, or insomnia unresponsive to basics.",
      },
    ],
  },
  {
    id: "rebounding-lymphatic",
    title: "Rebounding and the lymphatic system",
    pillar: "support",
    summary:
      "How lymph moves without a heart pump, why mini-trampoline bouncing is discussed for drainage, what research actually shows, and how to use rebounding if you own a rebounder.",
    relatedProtocolIds: ["morning-movement", "nature-contact"],
    sections: [
      {
        heading: "The lymphatic system has no central pump",
        body: "Blood circulation has the heart; lymph does not. Lymph is the fluid that collects between cells (interstitial fluid), enters thin-walled lymphatic capillaries, and travels through nodes that filter and immune-process it before returning to the bloodstream near the collarbones. Movement is essential: skeletal muscle contractions, breathing, and arterial pulsation all create pressure changes that push lymph through one-way valves in lymph vessels. When you sit still for long stretches, that passive pumping slows. Sedentary modern life is one reason lymphatic flow gets discussed as a lifestyle variable—separate from any single exercise fad.",
      },
      {
        heading: "What rebounding is",
        body: "Rebounding usually means rhythmic bouncing on a mini-trampoline (rebounder) with a flexible mat—often gentle, feet staying on the surface, knees slightly bent. It is low-impact compared with hard-surface running: the mat absorbs part of the deceleration. Sessions are often short (5–15 minutes), used as warm-up, cardio, or a movement break. Quality rebounders have stable frames and appropriate spring/bungee tension; cheap toy trampolines are not the same safety class. Because it requires equipment, this app treats rebounding as an optional “via” habit—you only log it if you actually own a rebounder and put it on your available list.",
      },
      {
        heading: "Why people link bouncing to lymph flow",
        body: "The popular argument is mechanical: each landing creates a brief gravitational load and release cycle through the body. Proponents say that rhythmic up-and-down acceleration/deceleration acts like an external pump—especially for lymph in the lower body and torso—more than steady walking on flat ground. Mainstream physiology agrees that muscle activity and pressure gradients move lymph; the debated part is whether rebounding is uniquely superior to other movements for that purpose. Walking, swimming, yoga, resistance training, and deep breathing all recruit the same general mechanisms (muscle pump, thoracic duct pressure changes during respiration). Rebounding may be an efficient, joint-friendly way to get repetitive vertical loading without a long workout—useful if you will actually do it.",
      },
      {
        heading: "What research does and does not show",
        body: "Exercise science has studied mini-trampoline training for balance, VO₂, bone-loading in some populations, and adherence in older adults—often with positive but modest results. Direct imaging of lymph flow during rebounding is sparse compared with clinical lymphatic medicine (manual lymphatic drainage, compression garments, complete decongestive therapy for lymphedema). Those clinical tools are evidence-based for specific diagnoses; recreational rebounding is not a substitute. For healthy people, the honest summary is: rebounding is real exercise that moves muscle and increases breathing rate; those facts alone support lymph transport physiologically. Claims that a few minutes on a rebounder “detoxes” quantified toxin loads or replaces medical lymphedema care overshoot the published literature.",
      },
      {
        heading: "Lymph nodes, immunity, and swelling context",
        body: "Lymph nodes are where much immune sampling happens. Slow lymph stasis can accompany prolonged immobility, some post-surgical states, and primary or secondary lymphedema—a medical condition needing diagnosis, not DIY trampoline protocols. If you have unexplained limb swelling, pain, redness, or a history of lymph-node surgery or radiation, see a clinician before aggressive bouncing. For otherwise healthy users, rebounding is better framed as daily movement that keeps the muscle-and-breath pump active than as a miracle drainage cure.",
      },
      {
        heading: "Practical rebounding habits",
        body: "Start low: 2–5 minutes of soft bounces, both feet down, posture tall, gaze forward. Build toward 10–15 minutes if joints tolerate it. Barefoot or minimal shoes on a stable rebounder can add light foot/ankle work; hold a doorway bar if balance is new. Morning outdoor rebounding stacks movement with daylight (pair with mitochondrial movement logged in the app); indoor sessions still count as movement. Stop if you feel dizzy, knee pain, or pelvic floor pressure that worries you—high-intensity bouncing is not required for lymph benefit; consistency beats intensity.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public writing and forum material often highlight rebounding as a mitochondrial lifestyle tool for lymphatic “waste” clearance and cellular water turnover—nested inside the wider light–water–magnetism stack (movement in daylight, cold, grounding, and reducing sedentary indoor time). He tends to prescribe short daily rebound sessions more strongly than generic “exercise more” advice and ties lymph flow to his water/deuterium and redox narratives. Those integrated claims and exact duration prescriptions are his framework layer. Mainstream medicine agrees sedentary behavior impairs normal fluid movement and that exercise helps; it does not universally endorse rebounding over other modalities.",
      },
      {
        heading: "How this fits the app",
        body: "There is no separate rebounder checkbox yet—log “Mitochondrial movement” when you complete a rebound session (duration logging scales points). Add rebounding only to your available list if you own equipment; otherwise skip it and use walking or outdoor movement. Mitoversity keeps this article for users who already rebound or are deciding whether to buy a rebounder. Educational only—not medical advice for lymphedema, edema, or post-operative care.",
      },
    ],
  },
  {
    id: "cold-thermogenesis-skin-50",
    title: "Cold thermogenesis: ~50 °F skin for 10+ minutes",
    pillar: "support",
    summary:
      "How deliberate cold plunging drives thermogenesis, why some protocols target ~50 °F skin surface for at least ten minutes, what physiology supports, and how to progress safely.",
    relatedProtocolIds: ["cold-thermogenesis", "cold-face-plunge"],
    sections: [
      {
        heading: "What cold thermogenesis means",
        body: "Cold thermogenesis is heat production triggered when the body loses heat faster than baseline metabolism replaces it. You are not trying to become hypothermic—you are briefly borrowing cold stress so mitochondria, brown fat, muscle shivering, and vascular responses ramp up output. Deliberate forms include cold showers, outdoor winter exposure, ice baths, and plunge tanks. Face-only cold (cheaper entry) still activates trigeminal and autonomic pathways but does not load the whole skin surface the way a plunge does. This article focuses on full-body cold plunging where skin temperature—not just water temperature—is the feedback variable.",
      },
      {
        heading: "Skin temperature vs core temperature vs water temperature",
        body: "Core (deep body) temperature is tightly defended near ~98.6 °F (37 °C). Skin temperature is far more variable: warm indoors it may sit in the high 80s–90s °F; in cold water it can fall quickly. Water temperature is only the environment—the number that matters for adaptation signaling is what your skin surface actually reaches and how long it stays there. A 55 °F plunge can pull skin toward 50 °F or below at the shoulders and thighs if circulation shunts blood inward; a windy 40 °F air exposure might do less. Never confuse “the tub read 50 °F” with “my skin held 50 °F for ten minutes” unless you measure or use consistent protocol conditions.",
      },
      {
        heading: "The ~50 °F skin × 10 minute goal",
        body: "In advanced cold-lifestyle teaching—especially in Dr. Jack Kruse’s leptin-reset and cold-thermogenesis material—a recurring prescription is to get skin surface temperature down to about 50 °F (10 °C) and sustain that state for at least ten continuous minutes, not a few seconds of gasping and exit. The logic is duration at a sufficient thermal gradient: long enough for brown adipose tissue recruitment, mitochondrial uncoupling signaling, and autonomic conditioning to matter, without the session dissolving into a short shock with no steady phase. This app treats that pair—~50 °F skin, ≥10 minutes—as an aspirational training target for experienced users, not day-one advice. Beginners should build weeks of shorter, warmer exposures first.",
      },
      {
        heading: "Physiology mainstream science agrees on",
        body: "Cold exposure activates sympathetic nerves, vasoconstriction, and then shivering or non-shivering thermogenesis. Brown adipose tissue (BAT) burns fuel for heat and is recruitable in adults with repeated cold. Cold shock proteins (e.g. RBM3, CIRP in animal and cell models) rise with temperature drops and are studied for stress resilience—not yet “take a plunge, cure disease” in humans. Metabolic rate rises during cold; insulin sensitivity and appetite hormones can shift in short-term studies. Cardiovascular strain is real: cold plunge causes abrupt peripheral resistance and heart-rate changes, which is why unsupervised extreme cold is discouraged for unstable heart disease, uncontrolled hypertension, pregnancy, and some arrhythmias.",
      },
      {
        heading: "Working toward ten minutes at ~50 °F skin",
        body: "Progress in stages: (1) Weeks 1–2: 30–90 second cold shower finishes or face immersion; log “Cold face / head immersion” if that is your entry. (2) Weeks 3–6: plunge 2–5 minutes in ~60–65 °F water; exit before panic breathing dominates the whole session. (3) Intermediate: lower water toward 55 °F and extend toward 5–8 minutes with calm nasal breathing and relaxed shoulders. (4) Target phase: water cold enough (often high 40s–low 50s °F depending on body fat, movement, and tub heat loss) that measured or estimated skin at trunk/limbs hovers near 50 °F while you remain composed for 10+ minutes. Use a simple infrared skin thermometer on dry skin immediately before re-warming if you want objective feedback. Shivering late in the session is common; violent early shivering means you entered too fast or too cold.",
      },
      {
        heading: "Safety and stop rules",
        body: "Never plunge alone if you are pushing duration limits. Watch for numb hands, confused speech, chest pain, or the urge to curl into a ball and stop moving—signs to exit and warm gradually (dry clothes, movement, warm drink; not scalding hot shower shock). Fingers and toes can be much colder than chest skin; the 50 °F target refers to representative limb/trunk skin sites, not frostbitten extremities. Hypothyroidism, Raynaud’s, asthma triggered by cold air, open wounds, and post-concussion protocols need clinician clearance. Women may cycle cold tolerance across the month; menopause shifts it too. Cold is hormesis, not martyrdom.",
      },
      {
        heading: "Stacking with light, water, and magnetism",
        body: "In this app’s mitochondrial lifestyle frame, cold works best as a support lever after morning light and on days you are fed and hydrated—not as a substitute for sleep or sunrise. Outdoor winter plunges or post-sauna cold add magnetism/place context (earth temperature, season). Pair rewarming with mineralized hydration and a real meal window rather than immediately slamming caffeine and screens. Logging cold on the same day as nnEMF reduction and dark sleep closes the recovery loop cold stress assumes you will honor at night.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public cold protocols are stricter than generic “cold showers are healthy.” He ties cold thermogenesis to leptin sensitivity, seasonal light at latitude, seafood/DHA intake, and mitochondrial matrix water chemistry—often prescribing longer, colder, skin-temperature-aware sessions than wellness influencers recommend. The ~50 °F skin for ten minutes framing, timing relative to meals and light, and claims about cold rewriting redox in obesity-resistant ways are his integrated stack. Mainstream medicine endorses graded cold exposure cautiously; it does not universally endorse ten-minute 50 °F-skin plunges for everyone.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Cold thermogenesis session” with duration when you complete a plunge, cold shower block, or deliberate full-body cold exposure. Duration logging scales points from a 5-minute reference up to the 20-minute cap—ten minutes at goal intensity lands at roughly double the base reference. Use “Cold face / head immersion” for partial entry work on non-plunge days. Put cold habits on your available list only if you have safe access (plunge, lake, shower). This article’s 50 °F × 10 min target is educational guidance for progression, not a score gate the app enforces. Educational only—not medical advice.",
      },
    ],
  },
  {
    id: "magnetosphere-saa-deuterium",
    title: "Weakening magnetosphere, South Atlantic Anomaly & deuterium",
    pillar: "magnetism",
    summary:
      "Solid-Earth and space physics of geomagnetic decline and the South Atlantic Anomaly, how Van Allen belts interact with a weaker field—and where the deuterium-in-the-environment story is mainstream vs Kruse-specific.",
    relatedProtocolIds: [
      "barefoot-earth",
      "magnetic-awareness",
      "deuterium-aware-meal",
      "low-d-hydration",
      "magnetico-sleep-pad",
    ],
    sections: [
      {
        heading: "Earth’s magnetic field is not static",
        body: "Earth’s core-generated magnetic field has varied for billions of years, including full reversals preserved in ocean-floor magnetization. On human-relevant timescales, satellite missions (e.g. ESA Swarm, earlier Ørsted and CHAMP) track secular variation: the field’s strength and geometry change decade to decade. Global dipole moment has weakened on the order of roughly 5–10% per century in recent centuries—faster than the long-term average over the last few millennia in many models. That does not mean a reversal is imminent; geophysicists debate timescales and whether we are inside a gradual excursion. For lifestyle education, the factual anchor is simple: the planetary field you live under today is measurably softer in some regions and trending weaker than historical baselines in the geologic record.",
      },
      {
        heading: "What the South Atlantic Anomaly (SAA) is",
        body: "The South Atlantic Anomaly is a large region—roughly from South America across the South Atlantic toward Africa—where the main field is unusually weak and the inner Van Allen radiation belt dips closest to Earth. Satellites, the International Space Station, and high-altitude aircraft routes monitor elevated particle flux there; operators sometimes dim instruments or accept higher error rates when orbits cross the SAA. Maps from NOAA, ESA, and NASA show lower total field intensity and higher radiation at a given altitude than at the same latitude elsewhere. Living at sea level under the SAA is not the same as being in orbit, but the anomaly is real geophysics: a persistent hole-like weakness in the shielding geometry of the magnetosphere, not a metaphor.",
      },
      {
        heading: "Van Allen belts and a weaker magnetic flux",
        body: "The Van Allen radiation belts are trapped populations of energetic charged particles—mostly electrons in the outer belt, protons in the inner belt—held by Earth’s magnetic field lines. In a strong, symmetric dipole, those particles stay far above the atmosphere. Where the field weakens or distorts (as in the SAA), field lines can bow closer to Earth; the inner belt’s proton flux reaches lower altitudes (~200 km class versus much higher elsewhere). Space weather (solar wind pressure, coronal mass ejections) further compresses the magnetosphere on storm days, temporarily bringing belt particles and auroral precipitation closer to polar and mid-latitude atmospheres. Mainstream space physics documents this coupling; it is why airlines, astronauts, and satellite designers care about field strength and solar cycle.",
      },
      {
        heading: "From radiation at altitude to chemistry at the surface",
        body: "High-energy particles that penetrate the upper atmosphere can spallate nuclei and drive cosmogenic isotope production (carbon-14, beryllium-10, and other products studied in ice cores and tree rings). That is established atmospheric science at the top of the atmosphere. The jump from “more particle precipitation when the field is weak” to “your local drinking water has more deuterium this decade” is not a single proven step in standard hydrology. Natural deuterium content in precipitation and food webs already varies with latitude, altitude, evaporation history, and ocean mixing—documented in isotope hydrology (D/H ratios, “delta D”). Equatorial and low-latitude rainfall can be more deuterium-enriched than high-latitude snow in mean patterns. Any magnetosphere story about deuterium must be layered on top of that baseline variability.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Dr. Jack Kruse’s public light–water–magnetism framework connects a weakening geomagnetic field, the South Atlantic Anomaly, solar/cosmic particle flux, and Van Allen belt geometry to a modern rise in environmental deuterium load at Earth’s surface—framed as part of why mitochondrial water chemistry and ATP synthase struggle in the Anthropocene. In his narrative, a softer magnetosphere lets radiation belts and cosmic-ray cascades interact more strongly with the biosphere, altering isotope chemistry (including deuterium) in rain, plants, and marine food webs, especially at certain latitudes. He binds that to seafood vs terrestrial food choices, cold, light timing, and grounding. Those causal chains and quantitative claims are his synthesis bridging space physics and deuterium lifestyle medicine—they are not something this app measures, and they are not consensus isotope hydrology or clinical nutrition.",
      },
      {
        heading: "How to read the science without panic or slogans",
        body: "Established: field weakening and the SAA are observed; radiation belts respond to field geometry and solar wind. Contested or framework-level: that recent field decline has materially shifted everyday dietary deuterium for the average person in a way that overrides latitude, diet, and water source. Prudent posture: treat magnetosphere decline as real context for place and modern life (satellites, aviation, long-term planetary habitability), treat deuterium-aware eating and hydration as behavioral attention to water/food quality within the app’s Water pillar, and do not confuse Kruse’s integrated story with a lab report from your tap. If you live in or travel through the SAA footprint at ground level, your primary levers in this app remain outdoor light, nnEMF reduction, grounding, and food/water choices—not personal magnetometer readings.",
      },
      {
        heading: "Place, latitude, and daily habits",
        body: "The app’s Place view shows WMM-style main field parameters and geology/volcano proximity separately from artificial EM infrastructure—see the article “Earth’s magnetic field, crustal geology, and artificial EM.” The SAA reminds us that magnetism is global and regional: two users at the same ZIP can share sun times while satellite maps show different field weakness overhead. Lifestyle responses in this stack: barefoot earth contact and low artificial-field hours (Magnetism keystones), optional sleep-field tools if you use them, deuterium-aware meals and mineralized hydration (Water keystones), and strong morning light (Light pillar). None of those require you to accept every step of the Van Allen → deuterium narrative to be useful daily habits.",
      },
      {
        heading: "How this fits the app",
        body: "Read this lesson alongside “Deuterium, mitochondrial water, and ATP synthase” for the water chemistry side and “Earth’s magnetic field, crustal geology, and artificial EM” for what Place actually plots. Log magnetism habits (grounding, nnEMF blocks, nature time) and water keystones when you practice them. Mitoversity documents why Kruse-community place stories mention the SAA and radiation belts—not as alarmism, but so users understand where solid geophysics ends and lifestyle deuterium framing begins. Educational only—not space weather forecasting or medical isotope advice.",
      },
    ],
  },
  {
    id: "high-latitude-low-deuterium-water",
    title: "Why high-latitude glacial water is low in deuterium",
    pillar: "water",
    summary:
      "Isotope hydrology behind polar and alpine precipitation, why Icelandic glacial spring water is often deuterium-depleted, and how that fits deuterium-aware hydration in this app.",
    relatedProtocolIds: [
      "low-d-hydration",
      "mineralized-water",
      "deuterium-aware-meal",
      "carbonated-water",
    ],
    sections: [
      {
        heading: "Deuterium in water is reported as δD",
        body: "Hydrologists measure the deuterium-to-hydrogen ratio in water versus a standard (VSMOW) and express it as δD in per mil (‰). More negative δD means less deuterium relative to ordinary hydrogen—\"deuterium-depleted\" or \"light\" water. All natural water contains some deuterium; the question is how much. Rain at the equator is generally heavier (less negative δD) than snow that formed under cold polar skies. Food and body water inherit those signatures through what you drink and eat. This app does not measure δD; it teaches why geography of your water source matters in the lifestyle conversation.",
      },
      {
        heading: "Rayleigh distillation and the latitude effect",
        body: "The dominant mainstream explanation is progressive rainout along storm tracks. When ocean water evaporates, lighter isotopes (both ¹⁶O and protium-heavy water) preferentially enter vapor. As clouds move poleward or upslope and precipitation falls repeatedly, heavier isotopes drop out first. What eventually condenses and falls as snow in Iceland, Greenland, or the Alps is isotopically lighter than tropical rain. Colder condensation temperatures reinforce the same bias. That is textbook isotope meteorology—independent of any mitochondrial brand—and is why ice cores from Antarctica and Greenland are famous archives of past climate: the snow was light isotopically because of where and how it formed.",
      },
      {
        heading: "Altitude, season, and glacial storage",
        body: "High elevation adds another depletion step (the altitude effect): air lifting over mountains loses heavy isotopes before it reaches the summit snowfields. Glaciers store that snow for years to millennia, locking in a light isotope signature until melt. Spring water fed by glacial melt or subglacial aquifers can therefore carry δD values typical of high-latitude or high-altitude precipitation—not of warm lowland recharge. Season matters too: summer melt may mix light glacial water with heavier rainfall; winter baseflow can be purer glacial end-member. Bottled \"glacial spring\" products are only as light as their actual capture zone and mixing ratio.",
      },
      {
        heading: "Icelandic glacial spring water in particular",
        body: "Iceland sits near 64–66°N on the boundary of the North Atlantic storm track. Precipitation is overwhelmingly cool; much falls as snow that feeds glaciers and perennial ice caps. Meltwater percolates through young basalt and tephra—long, mineral-rich but cold pathways—before emerging as springs. Commercial sources marketed as Icelandic glacial spring water (e.g. Ölfus spring–type aquifers under lava fields) combine high-latitude meteoric depletion with glacial recharge and minimal long residence in warm shallow aquifers that might re-equilibrate isotopically. Published δD values for Icelandic glacial and spring waters are commonly more negative than temperate-city tap water or tropical bottled sources—sometimes on the order of tens of per mil lighter than equatorial rain, depending on batch and lab. Always treat a brand’s marketing sheet as weaker evidence than a third-party isotope analysis if you are buying for δD specifically.",
      },
      {
        heading: "Contrast with low-latitude and processed water",
        body: "Equatorial and subtropical rainfall tends toward higher δD (more deuterium). Long-distance transport of bottled water, desalination, reverse osmosis, and deionized indoor water change the story: processing removes minerals and microbes but does not automatically deplete deuterium unless a dedicated isotope-separation step is used (expensive, rare in home filters). A high-latitude natural spring is light because of where its hydrogen fell from the sky, not because the bottle is fancy. Tap water in Phoenix, Houston, or Singapore often reflects warmer recharge and evaporation history—typically heavier isotopically than Nordic glacial spring water in mean comparisons.",
      },
      {
        heading: "Does lighter water change biology for healthy people?",
        body: "Kinetic isotope effects mean deuterium bonds are slightly stronger and some enzymatic proton hops are slower in heavy water—but everyday δD shifts between natural waters are tiny compared with laboratory D₂O experiments. Clinical deuterium-depletion trials exist in specialized research contexts; they are not the same as switching to Icelandic water for a month. Reasonable mainstream summary: source matters for isotope geochemistry; health magnitude for typical hydration choices remains debated. The lifestyle case in this app is attention and stacking—morning hydration in daylight, mineralized low-D–aware sources when available—not a guarantee of measured body-water depletion.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public prescriptions often name Icelandic glacial spring water, meltwater from high latitudes, and avoidance of equatorial or deuterium-heavy tap zones as part of the Water pillar paired with light and magnetism. He links low-δD hydration to mitochondrial matrix water quality and ATP synthase proton choreography in his essays and forum work—stronger causal language than isotope hydrology alone provides. His place-based rules (latitude, seafood, cold, light before water) integrate into one stack. Treat Icelandic water in his framework as a practical low-D source when you can source it; treat mechanistic certainty about ATP gains as his teaching layer, not a lab result from this app.",
      },
      {
        heading: "Practical sourcing without obsession",
        body: "If you care about the isotope argument: prioritize naturally cold, high-latitude or alpine spring waters with documented glacial recharge; compare δD only when you have real assay data. If you cannot source Icelandic water, high-latitude Canadian, Nordic, or alpine European springs follow the same meteorology in principle. Carbonated mineral waters from similar regions inherit the same hydrogen story. Morning first water in outdoor light (low-D hydration keystone) is behavior you control wherever you live. Do not confuse TDS, pH, or silica marketing with deuterium—ask for isotope data or accept uncertainty.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Low-D morning hydration” when your first daylight water is intentionally from a low-deuterium-aware source or habit. Log “Mineralized / structured water” for well-mineralized spring water (Icelandic glacial fits both stories). Pair with “Deuterium-aware meal” and the lesson “Deuterium, mitochondrial water, and ATP synthase.” Place in the app shows your sun latitude, not your water δD—use Mitoversity for the why. Educational only—not medical or isotope testing advice.",
      },
    ],
  },
  {
    id: "inclined-bed-glymphatic",
    title: "Inclined bed therapy & glymphatic drainage",
    pillar: "support",
    summary:
      "What inclined bed therapy is, what the glymphatic system does during sleep, plausible overlap—and where evidence is strong, suggestive, or still anecdotal.",
    relatedProtocolIds: [
      "dark-bedroom",
      "consistent-sleep-window",
      "phone-away-sleep",
      "blue-light-hygiene",
    ],
    sections: [
      {
        heading: "What inclined bed therapy (IBT) is",
        body: "Inclined bed therapy means sleeping on a flat plane tilted head-up—typically about 3–6° (often implemented by raising the head end of the bed roughly 15–20 cm / 6–8 inches, or using sturdy blocks under the headboard legs, not just a thick wedge pillow that only bends the neck). The whole mattress should incline as one surface so the spine stays neutral. The idea was popularized in public forums by Andrew Fletcher and others who argued that constant slight head-up tilt relative to the feet is closer to how gravity acts on fluids over long night hours than perfectly level beds. Reported anecdotes include easier morning clarity, leg comfort, reflux relief, and better sleep quality. Rigorous randomized trials of IBT for brain health are limited; much of the conversation is still mechanistic reasoning plus user reports.",
      },
      {
        heading: "The glymphatic system in mainstream neuroscience",
        body: "Since work by Maiken Nedergaard and colleagues (widely cited from 2012 onward), the brain’s “glymphatic” clearance pathway has been mapped in animals: cerebrospinal fluid (CSF) enters along arterial perivascular spaces, mixes with interstitial fluid carrying metabolic waste (including amyloid-β and tau species studied in Alzheimer’s models), and exits along venous routes—much of it during deep slow-wave sleep when the extracellular space appears to widen. Arterial pulsations, respiratory cycles, and aquaporin-4 water channels on astrocyte endfeet participate. Human evidence is growing (imaging and tracer studies) but still less granular than rodent work. Glymphatic failure is discussed as one contributor among many in neurodegeneration—not a single switch you flip with one hack.",
      },
      {
        heading: "Why posture at night might matter",
        body: "Animal studies show sleep position changes clearance rates: in mice, lateral (side) sleeping was associated with faster glymphatic transport than supine or prone positions in a classic 2015 Journal of Neuroscience report. Head-of-bed elevation in humans is established in hospitals for intracranial pressure management, venous drainage, and gastroesophageal reflux—not originally as a glymphatic protocol. Gravity alters CSF and venous pressure gradients; dural lymphatic vessels near the sinuses add another drainage route discovered in recent years. The plausible IBT story is: a slight sustained head-up tilt might favor cranial venous outflow and CSF/ISF movement over eight hours versus dead-flat supine stagnation. That chain is biologically conceivable but not yet proven as “IBT → measured glymphatic flux in humans.”",
      },
      {
        heading: "Potential benefits people discuss",
        body: "Reported and sometimes studied adjacent effects include: (1) Reduced nighttime acid reflux when the upper body is truly elevated—mainstream gastroenterology supports head elevation for GERD symptoms. (2) Less morning puffiness or leg heaviness in some users—possibly venous/lymphatic peripheral drainage, distinct from brain glymphatics. (3) Sleep apnea and snoring—elevation helps some reflux-related arousals but can worsen or improve apnea depending on anatomy; get a sleep study if snoring is significant. (4) Brain “detox” narratives—popular online, strongest in animal slow-wave sleep data, weakest as IBT-specific human outcomes. Separate established levers for glymphatic support in research: adequate deep sleep duration, regular sleep timing, exercise, and avoiding alcohol before bed (alcohol suppresses REM/slow-wave architecture in many users).",
      },
      {
        heading: "How to set up a safe incline",
        body: "Raise both head legs of the bed frame or use rated risers under the headboard side—stable, not wobbly. Aim near 5° as a common community target; measure with a phone inclinometer on the mattress plane. Avoid slippery sheets that slide you footward; a subtle footboard or textured mattress cover can help. Partners need buy-in. Side-sleeping remains compatible and may stack with IBT if the whole surface is tilted. Do not substitute a neck wedge for whole-bed tilt if the goal is body-wide gradient. Re-check after months for frame stress. If you slide, reduce angle.",
      },
      {
        heading: "Who should be cautious",
        body: "Hip or lower-back pain can worsen on incline for some people—trial short naps first. Unstable heart failure, orthopnea managed with specific bed angles, pregnancy, and post-surgical positioning should follow clinician advice, not forum defaults. Benign paroxysmal positional vertigo can be triggered by unusual sleep angles. Children’s beds need pediatric guidance. IBT is an experiment, not a prescription for hydrocephalus, meningitis, or acute neurologic disease.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public sleep material emphasizes glymphatic clearance as part of the brain’s nightly mitochondrial maintenance—linking darkness, cold room temperature, nnEMF removal, and deep sleep to lowered neurodegenerative risk in his framework. He discusses CSF flow, Alzheimer’s prevention, and strict sleep environment more often than Fletcher-style IBT by name, but communities overlapping his work sometimes adopt inclined beds as an added gravity/place lever. Treat Kruse’s glymphatic–mitochondrial coupling and any IBT endorsement you encounter in forum posts as lifestyle synthesis: compatible with mainstream “sleep depth matters for clearance,” but not a substitute for neurology care or published IBT trials.",
      },
      {
        heading: "Stacking with this app’s sleep habits",
        body: "Glymphatic physiology assumes you reach deep sleep: log “True dark sleep environment,” “Circadian sleep window,” “Phone away from bed,” and “Evening blue-light hygiene” before worrying about bed angle. Cool room (~65 °F) and magnetism choices (grounding by day, optional sleep-field tools) sit in the same night stack—see “Fully dark sleep environment” and “Cool bedroom sleep (~65 °F).” IBT is an optional environmental tweak—worth a 4–8 week trial if setup is safe—not a replacement for light timing by day.",
      },
      {
        heading: "How this fits the app",
        body: "There is no separate “inclined bed” checkbox yet; track IBT as part of “True dark sleep environment” or “Circadian sleep window” if you adopt it consistently, and note your angle in personal journaling outside the app. Read “Fully dark sleep environment” and “Cool bedroom sleep (~65 °F)” for the baseline night protocol. Educational only—not medical advice for reflux, intracranial pressure, sleep apnea, or neurodegenerative disease.",
      },
    ],
  },
  {
    id: "grounding-mats-earth-stake",
    title: "Grounding mats, earth stakes & clean grounding",
    pillar: "magnetism",
    summary:
      "Outdoor barefoot vs indoor mats, why many protocols stake into real soil instead of wall outlets, how to test body voltage, and where ferrite beads fit for cable RF.",
    relatedProtocolIds: [
      "barefoot-earth",
      "magnetic-awareness",
      "reduce-nnemf-block",
      "phone-away-sleep",
      "breaker-off-bedroom",
      "breaker-off-office",
    ],
    sections: [
      {
        heading: "Two different ideas called “grounding”",
        body: "In this app’s Magnetism pillar, grounding means restoring contact with Earth’s surface—bare feet on soil, grass, sand, or stone—and reducing non-native EMF load. Commercial “earthing” or grounding mats extend that indoors: conductive sheets or desk pads connected by wire to a reference Earth potential. The lifestyle goal is stable DC coupling to the planet and less floating body voltage in a built environment. Mainstream medicine does not treat earthing mats as proven therapy for inflammation or sleep; small pilot studies exist with mixed quality. Electrical safety and honest measurement, however, are engineering facts—not debates.",
      },
      {
        heading: "Outlet ground vs stake in the earth",
        body: "A three-prong wall outlet’s ground pin is bonded to your building’s grounding electrode system (ground rod, water pipe, or Ufer ground)—legally tied to neutral at the service panel. That network carries fault current and, in many homes, also bleeds microvolt-to-volt level noise: neutral return currents, switched-mode power supplies, dimmers, and “dirty electricity” (high-frequency transients on conductors). Plug-in grounding kits that only use the outlet’s ground hole therefore connect you to building Earth, not necessarily to quiet Earth. Advocates of outdoor stakes drive a separate rod into soil (often outside, below a window or desk run) and bring only that conductor to the mat—electrically isolating the mat reference from the panel ground path except that both ultimately meet in the dirt. Wet, mineralized soil lowers resistance. Use outdoor-rated wire, burial depth appropriate to your climate, and keep the stake away from buried utilities (call 811 / local locate before digging).",
      },
      {
        heading: "Dirty electricity and why it matters to mat users",
        body: "“Dirty electricity” is informal language for broadband voltage noise riding on power lines and grounds—not a clinical diagnosis. Sources include fluorescent and LED drivers, variable-speed motors, cheap USB chargers, and solar inverters back-feeding harmonics. If your body already sits at a few volts AC relative to true earth (common near unbalanced wiring or long neutral runs), bonding to a noisy panel ground through a mat can, in worst cases, increase current paths across your skin rather than calm them. That is why serious earthing installers emphasize a dedicated earth rod and, for skeptical engineers, an ohmic path that does not share the outlet’s ground conductor for the mat reference. Fixing wiring (dedicated circuits, balanced loads, quality filters where appropriate) belongs to a licensed electrician; mats are not a substitute for code-compliant panels.",
      },
      {
        heading: "Test before you trust: body voltage and ground quality",
        body: "Do not sleep on a new mat blind. Minimum checks: (1) Body voltage test—hold a high-impedance AC voltmeter lead or consumer “body voltage” kit probe; measure Volts AC between your skin and a reference earth rod or verified outdoor soil stake. Note the reading standing on an insulated floor vs touching the mat. You want stable, low AC body voltage relative to earth; if the mat raises AC volts or you feel tingling, stop. (2) Outlet tester—cheap plug-in device confirms hot/neutral/ground presence; it does not prove low noise but catches dangerous miswiring. (3) Resistance from mat snap to stake—multimeter ohms mode; very high resistance means bad clip, dry soil, or corroded rod; re-wet soil or add second rod in parallel per installer guidance. (4) DC offset—some users also check for small DC potentials from galvanic effects when dissimilar metals touch soil. Retest after storms, irrigation, or any electrical work. Document numbers; anecdotes without meters are guesswork.",
      },
      {
        heading: "Barefoot outdoors still wins when you can",
        body: "The catalog keystone “Barefoot earth contact” is the zero-hardware baseline: skin on real ground in daylight. Mats are a convenience for desk work, winter, or apartments without safe outdoor access. They do not replace nnEMF hygiene—router distance, phone away from bed, and low-RF hours still count. If you only have an outlet kit, treat it as provisional until you can verify with an independent earth stake or an electrician that your grounding electrode is quiet enough. Apartment dwellers may be limited by landlord rules on exterior rods; in that case prioritize outdoor barefoot sessions and RF reduction over fighting building wiring.",
      },
      {
        heading: "Ferrite beads and stray RF on cables",
        body: "Ferrite clamps (snap-on toroids or sleeve beads) add impedance to common-mode high-frequency currents on cables—USB chargers, laptop DC cords, Ethernet, monitor leads—that otherwise act as transmitting or receiving antennas in the bedroom and desk. They do not block intentional Wi‑Fi or cell radios in the phone itself; they tame conducted RF on wires. Place beads close to the device end of noisy laptop or charger cables, on Ethernet runs near the bed, and on long peripheral cords. Use size and material matched to the frequency band you care about (mixture-type ferrites are typical for consumer RF). Combine with distance: airplane mode, powered-down Wi‑Fi at night, and “Phone away from bed” remove the source; ferrites clean the harness. Log “nnEMF reduction block” when you run a deliberate low-RF hour; ferrites are part of that toolkit, not a standalone miracle.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s nnEMF material stresses that mitochondrial recovery is fought by artificial fields at night and that grounding must be real Earth contact—not symbolic wellness. In forum and blog layers he warns about dirty electricity, metal beds near fields, and sleeping with mains voltage references that are not true Earth. He prioritizes outdoor grounding, cold, and darkness alongside magnetism. Product-specific mat brands and aggressive body-voltage targets appear in community practice more than in peer-reviewed medicine. Read his prescriptions as strict environment design within the light–water–magnetism stack; still verify with meters locally because building wiring varies.",
      },
      {
        heading: "Practical setup checklist",
        body: "Preferred: exterior copper or galvanized stake in moist soil → outdoor-rated wire → mat with current-limiting resistor (many commercial kits include 100 kΩ inline) → daily barefoot sessions when weather allows. Avoid: grounding mat clipped only to outlet ground in homes with old knob-and-tube, shared neutrals, or known harmonic issues until tested. Add: ferrites on bedside charging cables, body voltage log once per season, electrician consult if outlet tester fails or neutral-to-ground voltage is abnormal. Night stack: mat off or on stake only after measurement, phone out of room, true dark bedroom and cool room per other lessons.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Barefoot earth contact” for real outdoor ground; use “Low artificial field hour” and “nnEMF reduction block” for RF-aware time and airplane-mode blocks. Permanent breaker-off habits (bedroom and office) auto-log daily when on your available list—tap to skip a night or workday when traveling. There is no separate grounding-mat checkbox—mats support the same Magnetism pillar when they are verified safe Earth references. Read “Earth’s magnetic field, crustal geology, and artificial EM” for what Place plots vs what your bedroom wiring does. Educational only—not electrical installation advice; hire licensed professionals for panel and grounding electrode work.",
      },
    ],
  },
  {
    id: "castor-oil-navel",
    title: "Castor oil in the belly button (navel)",
    pillar: "support",
    summary:
      "What castor oil is, the pechoti / nabhi tradition, what evidence does and does not support, safe use, and where Kruse-adjacent gut–lymph talk fits.",
    relatedProtocolIds: [
      "early-dinner",
      "hydration-timing",
      "deuterium-aware-meal",
    ],
    sections: [
      {
        heading: "What people are actually doing",
        body: "The practice is simple: a few drops of cold-pressed castor oil (Ricinus communis) placed in the navel (belly button), sometimes with a gentle clockwise belly massage, then left for minutes to hours—often before sleep or on waking. In Ayurveda it appears among nabhi (navel) therapies; social media calls it the “pechoti” or belly-button oil method. Castor oil elsewhere in traditional medicine shows up as topical packs (abdomen, joints) and, when swallowed, as a strong laxative—that oral effect is not what this article describes. This lesson is external navel application only.",
      },
      {
        heading: "What castor oil is chemically",
        body: "Refined castor oil is rich in ricinoleic acid, an unusual hydroxylated fatty acid that gives the oil its thick feel and slow absorption on skin. Pharmacology texts know castor oil mainly as a stimulant laxative when ingested and as an emollient or occlusive topical. Raw castor beans contain ricin, a dangerous toxin; commercial cosmetic and food-grade castor oils are processed to remove ricin—buy reputable cold-pressed or USP/cosmetic grade products, never DIY from beans. Patch-test a dab on the inner arm before the navel.",
      },
      {
        heading: "Why the navel at all?",
        body: "Traditional frameworks treat the navel as a hub for vessels, fascia, and gut connectivity in the abdomen—not as a second mouth. Advocates claim faster “absorption” into circulation or lymph from the umbilical scar and surrounding skin. Mainstream dermatology treats the navel like other thin abdominal skin: some lipophilic molecules penetrate locally, but there is no robust clinical literature proving the navel is a privileged systemic port compared with applying the same oil to the wider abdomen. Plausible mechanisms for any felt benefit are mild local moisturization, massage of the gut area, relaxation ritual, and placebo/context—not magic plumbing through the umbilicus.",
      },
      {
        heading: "Claims you will hear (and evidence quality)",
        body: "Anecdotes and Ayurvedic texts cite help with bloating, constipation, cramps, skin glow, and “detox.” Rigorous RCTs on navel-only castor oil are essentially absent. Oral castor oil as laxative is evidence-based; abdominal castor oil packs have a long folk history but mixed modern trial data for pain and inflammation depending on condition. Separating traditions: external navel drops are low-risk for many healthy adults if hygiene is good; they are not a treatment for appendicitis, pregnancy complications, inflammatory bowel disease flares, or infections—see a clinician for those.",
      },
      {
        heading: "Safe practice if you experiment",
        body: "Use a clean dropper; 2–5 drops is a typical community dose. Warm the oil slightly in clean hands if desired. Lie down, apply, cover with a soft cloth if you fear staining sheets. Wash the navel next morning if residue remains to avoid odor or irritation. Stop if redness, itch, or discharge appears. Pregnant people, infants, and anyone with a surgical navel hernia or active belly wound should skip unless a qualified practitioner advises otherwise. Never confuse navel drops with drinking castor oil—oral doses are a different, much stronger intervention.",
      },
      {
        heading: "Stacking with this app’s habits",
        body: "Castor navel oil is a Support-pillar adjunct—like mastic gum chewing—not a Light, Water, or Magnetism keystone. It pairs logically with earlier last meal, daylight-aligned hydration, and deuterium-aware food choices if your goal is gut comfort within the wider mitochondrial lifestyle stack. It does not replace morning outdoor light, low-D hydration, grounding, or dark sleep. No catalog checkbox exists yet; track it in personal notes or adopt it as a private ritual outside points if you find it useful.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public material centers light, water, magnetism, and cold more than nabhi oil, but overlapping communities discuss castor abdominal packs for lymphatic and liver support in the same lifestyle orbit. When forum posts tie navel castor to mitochondrial “detox,” treat that as community extension of older castor-pack folklore, not a cited Kruse protocol with trial data. His stack’s relevant lesson is: fix light and sleep first; topical belly oil is downstream garnish, not the spine.",
      },
      {
        heading: "How this fits the app",
        body: "Mitoversity documents the practice so users who hear about it from Ayurveda, podcasts, or forums can place it in context. Log core Water and Light habits in the catalog; consider castor navel oil experimental Support hygiene. Educational only—not medical advice for digestive disease, fertility, or skin infection.",
      },
    ],
  },
];

export function getMitoEntry(id: string): MitoEntry | undefined {
  return MITOVERSITY_ENTRIES.find((e) => e.id === id);
}
