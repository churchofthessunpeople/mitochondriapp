import type { MitoEntrySection } from "@/lib/mitoversity";
import type { MitoReadingLevels } from "@/lib/mitoversity-reading-levels";

/**
 * Reading tiers build upward — each level assumes you already know the prior one.
 * Simple = what & how. Intermediate = 40 Hz gamma / 128 Hz parasympathetic framing.
 * Advanced = entrainment kinetics, Otto topology, epistemic limits.
 */

export const TUNING_FORKS_SIMPLE_SECTIONS: MitoEntrySection[] = [
  {
    heading: "What this habit is",
    body: "Tuning forks are metal instruments that vibrate at a fixed frequency when struck. In this lifestyle stack they are used for short, intentional sound and bone-conducted vibration sessions—not as music therapy appointments or medical devices. You need physical forks to log the habit; phone tone apps alone do not count.",
  },
  {
    heading: "Recommended: 40 Hz",
    body: "Prefer a 40 Hz fork (or a short 40 Hz listening / near-field session) as the default. Forty hertz sits in the gamma-band range often discussed for rhythmic sensory stimulation and focused calm. Keep sessions short and deliberate—strike, listen or place, breathe, repeat—rather than blasting sound for an hour.",
  },
  {
    heading: "Suggested: C128 (128 Hz) on the body",
    body: "A weighted C128 (128 Hz) “Otto-style” fork is commonly used on bone for a parasympathetic / calm-down circuit. Activate on the palm, then place the stem on: crown, forehead, mastoid behind each ear, TMJ in front of each ear, manubrium (upper sternum), xiphoid (lower sternum), and sacrum between the posterior dimples—typically three activations per spot. This matches popular instructional demos of the C128 for cortisol-oriented self-care (e.g. on-body placement routines).",
  },
  {
    heading: "Safe basics",
    body: "Do not strike forks on hard surfaces that chip tines or injure skin. Avoid pressing hard on swollen joints, fresh injuries, or implants without clinician guidance. Stop for dizziness, ear pain, or headache. Not for use as treatment of anxiety disorders, endocrine disease, or neurological conditions.",
  },
  {
    heading: "How this fits the app",
    body: "Log “Tuning forks” for each intentional session. Duration scales in 15-minute blocks (cap 45). Equipment is required—leave it off your list if you do not own forks. Pair with dark evening light hygiene and phone-away-from-bed when you use forks to wind down. Educational only.",
  },
];

export const TUNING_FORKS_READING_LEVELS: MitoReadingLevels = {
  simple: { sections: TUNING_FORKS_SIMPLE_SECTIONS },
  intermediate: {
    sections: [
      {
        heading: "Why 40 Hz is the app default",
        body: "Building on Simple: gamma-band (~30–80 Hz) activity in cortex is linked to attention and sensory binding; 40 Hz is a common experimental stimulus frequency in human and animal sensory-entrainment work (auditory, visual, or combined). Lifestyle use of a 40 Hz fork is a practical, low-tech way to deliver a rhythmic acoustic/vibratory cue—not a claim that a fork replicates clinic-grade multisensory 40 Hz protocols or treats disease.",
      },
      {
        heading: "Why C128 shows up for body contact",
        body: "Weighted 128 Hz forks (often sold as C128 / Otto tuners) emphasize stem vibration into bone more than loud air tone. Instructors place them on skull and axial landmarks—mastoid, TMJ, sternum, sacrum—arguing for vagal / parasympathetic settling and lower subjective stress. The three-activations-per-spot circuit in Simple follows that teaching style. Evidence for cortisol reduction from consumer forks is anecdotal and demo-driven; treat it as a calm ritual with plausible autonomic framing, not a lab assay.",
      },
      {
        heading: "Air conduction vs bone conduction",
        body: "Holding a ringing fork near the ear is mostly airborne sound. Pressing the stem to bone couples mechanical vibration into tissue and the skull—different sensory path, often stronger “felt” dose at the same nominal Hz. C128 body work leans on bone contact; 40 Hz sessions may be either near-ear listening or gentle contact, depending on your fork’s weight and comfort.",
      },
      {
        heading: "Where this sits vs Kruse’s stack",
        body: "Kruse’s public spine is light, water, magnetism, and cold—not a branded tuning-fork protocol. Sound and vibration habits show up in overlapping wellness communities as Support hygiene after circadian and nnEMF basics. Do not let forks replace morning outdoor light, dark sleep, or low-RF nights.",
      },
      {
        heading: "In this app (same habit, deeper why)",
        body: "Logging and 15-minute scoring are unchanged from Simple. Prefer logging real metal-fork time; stack with evening blue-light hygiene when the goal is wind-down.",
      },
    ],
  },
  advanced: {
    sections: [
      {
        heading: "Entrainment and dose limits",
        body: "Assumes Intermediate’s 40 Hz framing. Auditory steady-state responses and gamma entrainment depend on intensity, duration, carrier spectrum, and individual hearing. Consumer forks deliver narrowband mechanical energy with rapidly decaying amplitude after each strike—very different from continuous 40 Hz noise or LED flicker protocols used in research. This app’s checkbox does not measure EEG, cortisol, or heart-rate variability.",
      },
      {
        heading: "Otto / C128 topology and autonomic narrative",
        body: "Weighted forks shift energy into the stem for osteophonic (bone) use. Landmark circuits (mastoid near cranial nerve pathways, sternum near vagal afferent fields, sacrum as axial terminus) are teaching maps, not FDA indications. Parasympathetic “cortisol lowering” language in demo videos is instructional rhetoric; controlled trials of C128 self-application for endocrine endpoints are sparse.",
      },
      {
        heading: "Frequency choice vs musical pitch",
        body: "“C128” names a pitch class near musical C3 (~130.8 Hz in equal temperament); labeled therapy forks target ~128 Hz. Forty hertz is sub-musical as a pure tone for many listeners and is chosen for neural-band association, not melody. Do not confuse solfeggio marketing frequencies with either the 40 Hz default or the C128 body protocol.",
      },
      {
        heading: "Epistemic boundary",
        body: "Established: tuning forks vibrate at stable frequencies; bone conduction transmits vibration; rhythmic sound can alter subjective arousal. Speculative: a home C128 circuit meaningfully lowers systemic cortisol, or 40 Hz fork use equals research-grade gamma therapy. Log behavior only.",
      },
      {
        heading: "In this app",
        body: "Same protocol and duration scoring as Simple. Points track intentional sessions, not biomarker change.",
      },
    ],
  },
};
