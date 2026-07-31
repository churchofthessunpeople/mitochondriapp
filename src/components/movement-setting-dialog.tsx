"use client";

import { Footprints, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionGroup,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  MOVEMENT_SETTING_OPTIONS,
  movementSettingBasePoints,
  type MovementSetting,
} from "@/lib/movement-setting";
import { DURATION_BLOCK_MINUTES, pointsForLog } from "@/lib/scoring";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (setting: MovementSetting, durationMinutes: number) => void;
  onCancel: () => void;
};

/** Movement / exercise — environment and duration on one screen. */
export function MovementSettingDialog({
  protocol,
  pending,
  sunriseMultiplier = 1,
  onLog,
  onCancel,
}: Props) {
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
        aria-labelledby="movement-setting-title"
      >
        <div className="flex shrink-0 items-start gap-2 px-5 pt-5">
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
              Set where you moved and for how long
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
            label="Setting"
            options={settingOptions}
            selectedId={setting}
            disabled={pending}
            onChoose={(id) => setSetting(id as MovementSetting)}
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
            onClick={() => onLog(setting, durationMins)}
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "Logging…" : "Log session"}
          </button>
        </div>
      </div>
    </div>
  );
}
