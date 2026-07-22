import type { Protocol, TimeOfDay } from "@/db/schema";
import type { sunPhase } from "@/lib/sun";

type Phase = ReturnType<typeof sunPhase>;

/** Map solar phase → preferred protocol time slots (for ranking). */
const PHASE_SLOTS: Record<Phase, TimeOfDay[]> = {
  sunrise: ["sunrise", "morning", "anytime"],
  day: ["morning", "afternoon", "anytime", "sunrise"],
  sunset: ["sunset", "evening", "anytime"],
  night: ["night", "evening", "anytime"],
};

function idealSlot(p: Protocol): TimeOfDay {
  return p.lockedTimeOfDay ?? p.timeOfDay ?? "anytime";
}

function slotRank(slot: TimeOfDay, phase: Phase): number {
  const order = PHASE_SLOTS[phase] ?? PHASE_SLOTS.day;
  const i = order.indexOf(slot);
  return i === -1 ? 50 : i;
}

/**
 * Sort checklist by phase affinity, then name.
 * Done items are ranked lower so Available stays focused on what’s left.
 */
export function orderProtocolsForNow(
  protocols: Protocol[],
  opts: {
    phase: Phase;
    localHour: number;
    completionCounts: Record<string, number>;
  },
): Protocol[] {
  const { phase, completionCounts } = opts;
  void opts.localHour;

  const scored = protocols.map((p) => {
    const count = completionCounts[p.id] ?? 0;
    const ideal = idealSlot(p);
    const rank = slotRank(ideal, phase);
    const doneBoost = count > 0 ? 100 : 0;
    return { p, rank: rank + doneBoost };
  });

  scored.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.p.name.localeCompare(b.p.name);
  });

  return scored.map((s) => s.p);
}

export function seasonCoachLine(
  uvSeasonLabel: string | null | undefined,
  phase: Phase,
): string | null {
  if (!uvSeasonLabel) return null;
  const weak =
    uvSeasonLabel.toLowerCase().includes("short") ||
    uvSeasonLabel.toLowerCase().includes("seasonal");
  if (weak && (phase === "day" || phase === "sunrise")) {
    return `${uvSeasonLabel}. Prioritize outdoor morning light; midday skin UV may be limited.`;
  }
  if (uvSeasonLabel.toLowerCase().includes("year-round")) {
    return `${uvSeasonLabel} at your latitude — use it wisely (don't burn).`;
  }
  return uvSeasonLabel;
}
