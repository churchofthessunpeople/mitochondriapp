"use client";

import { ArrowLeft, Trees, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import { currentLocalHm } from "@/lib/sunrise-timing";
import { DURATION_BLOCK_MINUTES, pointsForLog } from "@/lib/scoring";
import type { SunTimes } from "@/lib/sun";
import {
  OUTSIDE_COVER_OPTIONS,
  SUN_EXPOSURE_SLOTS,
  sunExposureBasePoints,
  sunExposureSlotClockLabel,
  sunSlotFromLocalHm,
  type OutsideCover,
  type SunExposureLogInput,
  type SunExposureSlot,
} from "@/lib/sun-exposure";

type Step = "slot" | "cover" | "duration";

type Props = {
  protocol: Protocol;
  timeZone: string;
  sun?: SunTimes | null;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (input: SunExposureLogInput, durationMinutes: number) => void;
  onCancel: () => void;
};

/** Outside Time: slot → full sun / shaded → duration. */
export function SunExposureDialog({
  protocol,
  timeZone,
  sun = null,
  pending,
  sunriseMultiplier = 1,
  onLog,
  onCancel,
}: Props) {
  const suggestedSlot = useMemo(
    () => sunSlotFromLocalHm(currentLocalHm(timeZone), { sun, timeZone }),
    [sun, timeZone],
  );

  const [step, setStep] = useState<Step>("slot");
  const [slot, setSlot] = useState<SunExposureSlot>(suggestedSlot);
  const [cover, setCover] = useState<OutsideCover>("full_sun");
  const [durationMins, setDurationMins] = useState(DURATION_BLOCK_MINUTES);

  const basePoints = useMemo(
    () => sunExposureBasePoints(protocol.points, { slot, cover }),
    [protocol.points, slot, cover],
  );

  const previewPts = pointsForLog(protocol, durationMins, {
    sunriseMultiplier,
    basePoints,
  });

  const maxMins = protocol.maxDurationMinutes || 120;
  const durationChoices = [
    DURATION_BLOCK_MINUTES,
    DURATION_BLOCK_MINUTES * 2,
    DURATION_BLOCK_MINUTES * 3,
    Math.min(maxMins, DURATION_BLOCK_MINUTES * 4),
    Math.min(maxMins, DURATION_BLOCK_MINUTES * 6),
    Math.min(maxMins, DURATION_BLOCK_MINUTES * 8),
  ].filter((m, i, arr) => m <= maxMins && arr.indexOf(m) === i);

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

  const coverOptions: ClickThroughOption[] = useMemo(
    () =>
      OUTSIDE_COVER_OPTIONS.map((c) => ({
        id: c.id,
        title: c.label,
        subtitle: `${c.detail} · ${sunExposureBasePoints(protocol.points, {
          slot,
          cover: c.id,
        })} pts / ${DURATION_BLOCK_MINUTES} min`,
        highlight: c.id === "full_sun",
      })),
    [protocol.points, slot],
  );

  const durationOptions: ClickThroughOption[] = useMemo(
    () =>
      durationChoices.map((m) => ({
        id: String(m),
        title: `${m} minutes`,
        subtitle: `≈ ${pointsForLog(protocol, m, {
          sunriseMultiplier,
          basePoints,
        })} pts this log`,
        highlight: m === DURATION_BLOCK_MINUTES,
      })),
    [durationChoices, protocol, sunriseMultiplier, basePoints],
  );

  function goBack() {
    if (step === "cover") setStep("slot");
    else if (step === "duration") setStep("cover");
  }

  const slotLabel =
    SUN_EXPOSURE_SLOTS.find((s) => s.id === slot)?.label ?? slot;
  const coverLabel =
    OUTSIDE_COVER_OPTIONS.find((c) => c.id === cover)?.label ?? cover;

  const stepHint =
    step === "slot"
      ? "When were you outside?"
      : step === "cover"
        ? `${slotLabel} · full sun or shade?`
        : `${slotLabel} · ${coverLabel} · ${basePoints} pts / ${DURATION_BLOCK_MINUTES} min`;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="outside-time-title"
      >
        <div className="flex items-start gap-2">
          {step !== "slot" ? (
            <button
              type="button"
              onClick={goBack}
              className="mt-0.5 rounded-lg p-1 text-muted"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Trees className="h-4 w-4 shrink-0 text-accent" />
              <p
                id="outside-time-title"
                className="font-semibold leading-snug"
              >
                {protocol.name}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">{stepHint}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "slot" ? (
          <div className="mt-4">
            <OptionListChoice
              options={slotOptions}
              selectedId={suggestedSlot}
              disabled={pending}
              onChoose={(id) => {
                setSlot(id as SunExposureSlot);
                setStep("cover");
              }}
            />
          </div>
        ) : step === "cover" ? (
          <div className="mt-4">
            <OptionListChoice
              options={coverOptions}
              selectedId={cover}
              disabled={pending}
              onChoose={(id) => {
                setCover(id as OutsideCover);
                setStep("duration");
              }}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <OptionListChoice
              options={durationOptions}
              selectedId={String(durationMins)}
              disabled={pending}
              onChoose={(id) => {
                const mins = Number(id);
                setDurationMins(mins);
                onLog(
                  {
                    slot,
                    cover,
                    startHm: currentLocalHm(timeZone),
                  },
                  mins,
                );
              }}
            />
            <p className="text-center text-xs text-accent">
              Preview ≈ {previewPts} pts at {durationMins} min
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
