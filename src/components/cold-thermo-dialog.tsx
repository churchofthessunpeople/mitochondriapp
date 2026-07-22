"use client";

import { ArrowLeft, Snowflake, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  COLD_THERMO_MODE_OPTIONS,
  COLD_THERMO_SKIN_TEMP_OPTIONS,
  FACE_IMMERSION_ROUNDS,
  OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  coldThermoBasePoints,
  coldThermoModeLabel,
  formatColdThermoSkinTemp,
  isColdThermoTimedMode,
  type ColdThermoLogInput,
  type ColdThermoMode,
  type ColdThermoSkinTempF,
} from "@/lib/cold-thermo-skin-temp";
import { DURATION_BLOCK_MINUTES, pointsForLog } from "@/lib/scoring";

type Step = "mode" | "temp" | "duration";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  sunriseMultiplier?: number;
  initialTempF?: ColdThermoSkinTempF;
  onLog: (input: ColdThermoLogInput, durationMinutes: number | null) => void;
  onCancel: () => void;
};

/** Skin-temp options that fit cold thermogenesis sessions (≤ max duration). */
export function coldThermoDurationChoices(maxMinutes: number): number[] {
  const max = Math.max(5, maxMinutes || 20);
  const candidates = [5, 10, 15, 20, 30, 45, 60];
  const picked = candidates.filter((m) => m <= max);
  if (picked.length === 0) return [Math.min(5, max)];
  if (!picked.includes(max) && max !== picked[picked.length - 1]) {
    picked.push(max);
  }
  return picked;
}

/**
 * Cold thermogenesis: mode → skin temperature → duration (plunge/shower only).
 * Face immersion logs immediately after temp (3 rounds).
 */
export function ColdThermoDialog({
  protocol,
  pending,
  sunriseMultiplier = 1,
  initialTempF = OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  onLog,
  onCancel,
}: Props) {
  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<ColdThermoMode>("plunge");
  const [tempF, setTempF] = useState<ColdThermoSkinTempF>(initialTempF);
  const [durationMins, setDurationMins] = useState(
    Math.min(
      DURATION_BLOCK_MINUTES,
      protocol.maxDurationMinutes || DURATION_BLOCK_MINUTES,
    ),
  );

  const input: ColdThermoLogInput = useMemo(
    () => ({ mode, skinTempF: tempF }),
    [mode, tempF],
  );

  const basePoints = useMemo(
    () => coldThermoBasePoints(input, protocol.points),
    [input, protocol.points],
  );

  const previewDuration = isColdThermoTimedMode(mode) ? durationMins : null;
  const previewPts = pointsForLog(protocol, previewDuration, {
    sunriseMultiplier,
    basePoints,
  });

  const durationChoices = coldThermoDurationChoices(
    protocol.maxDurationMinutes || 20,
  );

  const modeOptions: ClickThroughOption[] = useMemo(
    () =>
      COLD_THERMO_MODE_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: o.detail,
        highlight: o.id === "plunge",
      })),
    [],
  );

  const tempOptions: ClickThroughOption[] = useMemo(
    () =>
      COLD_THERMO_SKIN_TEMP_OPTIONS.map((t) => {
        const pts = coldThermoBasePoints(
          { mode, skinTempF: t },
          protocol.points,
        );
        const unit = isColdThermoTimedMode(mode)
          ? `${DURATION_BLOCK_MINUTES} min`
          : `${FACE_IMMERSION_ROUNDS} rounds`;
        return {
          id: String(t),
          title: formatColdThermoSkinTemp(t),
          subtitle: `${pts} pts / ${unit}${
            t === OPTIMAL_COLD_THERMO_SKIN_TEMP_F ? " · target" : ""
          }`,
          highlight: t === OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
        };
      }),
    [mode, protocol.points],
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
        highlight: m === 10 || m === DURATION_BLOCK_MINUTES,
      })),
    [durationChoices, protocol, sunriseMultiplier, basePoints],
  );

  function goBack() {
    if (step === "temp") setStep("mode");
    else if (step === "duration") setStep("temp");
  }

  const stepHint =
    step === "mode"
      ? "Cold plunge, shower, or face immersion?"
      : step === "temp"
        ? `${coldThermoModeLabel(mode)} · skin surface temperature?`
        : `${coldThermoModeLabel(mode)} · ${formatColdThermoSkinTemp(tempF)} · ${basePoints} pts / ${DURATION_BLOCK_MINUTES} min`;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cold-thermo-title"
      >
        <div className="flex items-start gap-2">
          {step !== "mode" ? (
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
              <Snowflake className="h-4 w-4 shrink-0 text-accent" />
              <p
                id="cold-thermo-title"
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

        {step === "mode" ? (
          <div className="mt-4">
            <OptionListChoice
              options={modeOptions}
              selectedId={mode}
              disabled={pending}
              onChoose={(id) => {
                setMode(id as ColdThermoMode);
                setStep("temp");
              }}
            />
          </div>
        ) : step === "temp" ? (
          <div className="mt-4">
            <OptionListChoice
              options={tempOptions}
              selectedId={String(tempF)}
              disabled={pending}
              onChoose={(id) => {
                const next = Number(id) as ColdThermoSkinTempF;
                setTempF(next);
                if (!isColdThermoTimedMode(mode)) {
                  onLog({ mode: "face_immersion", skinTempF: next }, null);
                } else {
                  setStep("duration");
                }
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
                onLog({ mode, skinTempF: tempF }, mins);
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
