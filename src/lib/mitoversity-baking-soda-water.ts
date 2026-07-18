import type { MitoEntrySection } from "@/lib/mitoversity";
import type { MitoReadingLevels } from "@/lib/mitoversity-reading-levels";

export const BAKING_SODA_WATER_SIMPLE_SECTIONS: MitoEntrySection[] = [
  {
    heading: "What to do",
    body: "Dissolve ¼ teaspoon of plain baking soda (sodium bicarbonate—not baking powder) in a full glass of water. Drink it twice daily. Take each dose at least 2 hours away from meals so it does not fight stomach acid needed for digestion. Log each serving in the app when you complete it.",
  },
  {
    heading: "Baking soda water vs sparkling water",
    body: "Baking soda in water makes a mildly alkaline sodium bicarbonate solution—no bubbles unless you add acid. Carbonated water is the opposite: dissolved CO₂ makes it acidic and fizzy. Both touch the same CO₂–bicarbonate chemistry in the body, but they arrive differently. This habit is the alkaline bicarbonate route, not soda water.",
  },
  {
    heading: "Why people drink it",
    body: "Sodium bicarbonate buffers acid. Doctors sometimes use it for kidney disease and acid–base balance under supervision. A Medical College of Georgia study (Journal of Immunology) found that drinking bicarbonate in water shifted immune cells toward a less inflammatory profile in rats and healthy volunteers—partly via signals from mesothelial cells on the spleen. That is early research, not a cure for autoimmune disease—but it explains why the habit shows up in mitochondrial lifestyle stacks.",
  },
  {
    heading: "Safe basics",
    body: "Use plain sodium bicarbonate only. Extra sodium matters if you have high blood pressure, heart failure, or kidney limits—ask your clinician first. Do not stack large doses of antacids. Stop if you feel unwell. This is a hydration adjunct, not a replacement for meals, sleep, or morning light.",
  },
  {
    heading: "How this fits the app",
    body: "Log “Baking soda water” for each ¼-tsp dose (twice daily when you follow the full protocol). Pair with mineralized water, daylight-aligned hydration, and deuterium-aware meals in the Water pillar. Educational only—not medical advice for kidney disease, autoimmunity, or blood pressure.",
  },
];

export const BAKING_SODA_WATER_READING_LEVELS: MitoReadingLevels = {
  simple: { sections: BAKING_SODA_WATER_SIMPLE_SECTIONS },
  intermediate: {
    sections: [
      {
        heading: "Carbonic anhydrase and the CO₂–bicarbonate cycle",
        body: "In blood and tissues, carbon dioxide and water convert to carbonic acid and then bicarbonate and protons: CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻. Carbonic anhydrase enzymes speed this reversible reaction. Healthy mitochondria produce CO₂ as a normal aerobic end product; acid–base handling keeps proton load manageable. Oral bicarbonate adds buffer capacity on the alkaline side of that system—distinct from drinking acidic sparkling water that delivers dissolved CO₂.",
      },
      {
        heading: "Where Dr. Jack Kruse’s teaching is specific",
        body: "Kruse frames bicarbonate as addressing a “proton problem” in mitochondria and autoimmune milieu: carbonic anhydrases move protons to and fro, healthy mitochondria make water and CO₂, and he links that chemistry to why buffering matters in modern nnEMF-rich environments. He notes carbonic anhydrases are zinc metalloenzymes—so artificial EMF is argued to perturb transition-metal enzyme chemistry (a community “mitohack” narrative alongside 1G–5G reduction). Those integrated claims are his teaching layer; they extend mainstream acid–base physiology into lifestyle prescription, not proven personal EMF dosing from this app.",
      },
      {
        heading: "Augusta University / MCG immunology study (2018)",
        body: "Scientists at the Medical College of Georgia reported that rats and healthy human volunteers drinking sodium bicarbonate in water triggered stomach acid secretion for the next meal and signaled mesothelial cells on the spleen that a full inflammatory response was not needed—described as “it’s most likely a hamburger not a bacterial infection.” Via acetylcholine signaling, macrophages in spleen, blood, and kidneys shifted from pro-inflammatory M1 toward anti-inflammatory M2 phenotypes; regulatory T cells also rose. In humans the anti-inflammatory shift lasted at least four hours; in rats up to three days. The work began in hypertension and chronic kidney disease models where bicarbonate therapy already slows some kidney progression.",
      },
      {
        heading: "Kidney disease and clinical bicarbonate",
        body: "Impaired kidneys can fail to excrete acid, making blood too acidic—raising cardiovascular and bone risk. Clinical trials showed daily bicarbonate can reduce acidity and slow some kidney disease progression; nephrologists now offer it as therapy when appropriate. Self-supplementing without labs or supervision is different from prescribed dosing—this article documents the habit’s rationale, not a treatment plan.",
      },
      {
        heading: "Meal spacing: why 2+ hours",
        body: "Stomach acid digests protein and ionizes minerals; taking bicarbonate too close to food neutralizes acid transiently and can impair digestion or cause bloating. Spacing doses at least two hours before or after meals matches both community practice and the MCG observation that bicarbonate primes the stomach to make more acid for the next meal rather than replacing digestive acid during eating.",
      },
      {
        heading: "How this fits the app",
        body: "Log each ¼-tsp glass separately (twice daily on full protocol). Contrast with “Carbonated / sparkling water” for the acidic CO₂ route. Stack with hydration timing so late-night sodium loads do not disrupt sleep.",
      },
    ],
  },
  advanced: {
    sections: [
      {
        heading: "Reaction kinetics and buffer chemistry",
        body: "The hydration of CO₂ to bicarbonate is slow uncatalyzed; carbonic anhydrase isoforms (CA I–XV, with CA II and CA IV especially relevant in blood and gut) accelerate interconversion by orders of magnitude. Active sites are zinc-dependent metalloenzymes—sensitive in principle to metal chemistry and local pH microdomains. Ingested NaHCO₃ dissociates to Na⁺ and HCO₃⁻; gastric acid (HCl) converts some bicarbonate to CO₂ gas (eructation) while systemic absorption raises plasma bicarbonate and shifts Henderson–Hasselbalch balance. Sparkling water adds CO₂ from the acidic side; bicarbonate water adds buffer from the alkaline side—converging on the same equilibrium pool with different transient gastric effects.",
      },
      {
        heading: "Mitochondrial CO₂ production and proton load",
        body: "Aerobic respiration yields CO₂ from pyruvate decarboxylation and the TCA cycle; CO₂ diffusion and bicarbonate export manage mitochondrial and cytosolic proton burden. Kruse-community teaching maps autoimmune and “AI” (autoimmune/inflammatory) phenotypes to stalled proton handling and impaired CO₂/H₂O cycling—bicarbonate supplementation framed as catalytic support for carbonic anhydrase–coupled resolution, not merely “antacid wellness.” Epistemic boundary: mitochondrial disease diagnosis requires medicine; oral bicarbonate is not a targeted mitochondrial drug.",
      },
      {
        heading: "Mesothelial cholinergic anti-inflammatory axis",
        body: "Mesothelial cells line serosal cavities and organ surfaces with microvilli that sense the environment. O’Connor et al. (J Immunology, 2018) proposed that oral bicarbonate activates mesothelial signaling to the spleen through acetylcholine, dampening unnecessary innate activation. Macrophage polarization (M1 → M2), regulatory T-cell expansion, and similar shifts appeared in kidney, spleen, and peripheral blood. Mechanism remains incompletely mapped in humans; effect size and indication for healthy people drinking ¼ tsp twice daily are not established by long-term RCTs.",
      },
      {
        heading: "Zinc metalloenzymes and nnEMF hypothesis",
        body: "Carbonic anhydrase zinc centers participate in proton shuttling during catalysis. Kruse’s public material extrapolates to nnEMF (1G–5G) perturbation of transition-metal enzyme kinetics as part of a broader magnetism-pillar mitigation stack—alongside distance from routers, phone-away-from-bed, and grounding. No in-app measurement validates personal EMF–CA coupling; treat as framework hypothesis requiring independent environmental reduction and clinical labs where disease is present.",
      },
      {
        heading: "Sodium load, contraindications, and dosing",
        body: "¼ tsp NaHCO₃ ≈ 600 mg sodium bicarbonate (~170 mg sodium per dose; ~340 mg sodium/day at two doses)—material for hypertensive, heart-failure, or sodium-restricted kidney patients. Contraindications include metabolic alkalosis, edema, and unsupervised use in advanced CKD. Baking powder contains aluminum or acid salts—use sodium bicarbonate only. Separate from PPI/H2-blocker stacks without clinician review.",
      },
      {
        heading: "Contrast with carbonated water in this app",
        body: "Catalog “Carbonated / sparkling water” logs acidic CO₂-rich hydration (Bohr-effect, gastric CO₂ release narratives). “Baking soda water” logs alkaline bicarbonate buffer—complementary chemistry, not interchangeable. Some users run both on different schedules; meal spacing applies especially to bicarbonate doses.",
      },
      {
        heading: "How this fits the app",
        body: "Protocol baking-soda-water: multi-log anytime activity, ¼ tsp per serving, community standard twice daily ≥2 h from meals. Points track behavior, not M1/M2 cell counts. Educational only—not immunotherapy, not nephrology prescription.",
      },
    ],
  },
};
