"use client";

import { ArrowLeft, Dumbbell, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  EXERCISE_LOCATION_OPTIONS,
  EXERCISE_TYPE_OPTIONS,
  exerciseBasePoints,
  exerciseDurationChoices,
  exerciseLocationLabel,
  exerciseTypeLabel,
  type ExerciseLocation,
  type ExerciseLogInput,
  type ExerciseType,
} from "@/lib/exercise";
import { DURATION_BLOCK_MINUTES, pointsForLog } from "@/lib/scoring";

type Step = "type" | "location" | "duration";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (input: ExerciseLogInput, durationMinutes: number) => void;
  onCancel: () => void;
};

/**
 * Exercise: type → indoors/outdoors → duration.
 */
export function ExerciseDialog({
  protocol,
  pending,
  sunriseMultiplier = 1,
  onLog,
  onCancel,
}: Props) {
  const [step, setStep] = useState<Step>("type");
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
        highlight: o.id === "walking",
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
          highlight: o.id === "outdoors",
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
        })} pts this log`,
        highlight: m === DURATION_BLOCK_MINUTES,
      })),
    [durationChoices, protocol, sunriseMultiplier, basePoints],
  );

  function goBack() {
    if (step === "location") setStep("type");
    else if (step === "duration") setStep("location");
  }

  const stepHint =
    step === "type"
      ? "What kind of exercise?"
      : step === "location"
        ? `${exerciseTypeLabel(type)} · indoors or outdoors?`
        : `${exerciseTypeLabel(type)} · ${exerciseLocationLabel(location).toLowerCase()} · ${basePoints} pts / ${DURATION_BLOCK_MINUTES} min`;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-title"
      >
        <div className="flex items-start gap-2">
          {step !== "type" ? (
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
              <Dumbbell className="h-4 w-4 shrink-0 text-accent" />
              <p id="exercise-title" className="font-semibold leading-snug">
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

        {step === "type" ? (
          <div className="mt-4">
            <OptionListChoice
              options={typeOptions}
              selectedId={type}
              disabled={pending}
              onChoose={(id) => {
                setType(id as ExerciseType);
                setStep("location");
              }}
            />
          </div>
        ) : step === "location" ? (
          <div className="mt-4">
            <OptionListChoice
              options={locationOptions}
              selectedId={location}
              disabled={pending}
              onChoose={(id) => {
                setLocation(id as ExerciseLocation);
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
                onLog({ type, location }, mins);
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
