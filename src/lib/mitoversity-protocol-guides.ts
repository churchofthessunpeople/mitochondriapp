/**
 * Mitoversity articles — one primary guide per catalog activity.
 * Linked from activities via protocol meta `articleId`.
 */
import type { MitoEntry } from "@/lib/mitoversity";

export const MITOVERSITY_PROTOCOL_GUIDES: readonly MitoEntry[] = [
  {
    id: "sunrise-horizon",
    title: "Sun over the horizon: the strongest morning signal",
    pillar: "light",
    summary:
      "Why watching the solar disk at dawn is the top morning-light tier—and how it couples to your day boost.",
    relatedProtocolIds: ["sunrise-horizon"],
    sections: [
      {
        heading: "What makes horizon sunrise different",
        body: "Circadian biology resets from outdoor light intensity and spectrum at the eyes. When the sun itself crosses the horizon, you get a rapid change in radiance and a solar-path signal that indoor LEDs cannot mimic. Glass filters UV and alters spectrum; sunglasses block the dose. This app’s top sunrise tier rewards that unobstructed horizon view within a tight window around local sunrise.",
      },
      {
        heading: "How to practice it",
        body: "Be outside before the disk clears the horizon. Bare eyes to the sun—no window glass. Bracket local sunrise (shown on Place/Today) within about 15 minutes before or after for full points. Pair with outdoor grounding when practical; log skin and sunglasses on the sunrise check-in because they adjust your day multiplier.",
      },
      {
        heading: "How this fits the app",
        body: "Log “Sun over the horizon” in the sunrise slot. It is the strongest morning keystone and unlocks the highest day boost on other activities. Read the open-sky and outside-morning articles for lower tiers when weather or terrain limit the view.",
      },
    ],
  },
  {
    id: "sunrise-open-sky",
    title: "Open-sky morning light",
    pillar: "light",
    summary:
      "Full-spectrum outdoor morning light under a wide sky—strong circadian dose without a clear horizon disk.",
    relatedProtocolIds: ["sunrise-open-sky"],
    sections: [
      {
        heading: "When open sky is the right tier",
        body: "You may not see the solar disk every day—cloud, terrain, or urban canyon—but a broad outdoor sky still delivers high melanopsin drive compared with indoor lighting. This tier is for mornings with decent open sky: yard, park, balcony, or trail with wide sky view.",
      },
      {
        heading: "Practice",
        body: "Eyes open to outdoor light without sunglasses. A few minutes counts; longer is fine. Avoid glass between you and the sky when you can. Log in the sunrise phase when this is your best available signal.",
      },
      {
        heading: "App scoring",
        body: "Open-sky morning light unlocks a 1.5× day boost on other habits—below horizon sunrise but above limited-sky outside light. Use it honestly when the sky is open even if the sun is not visible.",
      },
    ],
  },
  {
    id: "sunrise-outside",
    title: "Outside morning light with limited sky",
    pillar: "light",
    summary:
      "Any outdoor morning photons when trees, streets, or heavy cloud limit the view—still worth logging.",
    relatedProtocolIds: ["sunrise-outside"],
    sections: [
      {
        heading: "Why it still matters",
        body: "Even with constrained sky view, outdoor morning light beats indoor brightness and spectrum for circadian entrainment. Porches, tree-lined streets, and overcast dawns still train timing better than staying inside.",
      },
      {
        heading: "Practice",
        body: "Step outside in the morning. Eyes open; avoid sunglasses if safe. A short stop before indoor work helps anchor the day when horizon or open-sky tiers are impossible.",
      },
      {
        heading: "App scoring",
        body: "This tier unlocks a 1.25× day boost—real credit for showing up outdoors when the view is limited. Upgrade to open-sky or horizon tiers when conditions allow.",
      },
    ],
  },
  {
    id: "sun-exposure",
    title: "Outside Time",
    pillar: "light",
    summary:
      "Outdoor time by morning, solar noon, or afternoon — full sun or shade, with duration. Daytime light habit separate from the Sunrise check-in.",
    relatedProtocolIds: ["sun-exposure"],
    sections: [
      {
        heading: "Why one activity, three slots",
        body: "Morning, solar noon, and afternoon light are different UV and circadian jobs. Outside Time routes each log into a solar-relative slot from Place sun times: morning from sunrise to 1 hour before solar noon, solar noon until 2 hours after, then afternoon until sunset. Log another session anytime you go out again.",
      },
      {
        heading: "What you log",
        body: "Time of day (slot), full sun vs shaded, and how long you stayed. Full sun scores higher than shade. ZIP UV weighting is planned next so strong noon UV can score differently from winter mornings.",
      },
      {
        heading: "How this fits the app",
        body: "Sunrise check-in remains separate—it unlocks the day boost. Outside Time is the daytime outdoor-light habit for skin and spectrum. Pair with Place solar noon and the solar-noon vitamin D lesson for context.",
      },
    ],
  },
  {
    id: "red-nir-light",
    title: "Red and near-infrared light exposure",
    pillar: "light",
    summary:
      "Natural dusk red light and optional red/NIR panels—evening spectrum and recovery context.",
    relatedProtocolIds: ["red-nir-light"],
    sections: [
      {
        heading: "Spectrum role",
        body: "Twilight and sunset carry more red and near-infrared relative to midday blue sky. Lifestyle communities discuss that band for evening wind-down and skin exposure without mid-day UV burn risk. Therapeutic panels are optional gear—not a substitute for outdoor light timing.",
      },
      {
        heading: "Practice",
        body: "Prefer natural dusk red outdoors when possible. If you own a red/NIR panel, follow device guidance. Log duration in 15-minute blocks or custom minutes.",
      },
      {
        heading: "Stacking",
        body: "Pair with sunset viewing and evening blue-light hygiene: outdoor solar signal first, then dim artificial light indoors.",
      },
    ],
  },
  {
    id: "barefoot-earth",
    title: "Barefoot earth contact",
    pillar: "magnetism",
    summary:
      "Skin on soil, grass, sand, or stone—direct Earth coupling in the Magnetism pillar.",
    relatedProtocolIds: ["barefoot-earth"],
    sections: [
      {
        heading: "What you are doing",
        body: "Barefoot time on real ground lets charge and pressure patterns from Earth reach your body—distinct from rubber-soled indoor life. Asphalt is a weaker proxy than soil or grass when you can choose.",
      },
      {
        heading: "Practice",
        body: "Stand or walk barefoot on natural surfaces. Log time in 15-minute blocks or custom duration. Morning outdoor sessions stack with Light habits.",
      },
      {
        heading: "Indoor mats",
        body: "Commercial grounding mats can extend Earth contact indoors—see the grounding mats article for stake vs outlet safety. Outdoor barefoot remains the zero-hardware baseline.",
      },
    ],
  },
  {
    id: "nature-contact",
    title: "Nature immersion",
    pillar: "magnetism",
    summary:
      "Green and blue space away from dense screens and routers—movement plus low-RF outdoor time.",
    relatedProtocolIds: ["nature-contact"],
    sections: [
      {
        heading: "Why place matters",
        body: "Parks, trails, beaches, and gardens combine natural surfaces, lower artificial EMF density, and daylight. Unhurried outdoor time supports both Magnetism and Light pillars.",
      },
      {
        heading: "Practice",
        body: "Spend intentional time in green or blue space. Log duration in 15-minute blocks up to the cap. Leave the phone on airplane mode or in a pocket when you want a cleaner field hour.",
      },
      {
        heading: "App fit",
        body: "Nature immersion is multi-log afternoon or anytime activity—use it for long outdoor blocks that are not specifically barefoot-only.",
      },
    ],
  },
  {
    id: "drinking-water",
    title: "Drinking water",
    pillar: "water",
    summary:
      "One glass log: RO, spring, or deuterium-depleted; optional salt or baking soda; still or carbonated.",
    relatedProtocolIds: ["drinking-water"],
    sections: [
      {
        heading: "Source",
        body: "Reverse osmosis and similar purified water are fine when remineralized. Spring or mineral water already carries minerals. Deuterium-depleted water (DDW) is logged with the label’s deuterium PPM (natural water is ~150 ppm).",
      },
      {
        heading: "Remineralization & carbonation",
        body: "Add sea/electrolyte salt or baking soda when you use them, and pick the amount. Still vs carbonated is a final choice — sparkling water counts; sugary soda does not.",
      },
      {
        heading: "Practice",
        body: "Log each intentional glass. Spread servings through the day. Baking soda is best ≥2 hours from meals. Pair with daylight-aligned hydration timing and Low-D morning hydration.",
      },
    ],
  },
  {
    id: "hydration-timing",
    title: "Daylight-aligned hydration",
    pillar: "water",
    summary:
      "Front-load fluids earlier; taper large volumes before sleep for better sleep architecture.",
    relatedProtocolIds: ["hydration-timing"],
    sections: [
      {
        heading: "Timing vs volume",
        body: "When you drink can matter as much as what you drink for sleep quality and daytime energy. Late large volumes can fragment sleep; morning hydration supports the circadian day.",
      },
      {
        heading: "Practice",
        body: "Shift glasses earlier; reduce chugging in the last hours before bed. Log when you deliberately changed timing—not every sip, but the intentional habit.",
      },
      {
        heading: "Stacking",
        body: "Pair with low-D morning hydration and mineralized water for a full Water day.",
      },
    ],
  },
  {
    id: "seafood-meal",
    title: "Seafood-forward meals",
    pillar: "water",
    summary:
      "Cold-water seafood and marine fats as lower-deuterium, DHA-rich meal anchors.",
    relatedProtocolIds: ["seafood-meal"],
    sections: [
      {
        heading: "Why seafood shows up in the Water pillar",
        body: "Marine food webs often carry fats and proteins discussed in deuterium-aware and DHA/retinal nutrition frameworks. Seafood-forward meals are a practical lower-deuterium meal pattern in this app.",
      },
      {
        heading: "Practice",
        body: "Center a meal on salmon, sardines, mackerel, or similar—seafood as main protein, not a garnish. Log when that was the intent.",
      },
      {
        heading: "Read next",
        body: "See “Deuterium, mitochondrial water, and ATP synthase” and “Solar noon sun for vitamin D” for how meals and light interact in the stack.",
      },
    ],
  },
  {
    id: "early-dinner",
    title: "Earlier last meal",
    pillar: "water",
    summary:
      "Finish eating with a buffer before sleep—meal timing for circadian recovery.",
    relatedProtocolIds: ["early-dinner"],
    sections: [
      {
        heading: "Meal timing and sleep",
        body: "Late heavy meals shift digestion, temperature, and glucose into the sleep window. A buffer—often three or more hours before bed for many people—supports deeper sleep and morning clarity.",
      },
      {
        heading: "Practice",
        body: "Log when you actually ate earlier than your old default, not merely when you wished you had. Adjust to what lets you sleep well.",
      },
      {
        heading: "Stacking",
        body: "Pair with circadian sleep window, true dark bedroom, and cool room habits for night recovery.",
      },
    ],
  },
  {
    id: "cold-face-plunge",
    title: "Cold face and head immersion",
    pillar: "support",
    summary:
      "Entry-level cold via face or brief head immersion—now Face immersion inside Cold thermogenesis (3 rounds).",
    relatedProtocolIds: ["cold-face-plunge", "cold-thermogenesis"],
    sections: [
      {
        heading: "Trigeminal cold pathway",
        body: "Cold water on the face activates the diving reflex and sympathetic arousal—a smaller dose than full-body thermogenesis but useful for building cold tolerance.",
      },
      {
        heading: "Practice",
        body: "In Cold thermogenesis, choose Face immersion and skin temperature. The app logs 3 rounds per session. Progress toward cold plunge or shower when ready.",
      },
      {
        heading: "Read next",
        body: "See “Cold thermogenesis: ~50 °F skin for 10+ minutes” for full plunge progression.",
      },
    ],
  },
  {
    id: "reduce-nnemf-block",
    title: "nnEMF reduction blocks",
    pillar: "magnetism",
    summary:
      "Airplane mode, router distance, and deliberate low-RF time blocks.",
    relatedProtocolIds: ["reduce-nnemf-block"],
    sections: [
      {
        heading: "What nnEMF means here",
        body: "Non-native EMF refers to human-made radiofrequency and electrical noise—phones, Wi‑Fi, routers, dense urban RF. This app tracks behavioral reduction blocks, not personal field measurements.",
      },
      {
        heading: "Practice",
        body: "Run an intentional low-RF hour: airplane mode, router distance, or outdoor time away from dense electronics. Log duration in 15-minute blocks up to the cap.",
      },
      {
        heading: "Night stack",
        body: "Pair with phone away from bed and bedroom breaker habits for sleep-time field hygiene.",
      },
    ],
  },
  {
    id: "phone-away-sleep",
    title: "Phone away from bed",
    pillar: "magnetism",
    summary:
      "Remove the phone from the sleeping space—RF, light leaks, and sleep fragmentation.",
    relatedProtocolIds: ["phone-away-sleep"],
    sections: [
      {
        heading: "Why distance matters",
        body: "Phones combine nnEMF, standby light, and notification arousal inches from your head. Another room or far bedside on airplane mode reduces all three.",
      },
      {
        heading: "Practice",
        body: "Charge and store the phone outside the sleeping space or at maximum distance with radios off. Log nightly when this is your standard.",
      },
      {
        heading: "Light coupling",
        body: "This habit is both Magnetism and Light—midnight screen photons fight melatonin. See the true dark bedroom article for the full night arc.",
      },
    ],
  },
  {
    id: "air-tube-headphones",
    title: "Air tube headphones for phone calls",
    pillar: "magnetism",
    summary:
      "Why hollow acoustic-tube headsets keep RF and conducted fields farther from your brain than earbuds or holding the phone to your head.",
    relatedProtocolIds: ["air-tube-headphones"],
    sections: [
      {
        heading: "The problem with phone-at-ear habits",
        body: "Cell phones are microwave radios held millimeters from the skull during long calls. Wired earbuds still put a cable and often a small driver near the ear; Bluetooth buds add a radio transmitter at the head. Lifestyle nnEMF frameworks treat chronic call exposure as worth reducing even when regulatory limits are met—especially for long or daily calls.",
      },
      {
        heading: "What air-tube headphones do",
        body: "Air-tube headsets place the speaker or driver down the cable—often chest or belt level—with hollow plastic or silicone tubes carrying sound to the earpieces. Your ears receive pressure waves through air, not wire or a local Bluetooth chip. The phone itself stays on the desk or in a stand at distance, which also lowers hand and trunk exposure compared with cradling the handset.",
      },
      {
        heading: "How they differ from other options",
        body: "Speakerphone is zero-gear and keeps distance but sacrifices privacy and clarity in noisy rooms. Standard wired earbuds route cable fields near the head. Bluetooth headsets trade a cable for a 2.4 GHz transmitter at the ear—often worse for nnEMF-focused users. Air tubes are the common compromise: private audio with the active electronics and phone farther from the brain.",
      },
      {
        heading: "Practical setup",
        body: "Buy a reputable air-tube model with a 3.5 mm plug or USB-C adapter for your phone. Keep calls on the table; use a simple stand if helpful. For video calls, the same rule applies—air tubes plus camera at arm's length beats laptop-on-lap with Bluetooth buds. Replace tubes if they crack or yellow; sound muffling often means the air path is compromised.",
      },
      {
        heading: "Where Dr. Jack Kruse's teaching is specific",
        body: "Kruse's nnEMF material stresses minimizing microwave sources at the head and coupling phone habits into the wider light–water–magnetism stack—especially for people who talk on the phone daily. Air-tube headsets appear frequently in community gear lists as a practical call-time mitigation, not a license to marathon screen time. Treat strong claims about quantified risk reduction as lifestyle framework, not a personal SAR measurement from this app.",
      },
      {
        heading: "How this fits the app",
        body: "Add “Air tube headphones for calls” to your available list if you own a set and commit to using them for calls. It auto-logs daily as a permanent Magnetism habit; skip on no-call days or when traveling without your headset. Pair with phone-away-from-bed, nnEMF reduction blocks, and breaker habits for a fuller field-hygiene day.",
      },
    ],
  },
  {
    id: "breaker-off-bedroom",
    title: "Bedroom breakers off overnight",
    pillar: "magnetism",
    summary:
      "Switch bedroom circuits off at the panel for lower AC fields and dirty electricity at night.",
    relatedProtocolIds: ["breaker-off-bedroom"],
    sections: [
      {
        heading: "What this targets",
        body: "Bedroom circuits can carry AC electric fields from wiring and plugged loads even when devices are “off.” Panel breakers remove that path overnight—only if safe and practical in your home.",
      },
      {
        heading: "Safety first",
        body: "Do not disable circuits that power smoke detectors, heat, or medical devices. Use a licensed electrician if unsure. This is a permanent auto-log habit while on your available list.",
      },
      {
        heading: "Practice",
        body: "Flip bedroom breakers off on a consistent night routine; skip when traveling. Tap to skip a night in the app when the panel is inaccessible.",
      },
    ],
  },
  {
    id: "breaker-off-office",
    title: "Office breakers off when unused",
    pillar: "magnetism",
    summary:
      "Cut work-area circuits when not in use to lower daytime artificial field load.",
    relatedProtocolIds: ["breaker-off-office"],
    sections: [
      {
        heading: "Daytime field hygiene",
        body: "Home offices accumulate chargers, monitors, and networking gear. Switching circuits off when the room is unused reduces chronic low-level exposure for people optimizing nnEMF.",
      },
      {
        heading: "Practice",
        body: "Establish a shutdown ritual: breakers off or power strips killed when work ends. Permanent auto-log while on your list; skip on travel days.",
      },
      {
        heading: "Pairing",
        body: "Combine with nnEMF reduction blocks and outdoor low-field hours for a full Magnetism day.",
      },
    ],
  },
  {
    id: "morning-movement",
    title: "Exercise in daylight",
    pillar: "support",
    summary:
      "Walking, resistance bands, or rebounding—indoors or outdoors—with duration logged as Exercise.",
    relatedProtocolIds: ["exercise"],
    sections: [
      {
        heading: "Movement plus light",
        body: "Exercise in outdoor light couples muscle pump, lymph flow, and melanopsin drive—better than treadmill-under-fluorescents for this lifestyle frame.",
      },
      {
        heading: "Practice",
        body: "Log Exercise: pick rebounding, resistance bands, or walking; choose outdoors or indoors; then session length. Outdoor sessions earn full base points.",
      },
      {
        heading: "Read next",
        body: "See “Rebounding and the lymphatic system” for mini-trampoline context.",
      },
    ],
  },
  {
    id: "blue-light-hygiene",
    title: "Evening blue-light hygiene",
    pillar: "light",
    summary:
      "Dim screens, warm bulbs, and blue blockers after sunset—protect melatonin timing.",
    relatedProtocolIds: ["blue-light-hygiene", "screen-light-hygiene"],
    sections: [
      {
        heading: "Evening spectrum",
        body: "Melanopsin cells remain sensitive to blue-rich light after sunset. Screens and cool LEDs delay melatonin and fragment sleep architecture in controlled studies.",
      },
      {
        heading: "Practice",
        body: "After outdoor sunset when possible, dim screens, use warm lighting, or wear blockers. Log when you ran your evening hygiene routine—not every minute, but the intentional habit.",
      },
      {
        heading: "Stacking",
        body: "Sunset viewing → screen light hygiene (Night Shift / IRIS) → evening blue-light hygiene → true dark bedroom is the Light pillar night arc.",
      },
    ],
  },
  {
    id: "consistent-sleep-window",
    title: "Circadian sleep window",
    pillar: "support",
    summary:
      "Consistent bed and wake times aligned with night—anchor for glymphatic and hormone timing. Now an option inside Sleep Space.",
    relatedProtocolIds: ["consistent-sleep-window", "sleep-space"],
    sections: [
      {
        heading: "Regularity beats perfection",
        body: "Sleep medicine emphasizes consistent sleep–wake timing—even on weekends within reason—for entrainment and deep-sleep stability.",
      },
      {
        heading: "Practice",
        body: "Enable Circadian sleep window inside Sleep Space when you hit your target window, not only when exhausted. Pair with dark, cool, low-RF nights from the same stack.",
      },
      {
        heading: "Read next",
        body: "See Sleep Space for the full bedroom hygiene stack, including true dark and cool bedroom.",
      },
    ],
  },
  {
    id: "sleep-space",
    title: "Sleep Space — bedroom hygiene stack",
    pillar: "magnetism",
    summary:
      "One permanent night stack: cool temp, Magnetico, true dark, circadian sleep window, breakers, phone away, grounding mat, and negative ions — points add up from what you enable.",
    relatedProtocolIds: ["sleep-space", "work-space", "air-tube-headphones"],
    sections: [
      {
        heading: "Why one Sleep Space row",
        body: "Bedroom recovery is a stack, not a single checkbox. Cool temperature, unidirectional magnetism, true dark, a consistent sleep–wake window, cut AC circuits, phone distance, grounding, and ions all belong to the same night environment. This activity keeps them under one permanent habit so setup matches how you actually sleep.",
      },
      {
        heading: "How scoring works",
        body: "Enable only what you run. Points are the sum: cool bedroom follows the °F curve (65°F = 10 pts), Magnetico is 10/25/50 by gauss, true dark 8, circadian sleep window 7, bedroom breakers 6, phone away 5, grounding mat 10, negative ion generator 10. Auto-logs nightly while on your list; skip when traveling.",
      },
      {
        heading: "How this fits the app",
        body: "Add Sleep Space once from Edit activities. Tap the row anytime to change options. Work Space is the daytime desk counterpart; air-tube headphones stay separate for calls.",
      },
    ],
  },
  {
    id: "work-space",
    title: "Work Space — desk / office hygiene stack",
    pillar: "magnetism",
    summary:
      "Permanent daytime desk stack: office breakers, grounding mat, negative ions, and low artificial field — sum scoring, no fixed clock time.",
    relatedProtocolIds: ["work-space", "sleep-space", "air-tube-headphones"],
    sections: [
      {
        heading: "Why Work Space",
        body: "Most nnEMF and dirty-electricity exposure for desk workers happens in the workday environment. Rolling breakers, grounding, ions, and low-field desk habits into one permanent activity mirrors Sleep Space without forcing a morning-only log.",
      },
      {
        heading: "How scoring works",
        body: "Enable what you run: office breakers 6, grounding mat 10, negative ion generator 10, low artificial field 5. Points sum. Auto-logs daily with no locked time of day. Air-tube headphones remain a separate permanent for calls.",
      },
      {
        heading: "How this fits the app",
        body: "Add Work Space from Edit activities. Tap to configure. Pair with Sleep Space for a full indoor magnetism hygiene loop.",
      },
    ],
  },
];
