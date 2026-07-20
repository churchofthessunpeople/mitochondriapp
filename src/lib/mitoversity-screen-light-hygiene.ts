import type { MitoEntrySection } from "@/lib/mitoversity";
import type { MitoReadingLevels } from "@/lib/mitoversity-reading-levels";

/**
 * Reading tiers build upward — each level assumes you already know the prior one.
 * Simple = what & how. Intermediate = melanopsin, aggressive filters, multi-device stack.
 * Advanced = display spectral physics, IRIS architecture, DLMO kinetics, PWM/nnEMF.
 */

export const SCREEN_LIGHT_HYGIENE_SIMPLE_SECTIONS: MitoEntrySection[] = [
  {
    heading: "What this habit is",
    body: "Screen light hygiene means stripping as much blue light as possible from phones, tablets, and computers—especially after sunset. Cool white screens hit melanopsin-rich cells in the eye and can delay melatonin. Warm, amber, or red-shifted displays send a “dim evening” signal instead of noon sky on glass.",
  },
  {
    heading: "Built-in night modes",
    body: "Use your device’s native warm-screen setting and turn it up aggressively: iPhone/iPad Night Shift, Mac Night Shift, Windows Night Light, Android Night Light / Eye Comfort. Schedule them at or before sunset, not midnight. Lower brightness too—color temperature alone is not enough if the panel is blindingly bright.",
  },
  {
    heading: "IRIS and other desktop tools",
    body: "On laptops and desktops, built-in toggles help but often leave residual blue. IRIS (iris-tech.com) is a popular third-party app that pushes screens much warmer, can follow sunset automatically, and adjusts per monitor. f.lux is a similar long-standing option. Pick one stack and run it on every screen you use after dark.",
  },
  {
    heading: "How to log",
    body: "Log when your evening screen session ran with blue stripped—night modes on, IRIS/f.lux active, brightness down. This is the display-specific layer; pair it with “Evening blue-light hygiene” for room bulbs and glasses, and sunset viewing for outdoor light first.",
  },
  {
    heading: "How this fits the app",
    body: "Log “Screen light hygiene” each evening you keep warm-screen settings active while using devices. Educational only—not a treatment for insomnia; fix morning outdoor light and bedroom darkness too.",
  },
];

export const SCREEN_LIGHT_HYGIENE_READING_LEVELS: MitoReadingLevels = {
  simple: { sections: SCREEN_LIGHT_HYGIENE_SIMPLE_SECTIONS },
  intermediate: {
    sections: [
      {
        heading: "Melanopsin and why screens matter at night",
        body: "Building on Simple’s “cool screens delay melatonin”: intrinsically photosensitive retinal ganglion cells (ipRGCs) containing melanopsin drive circadian phase, melatonin suppression, and alertness. Their action spectrum peaks in blue-cyan (~480 nm). LED backlights and phone OLEDs emit strong short-wavelength content even when content looks “white.” Evening exposure delays melatonin onset and shifts clock phase later in controlled human studies—dose depends on intensity, duration, and spectrum.",
      },
      {
        heading: "Night mode vs aggressive filtering",
        body: "Simple named Night Shift / Night Light and IRIS/f.lux. Why go further: OS warm modes apply a color matrix but often cap how red the image can get—partly for color accuracy and app compatibility. IRIS and f.lux can push further into amber/red, reduce brightness independently, pause on video if configured, and sync to solar time. Trade-off: color-critical work (photo, design) suffers; schedule aggressive modes after work hours or use per-app exceptions.",
      },
      {
        heading: "Multi-device checklist",
        body: "Simple said run warm settings on every screen. Checklist: phone, tablet, laptop, desktop monitor, and TV each need their own setting—forgetting one bright panel resets the signal. Enable automatic sunset schedules tied to location. On iOS: Settings → Display & Brightness → Night Shift (Maximum warmth). Windows: Settings → System → Display → Night light. Android: Display → Eye comfort / Night Light. Mac: System Settings → Displays → Night Shift. Desktop: install IRIS or f.lux if built-in modes feel too blue.",
      },
      {
        heading: "Not a substitute for room light or glasses",
        body: "Simple paired this habit with evening blue-light hygiene. Intermediate adds: warm screens do not fix overhead cool LEDs in the room or street light through curtains. Orange/amber blue-blocking glasses add retinal protection when you must view true-color content. Stack order: sunset viewing → screen warm → room dim → dark bedroom.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s light pillar stresses denying blue at night after you have received outdoor morning and sunset signals. He treats nnEMF screens as dual insult—spectrum and timing—not just “sleep hygiene.” Strong claims that warm software alone restores mitochondrial recovery are teaching framework; combine with true dark sleep and phone-away-from-bed.",
      },
      {
        heading: "In this app (same habit, deeper why)",
        body: "Logging is unchanged from Simple. Stack with catalog “Evening blue-light hygiene” and “True dark sleep environment.”",
      },
    ],
  },
  advanced: {
    sections: [
      {
        heading: "Spectral physics of displays",
        body: "Assumes Intermediate’s melanopsin picture. White LED LCDs use blue pump LEDs with phosphor down-conversion; OLED subpixels emit narrow red, green, and blue with strong 440–490 nm content at “6500 K” white point. Software night modes apply 3×3 color transforms or gamma shifts—reducing melanopic equivalent daylight illuminance (melanopic EDI) but not always below evening targets (~10 melanopic lux is sometimes cited for circadian hygiene; bright phone at “warm” setting can still exceed this). Hardware filters and aggressive LUTs (IRIS “Groot” / extreme red modes) lower melanopic irradiance further at cost of CRI and task performance.",
      },
      {
        heading: "IRIS architecture (representative third-party stack)",
        body: "Intermediate said IRIS/f.lux push further than OS modes. Architecture: IRIS intercepts GPU output on Windows/macOS/Linux, applies scheduled color temperature curves, optional PWM flicker reduction heuristics, break reminders, and per-monitor profiles. Solar sync uses civil twilight tables. Compared to f.lux (similar pipeline, long research history in circadian community), IRIS markets deeper red presets for late night. Neither replaces ophthalmic care; both address display metrology, not ambient room SPD.",
      },
      {
        heading: "Circadian phase and melatonin kinetics",
        body: "Intermediate named phase delay and melatonin suppression. Kinetics: evening blue-rich light shifts the human phase response curve toward delay; melatonin onset (dim light melatonin onset, DLMO) moves later with sustained exposure. Warm-screen interventions reduce but may not eliminate suppression if luminance stays high. Polysomnography studies link pre-sleep screen use to reduced REM/slow-wave proportions in some cohorts—confounded by content and anxiety. Interpret screen hygiene as reducing melanopic dose, not guaranteeing sleep architecture.",
      },
      {
        heading: "PWM flicker and nnEMF coupling",
        body: "Some panels dim via pulse-width modulation at kHz frequencies—invisible flicker that still stresses sensitive users and couples with Kruse-style nnEMF narratives (time-varying fields plus temporal light modulation). IRIS/f.lux brightness lowering can reduce PWM duty cycle on some hardware. Separate from spectrum: airplane mode and distance address RF; spectrum tools address the photon channel.",
      },
      {
        heading: "Differentiation from “Evening blue-light hygiene” in this app",
        body: "Catalog “Evening blue-light hygiene” (Sleep category) logs the broader evening routine—bulbs, blockers, dim environment. “Screen light hygiene” (Light category) logs device-level blue stripping—Night Shift, Night Light, IRIS, f.lux at maximum practical warmth. Log both when you run the full stack.",
      },
      {
        heading: "In this app",
        body: "Same protocol as Simple: evening Light-pillar checkbox for display configuration maintained during device use. Points track behavior, not melatonin assays. Educational only.",
      },
    ],
  },
};
