/**
 * Grounding — barefoot earth contact or “Make like the Sphinx” belly contact.
 * Flat points per log (no duration blocks).
 */

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

export function groundingModePoints(mode: GroundingMode): number {
  return (
    GROUNDING_MODE_OPTIONS.find((o) => o.id === mode)?.points ?? 5
  );
}

export function groundingModeLabel(mode: GroundingMode): string {
  return GROUNDING_MODE_OPTIONS.find((o) => o.id === mode)?.label ?? mode;
}

export function formatGroundingLabel(variantValue: unknown): string | null {
  const mode = decodeGroundingVariant(variantValue);
  if (!mode) return null;
  return `${groundingModeLabel(mode)} · ${groundingModePoints(mode)} pts`;
}
