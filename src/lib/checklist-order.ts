import type { Protocol, TimeOfDay } from "@/db/schema";
import { isSuggestedNow } from "@/lib/suggested-now";
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
 * Sort checklist: suggested-for-now first, then by phase affinity, then name.
 */
export function orderProtocolsForNow(
  protocols: Protocol[],
  opts: {
    phase: Phase;
    localHour: number;
    completionCounts: Record<string, number>;
  },
): { suggested: Protocol[]; rest: Protocol[] } {
  const { phase, localHour, completionCounts } = opts;

  const scored = protocols.map((p) => {
    const count = completionCounts[p.id] ?? 0;
    const ideal = idealSlot(p);
    // "anytime" stays in rest so Suggested now stays sharp
    const suggested =
      count === 0 &&
      ideal !== "anytime" &&
      isSuggestedNow(p, localHour);
    const rank = slotRank(ideal, phase);
    const doneBoost = count > 0 ? 100 : 0;
    return { p, suggested, rank: rank + doneBoost };
  });

  scored.sort((a, b) => {
    if (a.suggested !== b.suggested) return a.suggested ? -1 : 1;
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.p.name.localeCompare(b.p.name);
  });

  const suggested = scored.filter((s) => s.suggested).map((s) => s.p);
  const rest = scored.filter((s) => !s.suggested).map((s) => s.p);
  return { suggested, rest };
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
