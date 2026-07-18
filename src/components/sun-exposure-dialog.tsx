"use client";

import { Sun } from "lucide-react";
import { useMemo } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import { currentLocalHm } from "@/lib/sunrise-timing";
import { DURATION_BLOCK_MINUTES } from "@/lib/scoring";
import type { SunTimes } from "@/lib/sun";
import {
  SUN_EXPOSURE_SLOTS,
  sunExposureSlotClockLabel,
  sunSlotFromLocalHm,
  type SunExposureLogInput,
  type SunExposureSlot,
} from "@/lib/sun-exposure";

type Props = {
  protocol: Protocol;
  timeZone: string;
  sun?: SunTimes | null;
  pending?: boolean;
  onLog: (input: SunExposureLogInput, durationMinutes: number) => void;
  onCancel: () => void;
};

/** Pick morning / noon / afternoon sun, then log a 15-minute block. */
export function SunExposureDialog({
  protocol,
  timeZone,
  sun = null,
  pending,
  onLog,
  onCancel,
}: Props) {
  const suggestedSlot = useMemo(
    () => sunSlotFromLocalHm(currentLocalHm(timeZone), { sun, timeZone }),
    [sun, timeZone],
  );

  const slotOptions: ClickThroughOption[] = useMemo(
    () =>
      SUN_EXPOSURE_SLOTS.map((s) => ({
        id: s.id,
        title: s.label,
        subtitle: sunExposureSlotClockLabel(s.id, sun, timeZone),
        highlight: s.id === suggestedSlot,
      })),
    [sun, timeZone, suggestedSlot],
  );

  function logSlot(slot: SunExposureSlot) {
    onLog(
      {
        slot,
        startHm: currentLocalHm(timeZone),
      },
      DURATION_BLOCK_MINUTES,
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sun-exposure-title"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Sun className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="sun-exposure-title"
              className="text-lg font-semibold tracking-tight"
            >
              {protocol.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Which sun window? Each choice logs {DURATION_BLOCK_MINUTES}{" "}
              minutes.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4">
          <OptionListChoice
            options={slotOptions}
            selectedId={suggestedSlot}
            disabled={pending}
            onChoose={(id) => logSlot(id as SunExposureSlot)}
          />
        </div>
      </div>
    </div>
  );
}
