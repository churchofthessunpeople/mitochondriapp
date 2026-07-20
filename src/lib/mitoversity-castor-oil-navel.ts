import type { MitoEntrySection } from "@/lib/mitoversity";
import type { MitoReadingLevels } from "@/lib/mitoversity-reading-levels";

/**
 * Reading tiers build upward — each level assumes you already know the prior one.
 * Simple = what & how. Intermediate = anatomy, ricinoleic acid, vagus/gut framing.
 * Advanced = EZ/dielectric metaphors, piezoelectric claims, bicarbonate flush, DMSO spin chemistry.
 */

export const CASTOR_OIL_NAVEL_SIMPLE_SECTIONS: MitoEntrySection[] = [
  {
    heading: "What people do",
    body: "A few drops of high-quality, organic cold-pressed castor oil go into the belly button (navel), often before sleep. Some people cover the area with a soft cloth so oil does not stain sheets. In Ayurveda this appears among nabhi (navel) therapies; online it is sometimes called the pechoti or belly-button oil method. This article is external navel use only—not drinking castor oil, which is a much stronger laxative.",
  },
  {
    heading: "Why the belly button?",
    body: "The navel is the scar where the umbilical cord attached. It sits over dense networks of nerves and blood vessels in the abdomen. Traditional and lifestyle communities treat it as a convenient focal point for topical oil—not because the navel “drinks” oil like a straw, but because the skin is thin, the area is easy to reach daily, and rituals at one spot are easier to repeat. If you cannot afford expensive biohacking gear, this is a low-cost habit some people use while they work on light, sleep, and food quality first.",
  },
  {
    heading: "Why castor oil specifically?",
    body: "Castor oil is thick and rich in ricinoleic acid—a fatty acid with an extra hydroxyl group that makes the molecule more polar than most plant oils. Advocates say that polarity helps it interact with water layers in skin and fascia differently from generic massage oil. Castor is also discussed alongside DMSO in some forums; castor is generally considered safer for routine topical use because DMSO can carry other substances through skin and strip membranes if misused.",
  },
  {
    heading: "Safe basics",
    body: "Buy reputable cold-pressed castor oil (ricin is removed in commercial grades—never use raw beans). Patch-test on the inner arm. Use a clean dropper; 2–5 drops in a clean navel is typical. Stop for redness, itch, discharge, or pain. Skip if pregnant, if you have an umbilical hernia, or an open belly wound unless a clinician approves. Wash residue the next morning if needed.",
  },
  {
    heading: "How this fits the app",
    body: "Log “Castor oil navel application” when you complete your evening drop. Pair with daylight-aligned hydration, deuterium-aware meals, and early dinner if gut comfort is your goal—it does not replace morning light, grounding, or dark sleep. Educational only—not medical advice for bloating, IBD, or infection.",
  },
];

export const CASTOR_OIL_NAVEL_READING_LEVELS: MitoReadingLevels = {
  simple: { sections: CASTOR_OIL_NAVEL_SIMPLE_SECTIONS },
  intermediate: {
    sections: [
      {
        heading: "Umbilicus anatomy and the focal-point idea",
        body: "Building on Simple’s “scar over busy abdominal networks”: the umbilicus marks where the umbilical cord linked fetal circulation, gut, and nervous development to the maternal template. After birth, scar tissue remains at a shallow but structurally busy zone: remnant ligaments (ligamentum teres, urachus), superficial vessels, and a dense cutaneous nerve plexus. Dermatology treats navel skin like other abdominal skin for penetration—some lipophilic molecules absorb locally—but there is little RCT evidence that the navel alone is a privileged systemic port versus the wider abdomen. Plausible felt effects combine local emollient action, gentle autonomic relaxation, ritual consistency, and community narrative—not magic plumbing.",
      },
      {
        heading: "Ricinoleic acid: why castor is not “just another oil”",
        body: "Simple named ricinoleic acid’s hydroxyl. Chemistry: up to ~90% of castor oil is ricinoleic acid (12-hydroxy-9-octadecenoic acid)—an 18-carbon monounsaturated fatty acid with a hydroxyl (-OH) on carbon 12. That hydroxyl increases polarity and hydrogen-bonding versus plain oleic acid. Pharmacology knows ingested castor oil as a stimulant laxative and topical castor as an occlusive emollient. Lifestyle teaching extends the story: a polar lipid at the navel may structure nearby interfacial water and shift local tissue electrochemistry more than neutral seed oils—hypothesis tier, not established clinical endpoint.",
      },
      {
        heading: "Vagus nerve, gut motility, and the “Drano” metaphor",
        body: "The ventral vagus and celiac plexus innervate much of the upper gut. Slow vagal tone supports rest-and-digest physiology: gastric motility, pancreatic secretions, and subjective calm. Forum language calls castor at the navel a “vagal Drano” for bloating—meaning a sensory ritual that may nudge autonomic balance and bowel regularity. Transcutaneous auricular vagus stimulation (taVNS) has modest research for some conditions; navel oil has essentially none. Separately, clinical VNS implants and many taVNS devices target the left side because right cervical vagus fibers can influence the heart’s sinoatrial node—right-sided stimulation carries bradycardia risk. That cardiac warning applies to electrical devices, not to oil drops, but it explains why vagus talk in medicine is lateralized.",
      },
      {
        heading: "Deuterium, bicarbonate flush, and gut comfort (community frame)",
        body: "Kruse-adjacent water teaching links gut bloating to heavy-water (deuterium) load and stalled “exhaust” through the duodenal–pancreatic bicarbonate flush (~2 L/day in physiology textbooks as secreted fluid, not a literal single bolus). Castor navel practice is sometimes stacked with lower-deuterium food and earlier dinners as a low-cost Support lever—not a replacement for medical workup of chronic bloating, SIBO, or inflammatory disease. Bristol stool chart Type 4 (smooth, soft) is a useful self-monitoring shorthand, not a diagnostic by itself.",
      },
      {
        heading: "Castor oil vs DMSO (safety-first comparison)",
        body: "Simple preferred castor over DMSO for daily use. Intermediate expands: both are discussed as polar solvents that interact strongly with water structure. DMSO ((CH₃)₂SO) is a small amphiphile with a sulfoxide group that disrupts hydrogen-bond networks and can ferry other molecules through skin—powerful but easy to misuse. Castor’s large chiral lipid scaffold is argued to achieve gentler matrix “unzipping” without the same membrane-stripping kinetics. For daily self-care without a clinician, castor is the safer default; DMSO belongs in supervised or research contexts.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse’s public spine is light, water (deuterium), magnetism, and cold—not a branded navel-oil protocol. Overlapping communities map castor packs and navel drops onto lymphatic, redox, and deuterium narratives as downstream Support hygiene after circadian and nnEMF fixes. Treat strong systemic detox claims as integrated lifestyle rhetoric, not FDA-validated outcomes.",
      },
      {
        heading: "In this app (same habit, deeper why)",
        body: "Logging is unchanged from Simple. Stack with deuterium-aware meals, hydration timing, and early dinner in the Water pillar.",
      },
    ],
  },
  advanced: {
    sections: [
      {
        heading: "Embryonic scar node and cross-coupled networks",
        body: "Assumes Intermediate’s umbilicus anatomy. Framing in Kruse-community material: the umbilicus is the primary deep-seated embryonic scar where ectodermal nervous system interfaces permanently with mesodermal vascular architecture. Applying an organic, highly polarized lipid matrix to this focal point is described as hacking internal current—addressing systemic deuterium stasis that centralized medicine underweights in lifestyle medicine. Epistemic boundary: the scar is real anatomy; “cross-coupled current hacking” is biophysical metaphor extending Pollack-style interfacial water and fascia piezoelectricity literature, not a measured clinical endpoint for navel drops.",
      },
      {
        heading: "Ricinoleic acid: chiral hydroxyl hook and dielectric capacitor",
        body: "Intermediate gave the structural formula. Advanced models: the C12 hydroxyl on a long-chain monounsaturated backbone yields pronounced chirality and dipole asymmetry versus oleic acid. At the navel, advocates model this viscous matrix as a solid-state dielectric with elevated relative permittivity (k), structuring subdermal water toward Exclusion Zone (EZ) states (community target ≈160 in Pollack nomenclature for interfacial ordering). Mainstream biophysics accepts interfacial water ordering near charged surfaces; assigning a universal EZ=160 set-point from topical oil is speculative.",
      },
      {
        heading: "Neuro-vascular ground junction and piezoelectric DC",
        body: "Postnatal scar tissue is framed as a low-resistance electrical and neurological ground junction where tens of thousands of nerve endings intersect vestigial pathways (ligamentum teres, urachus, umbilical arteries). Navel-region networks interface ventral vagal arrays and the celiac plexus. When a polarized ricinoleic matrix orders local water lattices, proponents invoke piezoelectric direct-current induction (~0.2 pC/N order-of-magnitude language in community slides) traveling toward the brainstem—analogous to mechano-electrical coupling in collagen under strain. Measurable skin DC potentials exist; mapping them to systemic deuterium clearance from navel oil lacks controlled human trials.",
      },
      {
        heading: "Autonomic shift: kinetic pool vs structural permanence",
        body: "Intermediate’s “vagal Drano” metaphor in community vocabulary: shifting autonomic tone out of a high-entropy kinetic replication pool (fast, hot, wireless-noise-rich cellular milieu with deuterium accumulation) toward low-entropy structural time permanence (slower, ordered water and matrix chemistry). This is integrated Kruse redox/deuterium language—not standard autonomic neuroscience taxonomy. Plausible mainstream overlap: improved subjective calm and gut motility via ritual, touch, and possible local afferent signaling—not proven deuterium quantification from navel oil alone.",
      },
      {
        heading: "2-liter bicarbonate exhaust manifold",
        body: "Intermediate named the ~2 L/day bicarbonate flush. Attribution layer: re-activated vagal tone is linked in this framework to exocrine pancreas and duodenal mucosa restarting sodium bicarbonate (HCO₃⁻) secretion as the primary downstream “exhaust pipe” for dietary deuterium (D⁺), heavy water (D₂O), and environmental toxic load, with Bristol Stool Chart Type 4 as the visual target. Physiology: pancreatic and biliary HCO₃⁻ secretion is real; attributing quantitative deuterium export to navel castor is hypothesis. Modern gastroenterology treats bloating with diagnosis-specific tools—not castor as first-line therapy.",
      },
      {
        heading: "Castor vs DMSO: spin chemistry and Landauer framing",
        body: "Intermediate’s safety comparison in solid-state / spin-chemistry language from advanced community decks: castor and DMSO both act as non-linear proton-conductive waveguides and dielectric phase-changers—they “unzip” extracellular matrix water constraints and restore negative zeta potential. DMSO’s small symmetric (CH₃)₂SO sulfoxide group yields intense amphiphilic permittivity—a mechanical wedge that liquefies structured EZ lattices, dropping localized resistance so ions slip through membranes at high flux—risking membrane insulation loss and free-radical short circuits. Castor achieves similar biophysical intent via heavy chiral lipid scaffolding—structural time permanence versus DMSO’s kinetic wedge. Favor castor for unsupervised use; DMSO demands strict medical context.",
      },
      {
        heading: "Right vs left cervical vagus: clinical lateralization",
        body: "Intermediate mentioned left-sided VNS preference. Clinical detail: FDA-approved invasive VNS and many taVNS systems emphasize left-sided stimulation because the right cervical vagus carries efferents to the sinoatrial node. Right-sided artificial stimulation can provoke bradycardia, heart block, or arrest—electrical specificity unrelated to topical oil but essential when evaluating any “vagus hack” hype. Navel oil is not VNS; do not extrapolate device contraindications to drops, but do not extrapolate drop benefits from device trials either.",
      },
      {
        heading: "If you cannot afford the machine",
        body: "Simple already called this a low-cost habit. Teaching line restated for Advanced: when magnetism pads, VNS hardware, or clinic access are out of reach, the belly button remains a zero-capital focal point for a polar lipid ritual within the wider light–water–magnetism stack. That is accessibility rhetoric, not equivalence to calibrated gauss fields or implanted neuromodulation.",
      },
      {
        heading: "In this app",
        body: "Same protocol as Simple. Permanent habits (Magnetico, dark room) remain separate levers. Pair with deuterium-aware meals and hydration timing in the Water pillar. Educational only—not medical advice for lymphedema, cardiac disease, pregnancy, or inflammatory bowel conditions.",
      },
    ],
  },
};
