"use client";

import { Dumbbell, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionGroup,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  EXERCISE_LOCATION_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  exerciseBasePoints,
  exerciseDurationChoices,
  type ExerciseLocation,
  type ExerciseLogInput,
  type ExerciseType,
} from "@/lib/exercise";
import { DURATION_BLOCK_MINUTES, pointsForLog } from "@/lib/scoring";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (input: ExerciseLogInput, durationMinutes: number) => void;
  onCancel: () => void;
};

/** Exercise — type, location, and duration on one screen. */
export function ExerciseDialog({
  protocol,
  pending,
  sunriseMultiplier = 1,
  onLog,
  onCancel,
}: Props) {
  const [type, setType] = useState<ExerciseType>("walking");
  const [location, setLocation] = useState<ExerciseLocation>("outdoors");
  const [durationMins, setDurationMins] = useState(
    Math.min(
      DURATION_BLOCK_MINUTES,
      protocol.maxDurationMinutes || DURATION_BLOCK_MINUTES,
    ),
  );

  const input: ExerciseLogInput = useMemo(
    () => ({ type, location }),
    [type, location],
  );

  const basePoints = useMemo(
    () => exerciseBasePoints(input, protocol.points),
    [input, protocol.points],
  );

  const previewPts = pointsForLog(protocol, durationMins, {
    sunriseMultiplier,
    basePoints,
  });

  const durationChoices = exerciseDurationChoices(
    protocol.maxDurationMinutes || 120,
  );

  const typeOptions: ClickThroughOption[] = useMemo(
    () =>
      EXERCISE_TYPE_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: o.detail,
      })),
    [],
  );

  const locationOptions: ClickThroughOption[] = useMemo(
    () =>
      EXERCISE_LOCATION_OPTIONS.map((o) => {
        const pts = exerciseBasePoints(
          { type, location: o.id },
          protocol.points,
        );
        return {
          id: o.id,
          title: o.label,
          subtitle: `${o.detail} · ${pts} pts / ${DURATION_BLOCK_MINUTES} min`,
        };
      }),
    [type, protocol.points],
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
        aria-labelledby="exercise-title"
      >
        <div className="flex shrink-0 items-start gap-2 px-5 pt-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 shrink-0 text-accent" />
              <p id="exercise-title" className="font-semibold leading-snug">
                {protocol.name}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Set type, place, and duration
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
            label="Type"
            options={typeOptions}
            selectedId={type}
            disabled={pending}
            onChoose={(id) => setType(id as ExerciseType)}
          />
          <OptionGroup
            label="Place"
            options={locationOptions}
            selectedId={location}
            disabled={pending}
            onChoose={(id) => setLocation(id as ExerciseLocation)}
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
            onClick={() => onLog({ type, location }, durationMins)}
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "Logging…" : "Log Exercise"}
          </button>
        </div>
      </div>
    </div>
  );
}
