/**
 * Extra catalog metadata not stored in DB (equipment / how).
 * Keeps migrations light while improving catalog UX.
 */

export type EquipmentNeed = "none" | "optional" | "required";

export type ProtocolMeta = {
  equipment: EquipmentNeed;
  how?: string;
};

const DEFAULT: ProtocolMeta = { equipment: "none" };

const META: Record<string, ProtocolMeta> = {
  "sunrise-horizon": {
    equipment: "none",
    how: "Bare eyes on the solar disk as it clears the horizon — no glass, no sunglasses. Light keystone.",
  },
  "sunrise-open-sky": {
    equipment: "none",
    how: "Outside under a wide sky in the morning; full-spectrum light to the eyes. Light keystone.",
  },
  "sunrise-outside": {
    equipment: "none",
    how: "Any outdoor morning light, even with trees, buildings, or heavy overcast. Light keystone.",
  },
  "low-d-hydration": {
    equipment: "optional",
    how: "First mineralized water outdoors or by a windowless open door — Water keystone.",
  },
  "deuterium-aware-meal": {
    equipment: "none",
    how: "Prefer seafood, quality fats, C3 plants — Water keystone meal.",
  },
  "carbonated-water": {
    equipment: "optional",
    how: "Home carbonator or unsweetened sparkling / natural mineral water — not sugary soda.",
  },
  "magnetico-sleep-pad": {
    equipment: "required",
    how: "Magnetico under mattress / box spring (≥4″ spacer), not on top of bed; correct N-hemisphere negative polarity. Phone away from bed if you can.",
  },
  "morning-natural-light": {
    equipment: "none",
    how: "Step outside under open sky — windows don't count as full spectrum.",
  },
  "midday-sun-skin": {
    equipment: "none",
    how: "Safe non-burning UV on skin when your latitude/season allows.",
  },
  "sunset-viewing": {
    equipment: "none",
    how: "Watch sunset with bare eyes; dim indoor LEDs afterward.",
  },
  "red-nir-light": {
    equipment: "optional",
    how: "Natural dusk red or a red/NIR panel if you own one.",
  },
  "barefoot-earth": {
    equipment: "none",
    how: "Grass, sand, soil, or stone — not asphalt if you can avoid it.",
  },
  "cold-face-plunge": {
    equipment: "optional",
    how: "Cold water on face/neck; bowl or shower is enough.",
  },
  "cold-thermogenesis": {
    equipment: "optional",
    how: "Cold shower, outdoor cold, or plunge if available.",
  },
  "blue-light-hygiene": {
    equipment: "optional",
    how: "Dim screens, warm bulbs, or blue blockers after sunset.",
  },
  "dark-bedroom": {
    equipment: "optional",
    how: "Blackout or eye mask; cover LEDs.",
  },
  "phone-away-sleep": {
    equipment: "none",
    how: "Phone outside bedroom or airplane + far from head.",
  },
  "morning-movement": {
    equipment: "none",
    how: "Walk, lift, or play outside in daylight when possible.",
  },
  "mastic-gum": {
    equipment: "required",
    how: "Chew real Chios mastic resin/gum (not candy gum), both sides, 5–20 min. Skip if jaw/TMJ pain or no gum on hand.",
  },
  "mineralized-water": {
    equipment: "optional",
    how: "Mineral water or remineralized filter water.",
  },
};

export function getProtocolMeta(protocolId: string): ProtocolMeta {
  return META[protocolId] ?? DEFAULT;
}

export function equipmentLabel(e: EquipmentNeed): string {
  if (e === "required") return "Needs gear";
  if (e === "optional") return "Gear optional";
  return "No gear";
}
