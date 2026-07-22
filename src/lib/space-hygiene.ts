/**
 * Sleep Space / Work Space — permanent composite hygiene activities.
 * Points = sum of enabled options (Magnetico / cool temp use existing curves).
 */

import {
  MAGNETICO_GAUSS_POINTS,
  parseMagneticoGauss,
  type MagneticoGauss,
} from "@/lib/magnetico";
import {
  parseSleepRoomTempF,
  pointsForSleepRoomTemp,
  type SleepRoomTempF,
} from "@/lib/sleep-room-temp";

export const SLEEP_SPACE_PROTOCOL_ID = "sleep-space";
export const WORK_SPACE_PROTOCOL_ID = "work-space";

export type SleepSpaceOptionId =
  | "coolBedroom"
  | "magnetico"
  | "trueDark"
  | "circadianWindow"
  | "breakersOff"
  | "phoneAway"
  | "groundingMat"
  | "negativeIon";

export type WorkSpaceOptionId =
  | "breakersOff"
  | "groundingMat"
  | "negativeIon"
  | "lowArtificialField";

export type SleepSpaceConfig = Record<SleepSpaceOptionId, boolean>;
export type WorkSpaceConfig = Record<WorkSpaceOptionId, boolean>;

export const DEFAULT_SLEEP_SPACE_CONFIG: SleepSpaceConfig = {
  coolBedroom: false,
  magnetico: false,
  trueDark: false,
  circadianWindow: false,
  breakersOff: false,
  phoneAway: false,
  groundingMat: false,
  negativeIon: false,
};

export const DEFAULT_WORK_SPACE_CONFIG: WorkSpaceConfig = {
  breakersOff: false,
  groundingMat: false,
  negativeIon: false,
  lowArtificialField: false,
};

/** Flat option points (Magnetico / cool bedroom computed separately). */
export const SLEEP_SPACE_FLAT_POINTS: Record<
  Exclude<SleepSpaceOptionId, "coolBedroom" | "magnetico">,
  number
> = {
  trueDark: 8,
  circadianWindow: 7,
  breakersOff: 6,
  phoneAway: 5,
  groundingMat: 10,
  negativeIon: 10,
};

export const WORK_SPACE_FLAT_POINTS: Record<WorkSpaceOptionId, number> = {
  breakersOff: 6,
  groundingMat: 10,
  negativeIon: 10,
  lowArtificialField: 5,
};

export const SLEEP_SPACE_OPTION_META: {
  id: SleepSpaceOptionId;
  label: string;
  detail: string;
  how: string;
  /** Mitoversity entry id for Learn more (optional). */
  articleId?: string;
}[] = [
  {
    id: "coolBedroom",
    label: "Cool bedroom",
    detail: "Thermostat ≤65°F ideal — points diminish as room warms",
    how: "Set the bedroom thermostat to 65°F (18°C) or cooler — cool under covers, not shivering. Fans and breathable bedding help without over-chilling.\n\nIn Sleep Space, pick your sleep temp: 65°F earns 10 pts; each degree warmer costs 1 point.",
    articleId: "cool-sleep-65",
  },
  {
    id: "magnetico",
    label: "Magnetico sleep pad",
    detail: "Under-mattress unidirectional pad — 5 / 10 / 20 G",
    how: "Sleep on a Magnetico or equivalent under-mattress unidirectional pad — under mattress or box spring with ≥4″ spacer, correct N-hemisphere negative polarity, not a dual-polar topper on the bed.\n\nIn Sleep Space, pick pad strength: 5 G = 10 pts, 10 G = 25 pts, 20 G = 50 pts. Day boost multipliers come from morning sunlight only.",
    articleId: "magnetico-sleep-pad",
  },
  {
    id: "trueDark",
    label: "True dark",
    detail: "Pitch-black or effective eye mask",
    how: "Make the room pitch-black: blackout curtains, eye mask, tape over standby LEDs, cover charger lights.\n\nYou should not see your hand in front of your face when lights are out.",
    articleId: "true-dark-bedroom",
  },
  {
    id: "circadianWindow",
    label: "Circadian sleep window",
    detail: "Consistent bed and wake times aligned with night",
    how: "Go to bed and wake on a consistent window aligned with night — same rough times even on weekends within reason.\n\nEnable this Sleep Space option on nights you hit your target sleep window, not only when you were tired.",
    articleId: "consistent-sleep-window",
  },
  {
    id: "breakersOff",
    label: "Bedroom breakers off",
    detail: "Circuits off overnight at the panel",
    how: "With an electrician, label bedroom circuits. Flip those breakers off at the panel before sleep.\n\nKeep fridge, heat, safety, and egress lighting circuits on.",
    articleId: "breaker-off-bedroom",
  },
  {
    id: "phoneAway",
    label: "Phone away from bed",
    detail: "Another room or far away on airplane mode",
    how: "Phone out of the bedroom entirely, or on airplane mode and far from your head — not on the nightstand.\n\nSet up before bed so you are not reaching for it if you wake.",
    articleId: "phone-away-sleep",
  },
  {
    id: "groundingMat",
    label: "Grounding mat",
    detail: "Earth-connected sleep mat / sheet",
    how: "Use a conductive sleep mat or sheet wired to a verified Earth reference — prefer an exterior ground stake with a current-limiting resistor over an untested outlet ground.\n\nEnable this Sleep Space option on nights the mat is connected and in contact with skin. Outdoor barefoot time remains a separate Barefoot earth contact log.",
    articleId: "grounding-mats-earth-stake",
  },
  {
    id: "negativeIon",
    label: "Negative ion generator",
    detail: "Bedroom ionizer running overnight",
    how: "Run a bedroom negative ion / air ionizer overnight in a well-ventilated room. Place it so it does not blow dust onto the bed, and clean filters per the manufacturer.\n\nEnable this Sleep Space option when the unit ran for the night. Educational only — not medical treatment for asthma or allergy.",
  },
];

export const WORK_SPACE_OPTION_META: {
  id: WorkSpaceOptionId;
  label: string;
  detail: string;
  how: string;
  articleId?: string;
}[] = [
  {
    id: "breakersOff",
    label: "Office breakers off",
    detail: "Work circuits off when not in use",
    how: "Label desk and office circuits. Cut power when you leave or on a fixed schedule that matches your workday.\n\nEnable this Work Space option on days the office stayed powered down when not in use.",
    articleId: "breaker-off-office",
  },
  {
    id: "groundingMat",
    label: "Grounding mat",
    detail: "Earth-connected desk / floor mat",
    how: "Use a conductive desk or floor mat wired to a verified Earth reference — prefer an exterior stake with inline resistance over an untested outlet ground.\n\nEnable this Work Space option on days you worked with bare skin or conductive footwear on the mat.",
    articleId: "grounding-mats-earth-stake",
  },
  {
    id: "negativeIon",
    label: "Negative ion generator",
    detail: "Desk / office ionizer while working",
    how: "Run a desk or office negative ion generator during work hours. Keep it away from open drinks and clean the emitter regularly.\n\nEnable this Work Space option when the unit ran for your work block. Educational only.",
  },
  {
    id: "lowArtificialField",
    label: "Low artificial field",
    detail: "Desk EMF hygiene — distance, airplane mode, low-RF block",
    how: "Keep phones off the lap and away from the head on calls (pair with air-tube headphones), use airplane mode or distance from the router when practical, and avoid coiling chargers on the desk next to your torso.\n\nEnable this Work Space option for days you kept a deliberate low-field desk setup — not every minute, the intentional habit.",
    articleId: "reduce-nnemf-block",
  },
];

/** Legacy standalone protocols rolled into spaces (retired from catalog UI). */
export const RETIRED_INTO_SLEEP_SPACE: Record<string, SleepSpaceOptionId> = {
  "cool-bedroom-sleep": "coolBedroom",
  "magnetico-sleep-pad": "magnetico",
  "dark-bedroom": "trueDark",
  "consistent-sleep-window": "circadianWindow",
  "breaker-off-bedroom": "breakersOff",
  "phone-away-sleep": "phoneAway",
};

export const RETIRED_INTO_WORK_SPACE: Record<string, WorkSpaceOptionId> = {
  "breaker-off-office": "breakersOff",
};

export const RETIRED_SPACE_PROTOCOL_IDS = new Set([
  ...Object.keys(RETIRED_INTO_SLEEP_SPACE),
  ...Object.keys(RETIRED_INTO_WORK_SPACE),
]);

export function isSleepSpaceProtocolId(id: string): boolean {
  return id === SLEEP_SPACE_PROTOCOL_ID;
}

export function isWorkSpaceProtocolId(id: string): boolean {
  return id === WORK_SPACE_PROTOCOL_ID;
}

export function isSpaceHygieneProtocolId(id: string): boolean {
  return isSleepSpaceProtocolId(id) || isWorkSpaceProtocolId(id);
}

export function isRetiredSpaceProtocolId(id: string): boolean {
  return RETIRED_SPACE_PROTOCOL_IDS.has(id);
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseSleepSpaceConfig(raw: unknown): SleepSpaceConfig {
  let obj: Record<string, unknown> = {};
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object") {
        obj = parsed as Record<string, unknown>;
      }
    } catch {
      obj = {};
    }
  } else if (raw && typeof raw === "object") {
    obj = raw as Record<string, unknown>;
  }
  return {
    coolBedroom: asBool(obj.coolBedroom, DEFAULT_SLEEP_SPACE_CONFIG.coolBedroom),
    magnetico: asBool(obj.magnetico, DEFAULT_SLEEP_SPACE_CONFIG.magnetico),
    trueDark: asBool(obj.trueDark, DEFAULT_SLEEP_SPACE_CONFIG.trueDark),
    circadianWindow: asBool(
      obj.circadianWindow,
      DEFAULT_SLEEP_SPACE_CONFIG.circadianWindow,
    ),
    breakersOff: asBool(obj.breakersOff, DEFAULT_SLEEP_SPACE_CONFIG.breakersOff),
    phoneAway: asBool(obj.phoneAway, DEFAULT_SLEEP_SPACE_CONFIG.phoneAway),
    groundingMat: asBool(
      obj.groundingMat,
      DEFAULT_SLEEP_SPACE_CONFIG.groundingMat,
    ),
    negativeIon: asBool(obj.negativeIon, DEFAULT_SLEEP_SPACE_CONFIG.negativeIon),
  };
}

export function parseWorkSpaceConfig(raw: unknown): WorkSpaceConfig {
  let obj: Record<string, unknown> = {};
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object") {
        obj = parsed as Record<string, unknown>;
      }
    } catch {
      obj = {};
    }
  } else if (raw && typeof raw === "object") {
    obj = raw as Record<string, unknown>;
  }
  return {
    breakersOff: asBool(obj.breakersOff, DEFAULT_WORK_SPACE_CONFIG.breakersOff),
    groundingMat: asBool(
      obj.groundingMat,
      DEFAULT_WORK_SPACE_CONFIG.groundingMat,
    ),
    negativeIon: asBool(obj.negativeIon, DEFAULT_WORK_SPACE_CONFIG.negativeIon),
    lowArtificialField: asBool(
      obj.lowArtificialField,
      DEFAULT_WORK_SPACE_CONFIG.lowArtificialField,
    ),
  };
}

export function serializeSleepSpaceConfig(config: SleepSpaceConfig): string {
  return JSON.stringify(config);
}

export function serializeWorkSpaceConfig(config: WorkSpaceConfig): string {
  return JSON.stringify(config);
}

export function sleepSpaceOptionEnabledCount(config: SleepSpaceConfig): number {
  return SLEEP_SPACE_OPTION_META.filter((o) => config[o.id]).length;
}

export function workSpaceOptionEnabledCount(config: WorkSpaceConfig): number {
  return WORK_SPACE_OPTION_META.filter((o) => config[o.id]).length;
}

export function pointsForSleepSpace(
  config: SleepSpaceConfig,
  opts: { magneticoGauss?: unknown; sleepRoomTempF?: unknown } = {},
): number {
  let total = 0;
  if (config.coolBedroom) {
    total += pointsForSleepRoomTemp(parseSleepRoomTempF(opts.sleepRoomTempF));
  }
  if (config.magnetico) {
    const g = parseMagneticoGauss(opts.magneticoGauss);
    total += MAGNETICO_GAUSS_POINTS[g];
  }
  for (const id of Object.keys(SLEEP_SPACE_FLAT_POINTS) as Exclude<
    SleepSpaceOptionId,
    "coolBedroom" | "magnetico"
  >[]) {
    if (config[id]) total += SLEEP_SPACE_FLAT_POINTS[id];
  }
  return total;
}

export function pointsForWorkSpace(config: WorkSpaceConfig): number {
  let total = 0;
  for (const id of Object.keys(WORK_SPACE_FLAT_POINTS) as WorkSpaceOptionId[]) {
    if (config[id]) total += WORK_SPACE_FLAT_POINTS[id];
  }
  return total;
}

export function formatSleepSpaceHint(
  config: SleepSpaceConfig,
  opts: { magneticoGauss?: MagneticoGauss; sleepRoomTempF?: SleepRoomTempF } = {},
): string {
  const n = sleepSpaceOptionEnabledCount(config);
  if (n === 0) return "Configure options · automatic nightly";
  const pts = pointsForSleepSpace(config, opts);
  return `${n} option${n === 1 ? "" : "s"} · ${pts} pts · automatic nightly`;
}

export function formatWorkSpaceHint(config: WorkSpaceConfig): string {
  const n = workSpaceOptionEnabledCount(config);
  if (n === 0) return "Configure options · automatic daily";
  const pts = pointsForWorkSpace(config);
  return `${n} option${n === 1 ? "" : "s"} · ${pts} pts · automatic daily`;
}

export function formatSleepSpaceBreakdown(
  config: SleepSpaceConfig,
  opts: { magneticoGauss?: unknown; sleepRoomTempF?: unknown } = {},
): string[] {
  const lines: string[] = [];
  if (config.coolBedroom) {
    const t = parseSleepRoomTempF(opts.sleepRoomTempF);
    lines.push(`Cool bedroom ${t}°F · ${pointsForSleepRoomTemp(t)} pts`);
  }
  if (config.magnetico) {
    const g = parseMagneticoGauss(opts.magneticoGauss);
    lines.push(`Magnetico ${g} G · ${MAGNETICO_GAUSS_POINTS[g]} pts`);
  }
  for (const meta of SLEEP_SPACE_OPTION_META) {
    if (meta.id === "coolBedroom" || meta.id === "magnetico") continue;
    if (!config[meta.id]) continue;
    lines.push(
      `${meta.label} · ${SLEEP_SPACE_FLAT_POINTS[meta.id as Exclude<SleepSpaceOptionId, "coolBedroom" | "magnetico">]} pts`,
    );
  }
  return lines;
}

export function formatWorkSpaceBreakdown(config: WorkSpaceConfig): string[] {
  return WORK_SPACE_OPTION_META.filter((m) => config[m.id]).map(
    (m) => `${m.label} · ${WORK_SPACE_FLAT_POINTS[m.id]} pts`,
  );
}

/** Merge legacy favorite ids into space configs (mutates copies). */
export function migrateLegacyFavoritesToSpaceConfigs(input: {
  favoriteIds: Iterable<string>;
  sleepConfig: SleepSpaceConfig;
  workConfig: WorkSpaceConfig;
}): {
  sleepConfig: SleepSpaceConfig;
  workConfig: WorkSpaceConfig;
  nextFavoriteIds: string[];
  changed: boolean;
} {
  const sleepConfig = { ...input.sleepConfig };
  const workConfig = { ...input.workConfig };
  const next = new Set(input.favoriteIds);
  let changed = false;
  let sleepTouched = false;
  let workTouched = false;

  for (const [legacyId, optionId] of Object.entries(RETIRED_INTO_SLEEP_SPACE)) {
    if (next.has(legacyId)) {
      sleepConfig[optionId] = true;
      next.delete(legacyId);
      sleepTouched = true;
      changed = true;
    }
  }
  for (const [legacyId, optionId] of Object.entries(RETIRED_INTO_WORK_SPACE)) {
    if (next.has(legacyId)) {
      workConfig[optionId] = true;
      next.delete(legacyId);
      workTouched = true;
      changed = true;
    }
  }

  if (sleepTouched) {
    next.add(SLEEP_SPACE_PROTOCOL_ID);
  }
  if (workTouched) {
    next.add(WORK_SPACE_PROTOCOL_ID);
  }

  return {
    sleepConfig,
    workConfig,
    nextFavoriteIds: [...next],
    changed,
  };
}
