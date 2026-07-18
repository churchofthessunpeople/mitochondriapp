"use client";

import { ArrowLeft, Footprints } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  MOVEMENT_SETTING_OPTIONS,
  movementSettingBasePoints,
  type MovementSetting,
} from "@/lib/movement-setting";
import { DURATION_BLOCK_MINUTES, pointsForLog } from "@/lib/scoring";

type Step = "setting" | "duration";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (setting: MovementSetting, durationMinutes: number) => void;
  onCancel: () => void;
};

/**
 * Movement / exercise: environment → duration.
 * Multi-choice steps show one option at a time.
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

  const settingOptions: ClickThroughOption[] = useMemo(
    () =>
      MOVEMENT_SETTING_OPTIONS.map((opt) => ({
        id: opt.id,
        title: opt.label,
        subtitle: `${opt.detail} · ${movementSettingBasePoints(opt.id, protocol.points)} pts / ${DURATION_BLOCK_MINUTES} min`,
        highlight: opt.id === "full_sunlight",
      })),
    [protocol.points],
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
          <div className="mt-4">
            <OptionListChoice
              options={settingOptions}
              selectedId={setting}
              disabled={pending}
              onChoose={(id) => {
                setSetting(id as MovementSetting);
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
                onLog(setting, mins);
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
