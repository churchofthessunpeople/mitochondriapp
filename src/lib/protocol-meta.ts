/**
 * Extra catalog metadata not stored in DB (equipment / how-to).
 * Keeps migrations light while improving catalog UX.
 */

import { PROTOCOL_ARTICLE_IDS } from "@/lib/protocol-article-map";

export type EquipmentNeed = "none" | "optional" | "required";

/** Flat choice for multi-option activities (Grounding, Vagus, etc.). */
export type ActivityModeOption = {
  id: string;
  label: string;
  detail: string;
  points: number;
};

export type ProtocolMeta = {
  equipment: EquipmentNeed;
  how?: string;
  /** Primary Mitoversity article for this activity */
  articleId?: string;
  /** Editable mode list for simple multi-option activities */
  options?: ActivityModeOption[];
};

const DEFAULT: ProtocolMeta = { equipment: "none" };

const PROTOCOL_META_RAW: Record<string, ProtocolMeta> = {
  "sunrise-horizon": {
    equipment: "none",
    how: "Be outside before the sun clears the horizon. Look at the solar disk with bare eyes — no sunglasses, no window glass between you and the sky.\n\nFull points when your viewing session falls within 15 minutes before or after local sunrise; each minute outside costs 1 point (worst edge of start/finish). Skin, grounding, and sunglasses adjust your day boost on the check-in.\n\nTap Learn more for why sunrise light retunes mitochondrial fat-burning and circadian clocks.",
  },
  "sunrise-open-sky": {
    equipment: "none",
    how: "Get outside in the morning under a reasonably open sky — yard, park, or balcony with wide sky view.\n\nEyes open to outdoor light (no sunglasses). A few minutes is enough; longer is fine if you have time.\n\nTap Learn more for why morning outdoor light is the day’s metabolic reset.",
  },
  "sunrise-outside": {
    equipment: "none",
    how: "Step outside in the morning even if trees, buildings, or heavy cloud limit the view.\n\nAny outdoor morning light to the eyes counts — porch, street, or trail. No glass between you and the sky if you can avoid it.\n\nTap Learn more for the full sunrise / mitochondria lesson.",
  },
  "sun-exposure": {
    equipment: "none",
    how: "Log outdoor time: pick morning, peak sun, or afternoon (from Place sun times), whether you were in full sun or shade, and how long you stayed.\n\nSlots: morning (sunrise → 1.5 hours before solar noon), peak sun (±1.5 hours around solar noon — the symmetrical UVB window), afternoon (then → sunset). Full sun scores higher than shade. Stay within a non-burning window. Sunrise check-in is separate — it unlocks the day boost.",
  },
  "sunset-viewing": {
    equipment: "none",
    how: "Watch the actual sunset outdoors with bare eyes — no sunglasses in that window.\n\nStay outside as the sky dims, then move indoors and dim artificial light afterward.",
  },
  "red-nir-light": {
    equipment: "optional",
    how: "Prefer natural dusk red light outdoors when possible. If you own a red/NIR panel, use it per the device guidance.\n\nLog duration in 15-minute blocks or set custom minutes.",
  },
  "barefoot-earth": {
    equipment: "none",
    how: "Pick Barefoot (feet on soil, grass, sand, or stone — 5 pts) or Make like the Sphinx (belly / torso on the earth for fuller contact — 10 pts).\n\nPrefer real earth over asphalt when you can. Log each intentional session.",
  },
  "nature-contact": {
    equipment: "none",
    how: "Spend time in green or blue space — park, trail, beach, or garden — away from dense screens and routers when possible.\n\nLog duration in 15-minute blocks; aim for unhurried outdoor time.",
  },
  "low-d-hydration": {
    equipment: "optional",
    how: "First mineralized water of the day outdoors or through an open door — not only through glass.\n\nPlain filtered water with minerals added counts; prioritize quality and timing before heavy indoor work.",
  },
  "mineralized-water": {
    equipment: "optional",
    how: "Now part of Drinking water. Choose reverse osmosis, spring, or deuterium-depleted, then remineralization and still vs carbonated.",
  },
  "carbonated-water": {
    equipment: "optional",
    how: "Now part of Drinking water. Choose Carbonated on the last step — unsweetened sparkling only, not sugary soda.",
  },
  "baking-soda-water": {
    equipment: "none",
    how: "Now part of Vagus nerve stimulation. Choose Baking soda water (¼ tsp sodium bicarbonate in a glass). Take at least 2 hours from meals. Ask your clinician first if you have high blood pressure, heart failure, kidney disease, or sodium restrictions.",
  },
  "drinking-water": {
    equipment: "optional",
    how: "Log each intentional glass:\n\n1) Source — reverse osmosis, spring, or deuterium-depleted water.\n2) If DDW — deuterium PPM on the label (lower is more depleted; natural water is ~150 ppm).\n3) Remineralization — none or sea/electrolyte salt, then amount when applicable.\n4) Still or carbonated (not sugary soda).\n\nSpread servings through the day. Baking soda water is logged under Vagus nerve stimulation.",
  },
  "hydration-timing": {
    equipment: "none",
    how: "Front-load hydration earlier in the day; taper large volumes in the last few hours before sleep.\n\nLog when you deliberately shifted timing — earlier glasses, less late chugging.",
  },
  "castor-oil-navel": {
    equipment: "required",
    how: "Now part of Vagus nerve stimulation. Choose Castor oil navel.\n\nUse organic, cold-pressed castor oil from a reputable source (commercial grades have ricin removed — never use raw castor beans).\n\nClean and dry the navel. With a clean dropper, place 2–5 drops in the belly button. Optional: cover with a small soft cloth if you are lying down so sheets do not stain.\n\nTypical timing is before sleep; wash any residue the next morning if needed. Patch-test on the inner arm first. Stop for redness, itch, or discharge. Do not use if pregnant, with an umbilical hernia, or an open belly wound unless a clinician approves. External navel use only — do not drink castor oil as part of this habit.",
  },
  "vagus-nerve-stimulation": {
    equipment: "optional",
    how: "Pick one vagus-stimulating practice per log:\n\n• Cold face immersion — 3 rounds of cold water on the face or brief head immersion (5 pts).\n• Baking soda water — ¼ tsp sodium bicarbonate in a glass, ≥2 hours from meals (4 pts).\n• Castor oil navel — organic cold-pressed castor oil drops in the belly button (6 pts).\n• Tuning forks — real metal forks (40 Hz listening / weighted C128 on-body circuit) (5 pts).\n\nYou can log more than one practice in a day. Ask a clinician before baking soda if you have sodium restrictions or kidney/heart disease. Castor: external navel use only. Forks: stop if dizzy, ear pain, or joint discomfort.",
  },
  "deuterium-aware-meal": {
    equipment: "none",
    how: "Build the meal around lower-deuterium choices when you can: seafood, quality animal fats, C3 plants (most fruits and vegetables).\n\nLog a real meal you ate with that intent — not a snack on the run unless that was the meal.",
  },
  "seafood-meal": {
    equipment: "none",
    how: "Center the meal on cold-water seafood or high-quality marine fats — salmon, sardines, mackerel, etc.\n\nLog when seafood was the main protein of the meal.",
  },
  "early-dinner": {
    equipment: "none",
    how: "Finish your last substantial meal with a buffer before bed — commonly 3+ hours, adjusted to what lets you sleep well.\n\nLog when you actually ate earlier than your old default.",
  },
  "cold-face-plunge": {
    equipment: "optional",
    how: "Now part of Vagus nerve stimulation. Choose Cold face immersion — 3 rounds of cold water on the face or brief head immersion.\n\nShort and sharp is fine; breathe steadily. Skip if it triggers dizziness or you are unsafe to do so.",
  },
  "cold-thermogenesis": {
    equipment: "optional",
    how: "Pick cold plunge or cold shower, then skin surface temperature (~50°F target; warmer earns fewer base points), then session length.\n\nBuild cold gradually; aim for ~50°F skin for 10+ minutes on plunge days when ready. Cold face immersion is logged under Vagus nerve stimulation.",
  },
  "reduce-nnemf-block": {
    equipment: "optional",
    how: "Run a deliberate low-RF block: airplane mode, router off or distant, outdoor time away from dense EM, or a planned screen-off hour.\n\nLog duration in 15-minute blocks while the block is active.",
  },
  "magnetic-awareness": {
    equipment: "none",
    how: "Spend an hour outdoors or in the lowest artificial-EM environment available to you — yard, park, or a room with routers and chargers removed.\n\nLog in 15-minute increments (+) until you reach your session length.",
  },
  "phone-away-sleep": {
    equipment: "none",
    how: "Now part of Sleep Space. Phone out of the bedroom entirely, or on airplane mode and far from your head — not on the nightstand.",
  },
  "air-tube-headphones": {
    equipment: "required",
    how: "For every phone or video call, use air-tube (hollow acoustic tube) headphones — not regular wired earbuds or Bluetooth buds pressed to your head.\n\nKeep the phone on the table or in a stand at arm's length; let sound travel through the tubes to your ears. Use speakerphone only if air tubes are unavailable.\n\nOnce on your available list this auto-logs daily; skip days with no calls or when traveling without your set.",
  },
  "magnetico-sleep-pad": {
    equipment: "required",
    how: "Now part of Sleep Space. Sleep on a Magnetico or equivalent under-mattress unidirectional pad — under mattress or box spring with ≥4″ spacer, correct N-hemisphere negative polarity, not a dual-polar topper on the bed.\n\nEnable Magnetico inside Sleep Space and pick 5 / 10 / 20 G (10 / 25 / 50 pts).",
  },
  "breaker-off-bedroom": {
    equipment: "optional",
    how: "Now part of Sleep Space. With an electrician, label bedroom circuits. Flip those breakers off at the panel before sleep.\n\nKeep fridge, heat, safety, and egress lighting circuits on.",
  },
  "breaker-off-office": {
    equipment: "optional",
    how: "Now part of Work Space. Label desk and office circuits. Cut power when you leave or on a fixed schedule that matches your workday.",
  },
  "sleep-space": {
    equipment: "optional",
    how: "One permanent bedroom stack. Tap Sleep Space and enable what you actually run: cool bedroom (°F), Magnetico (5/10/20 G), true dark, circadian sleep window, bedroom breakers off, phone away from bed, grounding mat, and/or negative ion generator.\n\nPoints = sum of enabled options. Auto-logs nightly while on your available list — skip when traveling.",
  },
  "work-space": {
    equipment: "optional",
    how: "One permanent desk/office stack. Tap Work Space and enable: office breakers off, grounding mat, negative ion generator, and/or low artificial field (desk EMF hygiene).\n\nAir-tube headphones stay separate. Points = sum of enabled options. Auto-logs daily with no fixed clock time.",
  },
  "morning-movement": {
    equipment: "none",
    how: "Now part of Exercise. Choose walking, resistance bands, or rebounding, then indoors/outdoors and duration.",
  },
  rebounding: {
    equipment: "required",
    how: "Now part of Exercise. Choose Rebounding, then indoors or outdoors and session length. Soft bounces on a stable rebounder — not a toy trampoline.",
  },
  exercise: {
    equipment: "optional",
    how: "Pick the type — rebounding (needs a rebounder), resistance bands, or walking — then whether it was outdoors or indoors, then how long.\n\nOutdoor sessions earn full base points; indoor sessions earn a bit less. Log each intentional session.",
  },
  "mastic-gum": {
    equipment: "required",
    how: "Use real Chios mastic resin or gum — not candy gum. Take a piece large enough to give real jaw resistance.\n\nChew actively on both sides of the jaw for about 15 minutes (or your logged duration). Each log asks indoors vs outside vs full sunlight. Stop if you have TMJ pain or jaw issues.",
  },
  "tuning-forks": {
    equipment: "required",
    how: "Now part of Vagus nerve stimulation. Choose Tuning forks.\n\nUse real metal tuning forks (not phone apps alone). Recommended: 40 Hz for a short listening / near-field vibration session. Suggested body-contact fork: weighted C128 (128 Hz).\n\nActivate by striking the fork on the palm (or a soft activator), then hold near the ears or place the stem/base on bone. For a C128 parasympathetic circuit: crown, forehead, mastoid behind each ear (3 activations per side), TMJ in front of each ear (3 per side), manubrium (~1 in below the top of the breastbone), xiphoid (lower sternum where the ribs meet), and sacrum between the posterior dimples — 3 activations per spot.\n\nStop if you feel dizzy, ear pain, or joint discomfort. Educational only — not treatment for anxiety, cortisol disorders, or neurological disease.",
  },
  "blue-light-hygiene": {
    equipment: "optional",
    how: "After sunset, dim screens, use warm bulbs, or wear blue blockers if needed.\n\nLower brightness and color temperature through the evening so light matches winding down.",
  },
  "screen-light-hygiene": {
    equipment: "optional",
    how: "Remove as much blue light from your screens as possible every evening.\n\nPhones/tablets: enable Night Shift (Apple) or Night Light / Eye comfort (Android) — schedule at sunset, set warmth to maximum, and lower brightness.\n\nComputers: enable Night Light (Windows) or Night Shift (Mac), or install IRIS (iris-tech.com) or f.lux for stronger red-shift and per-monitor control.\n\nApply to every screen you use after dark. Log when your evening device use ran with warm-screen settings active. Pair with Evening blue-light hygiene for room lighting and glasses.",
  },
  "dark-bedroom": {
    equipment: "optional",
    how: "Now part of Sleep Space. Make the room pitch-black: blackout curtains, eye mask, tape over standby LEDs, cover charger lights.",
  },
  "cool-bedroom-sleep": {
    equipment: "optional",
    how: "Now part of Sleep Space. Set the bedroom thermostat to 65°F (18°C) or cooler — 65°F earns 10 pts; each degree warmer costs 1 point.",
  },
  "consistent-sleep-window": {
    equipment: "none",
    how: "Now part of Sleep Space. Go to bed and wake on a consistent window aligned with night — same rough times even on weekends within reason.\n\nEnable Circadian sleep window inside Sleep Space when you hit your target window.",
  },
};

export const PROTOCOL_META_BASE: Record<string, ProtocolMeta> =
  Object.fromEntries(
    Object.entries(PROTOCOL_META_RAW).map(([id, meta]) => [
      id,
      {
        ...meta,
        articleId: meta.articleId ?? PROTOCOL_ARTICLE_IDS[id],
      },
    ]),
  );

export function getProtocolMeta(
  protocolId: string,
  metaMap?: Record<string, ProtocolMeta>,
): ProtocolMeta {
  if (metaMap) return metaMap[protocolId] ?? DEFAULT;
  return PROTOCOL_META_BASE[protocolId] ?? DEFAULT;
}

/** How-to copy for the activity dialog; falls back to catalog description. */
export function getProtocolHowTo(
  protocol: { id: string; description?: string | null },
  metaMap?: Record<string, ProtocolMeta>,
): string {
  const how = getProtocolMeta(protocol.id, metaMap).how;
  if (how?.trim()) return how.trim();
  return (protocol.description ?? "").trim() || "See the Learn more article for guidance.";
}

export function equipmentLabel(e: EquipmentNeed): string {
  if (e === "required") return "Needs gear";
  if (e === "optional") return "Gear optional";
  return "No gear";
}

/** First paragraph of how-to, collapsed to one line for list cards. */
export function protocolTeaserFromHowTo(howTo: string, maxLen = 140): string {
  const first = howTo.split(/\n\n+/)[0]?.trim() ?? howTo.trim();
  const oneLine = first.replace(/\s+/g, " ");
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen - 1).trimEnd()}…`;
}
