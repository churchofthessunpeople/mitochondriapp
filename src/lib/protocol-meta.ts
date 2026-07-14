/**
 * Extra catalog metadata not stored in DB (equipment / how-to).
 * Keeps migrations light while improving catalog UX.
 */

export type EquipmentNeed = "none" | "optional" | "required";

export type ProtocolMeta = {
  equipment: EquipmentNeed;
  how?: string;
};

const DEFAULT: ProtocolMeta = { equipment: "none" };

export const PROTOCOL_META_BASE: Record<string, ProtocolMeta> = {
  "sunrise-horizon": {
    equipment: "none",
    how: "Be outside before the sun clears the horizon. Look at the solar disk with bare eyes — no sunglasses, no window glass between you and the sky.\n\nFull points when your viewing session falls within 15 minutes before or after local sunrise; each minute outside costs 1 point (worst edge of start/finish). Skin, grounding, and sunglasses adjust your day boost on the check-in.",
  },
  "sunrise-open-sky": {
    equipment: "none",
    how: "Get outside in the morning under a reasonably open sky — yard, park, or balcony with wide sky view.\n\nEyes open to outdoor light (no sunglasses). A few minutes is enough; longer is fine if you have time.",
  },
  "sunrise-outside": {
    equipment: "none",
    how: "Step outside in the morning even if trees, buildings, or heavy cloud limit the view.\n\nAny outdoor morning light to the eyes counts — porch, street, or trail. No glass between you and the sky if you can avoid it.",
  },
  "morning-natural-light": {
    equipment: "none",
    how: "Go outside for natural light without a window in between — porch, yard, or walk.\n\nAim for open sky when you can. Even a short outdoor stop before indoor work helps anchor the day.",
  },
  "midday-sun-skin": {
    equipment: "none",
    how: "Near solar noon (check Place for your location), get outdoors with skin exposed — arms, legs, or more if comfortable.\n\nStay within a non-burning window; build time gradually. Glass blocks UVB, so windows do not count.\n\nLog with minutes — each + adds 15 min, or set a custom duration.",
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
  "hydration-timing": {
    equipment: "none",
    how: "Front-load hydration earlier in the day; taper large volumes in the last few hours before sleep.\n\nLog when you deliberately shifted timing — earlier glasses, less late chugging.",
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
    how: "Deliberate cold exposure: cold shower, outdoor cold, or plunge if you have safe access.\n\nBuild duration gradually. Log minutes in 15-minute blocks (+) or custom time. Set skin surface temp: ~50°F is the target; each 5°F warmer reduces base points before duration scales.",
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
  "magnetico-sleep-pad": {
    equipment: "required",
    how: "Sleep on a Magnetico or equivalent under-mattress unidirectional pad — under mattress or box spring with ≥4″ spacer, correct N-hemisphere negative polarity, not a dual-polar topper on the bed.\n\nSet pad strength on the checklist: 5 G = 1.25×, 10 G = 1.5×, 20 G = 2× base points. Once on your available list this auto-logs nightly; tap to skip when traveling.",
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
    how: "Zone 2 walk, resistance work, or play outside in daylight when possible — not only under gym fluorescents.\n\nLog minutes in 15-minute blocks (+) or set custom duration.",
  },
  "mastic-gum": {
    equipment: "required",
    how: "Use real Chios mastic resin or gum — not candy gum. Take a piece large enough to give real jaw resistance.\n\nChew actively on both sides of the jaw for about 15 minutes (or your logged duration). Switch sides if one fatigues. Stop if you have TMJ pain or jaw issues.",
  },
  "blue-light-hygiene": {
    equipment: "optional",
    how: "After sunset, dim screens, use warm bulbs, or wear blue blockers if needed.\n\nLower brightness and color temperature through the evening so light matches winding down.",
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

export function getProtocolMeta(
  protocolId: string,
  metaMap?: Record<string, ProtocolMeta>,
): ProtocolMeta {
  if (metaMap) return metaMap[protocolId] ?? DEFAULT;
  return PROTOCOL_META_BASE[protocolId] ?? DEFAULT;
}

/** How-to copy for the activity dialog; falls back to catalog description. */
export function getProtocolHowTo(
  protocol: { id: string; description: string },
  metaMap?: Record<string, ProtocolMeta>,
): string {
  const how = getProtocolMeta(protocol.id, metaMap).how;
  if (how?.trim()) return how.trim();
  return protocol.description.trim();
}

export function equipmentLabel(e: EquipmentNeed): string {
  if (e === "required") return "Needs gear";
  if (e === "optional") return "Gear optional";
  return "No gear";
}
