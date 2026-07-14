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
];

export function getMitoEntry(id: string): MitoEntry | undefined {
  return MITOVERSITY_ENTRIES.find((e) => e.id === id);
}
