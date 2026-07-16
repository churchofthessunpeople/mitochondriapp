"use client";

import { ArrowLeft, Footprints } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  MOVEMENT_SETTING_OPTIONS,
  movementSettingBasePoints,
  type MovementSetting,
} from "@/lib/movement-setting";
import { DURATION_BLOCK_MINUTES, pointsForLog } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type Step = "setting" | "duration";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (setting: MovementSetting, durationMinutes: number) => void;
  onCancel: () => void;
};

function ChoiceButton({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left transition",
        selected
          ? "border-accent/40 bg-accent/10"
          : "border-border bg-foreground/[0.02] hover:border-accent/30",
      )}
    >
      <span className="text-sm font-semibold text-foreground">{title}</span>
      {subtitle ? (
        <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
      ) : null}
    </button>
  );
}

/**
 * Movement / exercise: environment (sunlight / outside / indoors) → duration.
 */
export function MovementSettingDialog({
  protocol,
  pending,
  sunriseMultiplier = 1,
  onLog,
  onCancel,
}: Props) {
  const [step, setStep] = useState<Step>("setting");
  const [setting, setSetting] = useState<MovementSetting>("full_sunlight");
  const [durationMins, setDurationMins] = useState(DURATION_BLOCK_MINUTES);

  const basePoints = useMemo(
    () => movementSettingBasePoints(setting, protocol.points),
    [setting, protocol.points],
  );

  const previewPts = pointsForLog(protocol, durationMins, {
    sunriseMultiplier,
    basePoints,
  });

  const maxMins = protocol.maxDurationMinutes || 60;
  const durationChoices = [
    DURATION_BLOCK_MINUTES,
    DURATION_BLOCK_MINUTES * 2,
    DURATION_BLOCK_MINUTES * 3,
    Math.min(maxMins, DURATION_BLOCK_MINUTES * 4),
  ].filter((m, i, arr) => m <= maxMins && arr.indexOf(m) === i);

  function goBack() {
    if (step === "duration") setStep("setting");
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movement-setting-title"
      >
        <div className="flex items-start gap-2">
          {step === "duration" ? (
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
              <Footprints className="h-4 w-4 shrink-0 text-accent" />
              <p
                id="movement-setting-title"
                className="font-semibold leading-snug"
              >
                {protocol.name}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">
              {step === "setting"
                ? "Where did you do this session?"
                : `${MOVEMENT_SETTING_OPTIONS.find((o) => o.id === setting)?.label ?? setting} · ${basePoints} pts / ${DURATION_BLOCK_MINUTES} min`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-muted"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {step === "setting" ? (
          <div className="mt-4 space-y-2">
            {MOVEMENT_SETTING_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.id}
                title={opt.label}
                subtitle={`${opt.detail} · ${movementSettingBasePoints(opt.id, protocol.points)} pts / 15 min`}
                selected={setting === opt.id}
                onClick={() => setSetting(opt.id)}
              />
            ))}
            <button
              type="button"
              onClick={() => setStep("duration")}
              className="btn-primary mt-2 h-11 w-full rounded-2xl text-sm font-semibold"
            >
              Next — set duration
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Duration
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {durationChoices.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMins(m)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm",
                    durationMins === m
                      ? "bg-accent text-on-accent"
                      : "border border-border text-muted",
                  )}
                >
                  {m} min
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs text-muted">
              Minutes
              <input
                type="number"
                min={1}
                max={maxMins}
                value={durationMins}
                onChange={(e) =>
                  setDurationMins(
                    Math.min(
                      maxMins,
                      Math.max(1, Number(e.target.value) || 1),
                    ),
                  )
                }
                className="field-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
              />
            </label>
            <p className="mt-3 text-xs text-accent">
              ≈ {previewPts} pts this log
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => onLog(setting, durationMins)}
              className="btn-primary mt-4 h-11 w-full rounded-2xl text-sm font-semibold disabled:opacity-60"
            >
              Log {durationMins} min
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
