"use client";

import { Snowflake, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionGroup,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  COLD_THERMO_MODE_OPTIONS,
  COLD_THERMO_SKIN_TEMP_OPTIONS,
  OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  coldThermoBasePoints,
  formatColdThermoSkinTemp,
  type ColdThermoLogInput,
  type ColdThermoMode,
  type ColdThermoSkinTempF,
} from "@/lib/cold-thermo-skin-temp";
import { DURATION_BLOCK_MINUTES, pointsForLog } from "@/lib/scoring";

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

/** Cold thermogenesis — mode, skin temp, and duration on one screen. */
export function ColdThermoDialog({
  protocol,
  pending,
  sunriseMultiplier = 1,
  initialTempF = OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  onLog,
  onCancel,
}: Props) {
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

  const previewPts = pointsForLog(protocol, durationMins, {
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
        return {
          id: String(t),
          title: formatColdThermoSkinTemp(t),
          subtitle: `${pts} pts / ${DURATION_BLOCK_MINUTES} min${
            t === OPTIMAL_COLD_THERMO_SKIN_TEMP_F ? " · target" : ""
          }`,
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
        aria-labelledby="cold-thermo-title"
      >
        <div className="flex shrink-0 items-start gap-2 px-5 pt-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 shrink-0 text-accent" />
              <p id="cold-thermo-title" className="font-semibold leading-snug">
                {protocol.name}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Set mode, skin temperature, and duration
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
            label="Mode"
            options={modeOptions}
            selectedId={mode}
            disabled={pending}
            onChoose={(id) => setMode(id as ColdThermoMode)}
          />
          <OptionGroup
            label="Skin temperature"
            options={tempOptions}
            selectedId={String(tempF)}
            disabled={pending}
            onChoose={(id) => setTempF(Number(id) as ColdThermoSkinTempF)}
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
          <p className="text-center text-xs text-muted">
            ≈ {previewPts} pts at {durationMins} min
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => onLog({ mode, skinTempF: tempF }, durationMins)}
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "Logging…" : "Log Cold Thermogenesis"}
          </button>
        </div>
      </div>
    </div>
  );
}
