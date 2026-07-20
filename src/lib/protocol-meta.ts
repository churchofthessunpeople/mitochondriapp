/**
 * Extra catalog metadata not stored in DB (equipment / how-to).
 * Keeps migrations light while improving catalog UX.
 */

import { PROTOCOL_ARTICLE_IDS } from "@/lib/protocol-article-map";

export type EquipmentNeed = "none" | "optional" | "required";

export type ProtocolMeta = {
  equipment: EquipmentNeed;
  how?: string;
  /** Primary Mitoversity article for this activity */
  articleId?: string;
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
    how: "Go outside without glass between you and the sky. Tap + and pick morning, noon, or afternoon sun — each tap adds 15 minutes in that slot.\n\nSlots: morning (sunrise–12 pm), noon (12–4 pm), afternoon (4 pm–sunset). Stay within a non-burning window; build time gradually. Sunrise keystones are separate — they unlock the day boost.",
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
    how: "Stand or walk barefoot on soil, grass, sand, or stone — real earth when you can, not asphalt if avoidable.\n\nLog time in 15-minute blocks (+ button) or set custom minutes.",
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
    how: "Drink well-mineralized water — natural mineral water or remineralized filter water, not deionized-only all day.\n\nSpread through the day; log each intentional serving.",
  },
  "carbonated-water": {
    equipment: "optional",
    how: "Unsweetened sparkling or carbonated mineral water — home carbonator or bottled, not sugary soda.\n\nUse as a hydration habit you actually enjoy and will repeat.",
  },
  "baking-soda-water": {
    equipment: "none",
    how: "Use plain baking soda (sodium bicarbonate) — not baking powder.\n\nDissolve ¼ teaspoon in a full glass of water. Drink twice daily when following the full protocol. Take each dose at least 2 hours before or after meals so it does not neutralize stomach acid during digestion.\n\nLog each glass separately. Ask your clinician first if you have high blood pressure, heart failure, kidney disease, or sodium restrictions.",
  },
  "hydration-timing": {
    equipment: "none",
    how: "Front-load hydration earlier in the day; taper large volumes in the last few hours before sleep.\n\nLog when you deliberately shifted timing — earlier glasses, less late chugging.",
  },
  "castor-oil-navel": {
    equipment: "required",
    how: "Use organic, cold-pressed castor oil from a reputable source (commercial grades have ricin removed — never use raw castor beans).\n\nClean and dry the navel. With a clean dropper, place 2–5 drops in the belly button. Optional: cover with a small soft cloth if you are lying down so sheets do not stain.\n\nTypical timing is before sleep; wash any residue the next morning if needed. Patch-test on the inner arm first. Stop for redness, itch, or discharge. Do not use if pregnant, with an umbilical hernia, or an open belly wound unless a clinician approves. External navel use only — do not drink castor oil as part of this habit.",
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
    how: "Cold water on face, neck, or brief head immersion — bowl of ice water, cold tap, or shower splash.\n\nShort and sharp is fine; breathe steadily. Skip if it triggers dizziness or you are unsafe to do so.",
  },
  "cold-thermogenesis": {
    equipment: "optional",
    how: "Deliberate cold exposure: cold shower, outdoor cold, or plunge if you have safe access.\n\nBuild duration gradually. Each log asks skin surface temp (~50°F target; warmer earns fewer base points) then session length. Aim for ~50°F skin for 10+ minutes when ready.",
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
    how: "Phone out of the bedroom entirely, or on airplane mode and far from your head — not on the nightstand.\n\nSet up before bed so you are not reaching for it if you wake.",
  },
  "air-tube-headphones": {
    equipment: "required",
    how: "For every phone or video call, use air-tube (hollow acoustic tube) headphones — not regular wired earbuds or Bluetooth buds pressed to your head.\n\nKeep the phone on the table or in a stand at arm's length; let sound travel through the tubes to your ears. Use speakerphone only if air tubes are unavailable.\n\nOnce on your available list this auto-logs daily; skip days with no calls or when traveling without your set.",
  },
  "magnetico-sleep-pad": {
    equipment: "required",
    how: "Sleep on a Magnetico or equivalent under-mattress unidirectional pad — under mattress or box spring with ≥4″ spacer, correct N-hemisphere negative polarity, not a dual-polar topper on the bed.\n\nSet pad strength on the checklist: 5 G = 10 pts, 10 G = 25 pts, 20 G = 50 pts. Day boost multipliers come from morning sunlight only. Once on your available list this auto-logs nightly; tap to skip when traveling.",
  },
  "breaker-off-bedroom": {
    equipment: "optional",
    how: "With an electrician, label bedroom circuits. Flip those breakers off at the panel before sleep.\n\nKeep fridge, heat, safety, and egress lighting circuits on. Auto-logs nightly while on your list; skip when away.",
  },
  "breaker-off-office": {
    equipment: "optional",
    how: "Label desk and office circuits. Cut power when you leave or on a fixed schedule that matches your workday.\n\nAuto-logs daily while on your list; skip on days the office stayed powered.",
  },
  "morning-movement": {
    equipment: "none",
    how: "Zone 2 walk, resistance work, or play outside in daylight when possible — not only under gym fluorescents.\n\nEach log asks full sunlight, outside, or indoors, then minutes in 15-minute blocks.",
  },
  rebounding: {
    equipment: "required",
    how: "Use a stable mini-trampoline (rebounder) — not a toy trampoline. Soft bounces with both feet on the mat, knees slightly bent, posture tall.\n\nEach log asks environment (sunlight / outside / indoors), then adds 15 minutes. Use +/− for more or less time in 15-minute blocks. Morning outdoor rebounding stacks movement with daylight.",
  },
  "mastic-gum": {
    equipment: "required",
    how: "Use real Chios mastic resin or gum — not candy gum. Take a piece large enough to give real jaw resistance.\n\nChew actively on both sides of the jaw for about 15 minutes (or your logged duration). Each log asks indoors vs outside vs full sunlight. Stop if you have TMJ pain or jaw issues.",
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
    how: "Make the room pitch-black: blackout curtains, eye mask, tape over standby LEDs, cover charger lights.\n\nYou should not see your hand in front of your face when lights are out.",
  },
  "cool-bedroom-sleep": {
    equipment: "optional",
    how: "Set the bedroom thermostat at 65°F (18°C) or cooler — cool under covers, not shivering. Fans and breathable bedding help without over-chilling.\n\nPick your sleep temp on the checklist: 65°F earns 10 pts; each degree warmer costs 1 point. Auto-logs nightly while on your list; skip when traveling.",
  },
  "consistent-sleep-window": {
    equipment: "none",
    how: "Go to bed and wake on a consistent window aligned with night — same rough times even on weekends within reason.\n\nLog when you hit your target sleep window, not just when you were tired.",
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
