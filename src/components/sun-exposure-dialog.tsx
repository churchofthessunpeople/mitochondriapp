"use client";

import { Trees, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionGroup,
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

type Props = {
  protocol: Protocol;
  timeZone: string;
  sun?: SunTimes | null;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (input: SunExposureLogInput, durationMinutes: number) => void;
  onCancel: () => void;
};

/** Outside Time — slot, cover, and duration on one screen. */
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
      })),
    [sun, timeZone],
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
        })} pts`,
      })),
    [durationChoices, protocol, sunriseMultiplier, basePoints],
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="outside-time-title"
      >
        <div className="flex shrink-0 items-start gap-2 px-5 pt-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Trees className="h-4 w-4 shrink-0 text-accent" />
              <p id="outside-time-title" className="font-semibold leading-snug">
                {protocol.name}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Set time of day, sun or shade, and how long
            </p>
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4">
          <OptionGroup
            label="Time of day"
            options={slotOptions}
            selectedId={slot}
            disabled={pending}
            onChoose={(id) => setSlot(id as SunExposureSlot)}
          />
          <OptionGroup
            label="Sun or shade"
            options={coverOptions}
            selectedId={cover}
            disabled={pending}
            onChoose={(id) => setCover(id as OutsideCover)}
          />
          <OptionGroup
            label="Duration"
            options={durationOptions}
            selectedId={String(durationMins)}
            disabled={pending}
            onChoose={(id) => setDurationMins(Number(id))}
          />
        </div>

        <div className="shrink-0 space-y-2 border-t border-border px-5 py-4">
          <p className="text-center text-xs text-accent">
            Preview ≈ {previewPts} pts
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              onLog(
                { slot, cover, startHm: currentLocalHm(timeZone) },
                durationMins,
              )
            }
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "Logging…" : "Log Outside Time"}
          </button>
        </div>
      </div>
    </div>
  );
}
