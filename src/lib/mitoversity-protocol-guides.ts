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
    id: "morning-natural-light",
    title: "Outdoor natural light (morning)",
    pillar: "light",
    summary:
      "Daytime outdoor light without glass—extends the morning arc beyond the sunrise window.",
    relatedProtocolIds: ["morning-natural-light"],
    sections: [
      {
        heading: "Beyond sunrise",
        body: "Sunrise keystones front-load the day; ongoing outdoor natural light keeps melanopsin drive and outdoor time high through mid-morning. This habit is multi-log: several short outdoor stops add up.",
      },
      {
        heading: "Practice",
        body: "Porch, yard, or walk without a window between you and the sky. Aim for open sky when possible. Pair with movement or grounding for a stacked Light/Magnetism morning.",
      },
      {
        heading: "How this fits the app",
        body: "Log each intentional outdoor natural-light block. It does not replace sunrise keystones for multiplier unlock but supports circadian lifestyle on days you miss dawn or want extra outdoor minutes.",
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
    id: "mineralized-water",
    title: "Purified and mineralized water",
    pillar: "water",
    summary:
      "Well-mineralized hydration—spring water or remineralized filter water, not deionized-only all day.",
    relatedProtocolIds: ["mineralized-water"],
    sections: [
      {
        heading: "Minerals in water",
        body: "Electrolytes and trace minerals support hydration that plain distilled or deionized water alone may not. Remineralize RO or purified water when that is your source.",
      },
      {
        heading: "Practice",
        body: "Drink intentional servings of mineralized water spread through the day. Log each serving. Pair with daylight-aligned hydration timing.",
      },
      {
        heading: "Deuterium context",
        body: "Source geography affects isotope content—see high-latitude glacial water and deuterium/ATP articles for the deeper Water-pillar story.",
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
      "Entry-level cold via face or brief head immersion—autonomic wake-up without full plunge gear.",
    relatedProtocolIds: ["cold-face-plunge"],
    sections: [
      {
        heading: "Trigeminal cold pathway",
        body: "Cold water on the face activates the diving reflex and sympathetic arousal—a smaller dose than full-body thermogenesis but useful for building cold tolerance.",
      },
      {
        heading: "Practice",
        body: "Brief cold water on face or head in a safe setting. Progress toward longer cold thermogenesis sessions when ready. Log each intentional exposure.",
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
    title: "Mitochondrial movement in daylight",
    pillar: "support",
    summary:
      "Zone 2, resistance, or play outdoors in morning light—exercise stacked with circadian timing.",
    relatedProtocolIds: ["morning-movement"],
    sections: [
      {
        heading: "Movement plus light",
        body: "Exercise in outdoor morning light couples muscle pump, lymph flow, and melanopsin drive—better than treadmill-under-fluorescents for this lifestyle frame.",
      },
      {
        heading: "Practice",
        body: "Walk, jog, resistance work, or play outside in daylight. Log duration in 15-minute blocks. Rebounding counts here if you own a rebounder.",
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
    relatedProtocolIds: ["blue-light-hygiene"],
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
        body: "Sunset viewing → blue-light hygiene → true dark bedroom is the Light pillar night arc.",
      },
    ],
  },
  {
    id: "consistent-sleep-window",
    title: "Circadian sleep window",
    pillar: "support",
    summary:
      "Consistent bed and wake times aligned with night—anchor for glymphatic and hormone timing.",
    relatedProtocolIds: ["consistent-sleep-window"],
    sections: [
      {
        heading: "Regularity beats perfection",
        body: "Sleep medicine emphasizes consistent sleep–wake timing—even on weekends within reason—for entrainment and deep-sleep stability.",
      },
      {
        heading: "Practice",
        body: "Log when you hit your target window, not only when exhausted. Pair with dark, cool, low-RF nights.",
      },
      {
        heading: "Read next",
        body: "See “Fully dark sleep environment” and “Cool bedroom sleep (~65 °F)” for environment levers.",
      },
    ],
  },
];
