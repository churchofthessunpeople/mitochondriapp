/**
 * Grounding — barefoot earth contact or “Make like the Sphinx” belly contact.
 * Flat points per log (no duration blocks).
 *
 * Labels / points can be overridden via content/activities.json `options`.
 */

import type { ActivityModeOption } from "@/lib/protocol-meta";

export const GROUNDING_PROTOCOL_ID = "barefoot-earth";

export type GroundingMode = "barefoot" | "sphinx";

export const GROUNDING_MODE_OPTIONS: {
  id: GroundingMode;
  label: string;
  detail: string;
  points: number;
}[] = [
  {
    id: "barefoot",
    label: "Barefoot",
    detail: "Feet on soil, grass, sand, or stone",
    points: 5,
  },
  {
    id: "sphinx",
    label: "Make like the Sphinx",
    detail: "Belly / torso on the earth — fuller contact",
    points: 10,
  },
];

/** Merge content overlay options onto built-in modes (ids stay fixed). */
export function resolveGroundingOptions(
  options?: ActivityModeOption[] | null,
): typeof GROUNDING_MODE_OPTIONS {
  if (!options?.length) return GROUNDING_MODE_OPTIONS;
  const byId = new Map(options.map((o) => [o.id, o]));
  return GROUNDING_MODE_OPTIONS.map((def) => {
    const o = byId.get(def.id);
    if (!o) return def;
    return {
      id: def.id,
      label: o.label?.trim() || def.label,
      detail: o.detail?.trim() || def.detail,
      points:
        typeof o.points === "number" && Number.isFinite(o.points)
          ? o.points
          : def.points,
    };
  });
}

const MODE_INDEX: Record<GroundingMode, number> = {
  barefoot: 0,
  sphinx: 1,
};

const MODE_BY_INDEX: GroundingMode[] = ["barefoot", "sphinx"];

export function isGroundingProtocolId(id: string): boolean {
  return id === GROUNDING_PROTOCOL_ID;
}

export function encodeGroundingVariant(mode: GroundingMode): number {
  return MODE_INDEX[mode] ?? 0;
}

export function decodeGroundingVariant(
  variantValue: unknown,
): GroundingMode | null {
  if (typeof variantValue !== "number" || !Number.isFinite(variantValue)) {
    return null;
  }
  const v = Math.trunc(variantValue);
  if (v < 0 || v > 1) return null;
  return MODE_BY_INDEX[v] ?? null;
}

export function parseGroundingMode(value: unknown): GroundingMode {
  const decoded = decodeGroundingVariant(value);
  if (decoded) return decoded;
  if (typeof value === "string") {
    if ((GROUNDING_MODE_OPTIONS as { id: string }[]).some((o) => o.id === value)) {
      return value as GroundingMode;
    }
  }
  return "barefoot";
}

export function groundingModePoints(
  mode: GroundingMode,
  options?: ActivityModeOption[] | null,
): number {
  return (
    resolveGroundingOptions(options).find((o) => o.id === mode)?.points ?? 5
  );
}

export function groundingModeLabel(
  mode: GroundingMode,
  options?: ActivityModeOption[] | null,
): string {
  return (
    resolveGroundingOptions(options).find((o) => o.id === mode)?.label ?? mode
  );
}

export function formatGroundingLabel(
  variantValue: unknown,
  options?: ActivityModeOption[] | null,
): string | null {
  const mode = decodeGroundingVariant(variantValue);
  if (!mode) return null;
  return `${groundingModeLabel(mode, options)} · ${groundingModePoints(mode, options)} pts`;
}
