"use client";

import { ArrowLeft, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import { currentLocalHm } from "@/lib/sunrise-timing";
import {
  DURATION_BLOCK_MINUTES,
  pointsForLog,
} from "@/lib/scoring";
import {
  SUN_EXPOSURE_SLOTS,
  SUN_SKIN_OPTIONS,
  sunExposureBasePoints,
  sunExposureSlotDef,
  sunSlotFromLocalHm,
  type SunExposureLogInput,
  type SunExposureSlot,
  type SunSkinExposure,
} from "@/lib/sun-exposure";

type Step = "time" | "grounded" | "skin" | "duration";

type Props = {
  protocol: Protocol;
  timeZone: string;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (input: SunExposureLogInput, durationMinutes: number) => void;
  onCancel: () => void;
};

/**
 * Daytime sun exposure: time → grounded → skin → duration.
 * Multi-choice steps show one option at a time.
 */
export function SunExposureDialog({
  protocol,
  timeZone,
  pending,
  sunriseMultiplier = 1,
  onLog,
  onCancel,
}: Props) {
  const [step, setStep] = useState<Step>("time");
  const [startHm, setStartHm] = useState(() => currentLocalHm(timeZone));
  const [slotOverride, setSlotOverride] = useState<SunExposureSlot | null>(
    null,
  );
  const [grounded, setGrounded] = useState(true);
  const [skin, setSkin] = useState<SunSkinExposure>("full");
  const [durationMins, setDurationMins] = useState(DURATION_BLOCK_MINUTES);

  const slot = slotOverride ?? sunSlotFromLocalHm(startHm);
  const slotDef = sunExposureSlotDef(slot);

  const input: SunExposureLogInput = useMemo(
    () => ({ slot, grounded, skin, startHm }),
    [slot, grounded, skin, startHm],
  );

  const basePoints = sunExposureBasePoints(protocol.points, input, { slot });
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

  const slotOptions: ClickThroughOption[] = useMemo(
    () =>
      SUN_EXPOSURE_SLOTS.map((s) => ({
        id: s.id,
        title: s.label,
        subtitle: s.clockLabel,
        highlight: s.id === slot,
      })),
    [slot],
  );

  const groundedOptions: ClickThroughOption[] = useMemo(
    () => [
      {
        id: "yes",
        title: "Yes — barefoot on earth",
        subtitle: "Soil, grass, sand, or stone",
        highlight: true,
      },
      {
        id: "no",
        title: "No — not grounded",
        subtitle: "Shoes, pavement, or indoors patio",
      },
    ],
    [],
  );

  const skinOptions: ClickThroughOption[] = useMemo(
    () =>
      SUN_SKIN_OPTIONS.map((opt) => ({
        id: opt.id,
        title: opt.label,
        subtitle: opt.detail,
        highlight: opt.id === "full",
      })),
    [],
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
    if (step === "grounded") setStep("time");
    else if (step === "skin") setStep("grounded");
    else if (step === "duration") setStep("skin");
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
              Sun exposure
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {step === "time" && "When were you outside?"}
              {step === "grounded" && "Were you grounded?"}
              {step === "skin" && "How much skin was exposed?"}
              {step === "duration" && "How long?"}
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

        {step !== "time" && (
          <button
            type="button"
            onClick={goBack}
            className="mt-3 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        )}

        {step === "time" && (
          <div className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted">
                Session start
              </span>
              <input
                type="time"
                value={startHm}
                onChange={(e) => {
                  setStartHm(e.target.value);
                  setSlotOverride(null);
                }}
                className="field-input w-full rounded-2xl px-3 py-3 text-sm"
              />
            </label>
            <p className="text-xs text-muted">
              Suggested slot:{" "}
              <span className="font-medium text-foreground">
                {slotDef.label}
              </span>{" "}
              ({slotDef.clockLabel}). Tap your slot below.
            </p>
            <OptionListChoice
              options={slotOptions}
              selectedId={slot}
              disabled={pending}
              onChoose={(id) => {
                const s = SUN_EXPOSURE_SLOTS.find((x) => x.id === id);
                if (!s) return;
                setSlotOverride(s.id);
                const mid = s.startHour + 1;
                setStartHm(`${String(mid).padStart(2, "0")}:00`);
                setStep("grounded");
              }}
            />
          </div>
        )}

        {step === "grounded" && (
          <div className="mt-4">
            <OptionListChoice
              options={groundedOptions}
              selectedId={grounded ? "yes" : "no"}
              disabled={pending}
              onChoose={(id) => {
                setGrounded(id === "yes");
                setStep("skin");
              }}
            />
          </div>
        )}

        {step === "skin" && (
          <div className="mt-4">
            <OptionListChoice
              options={skinOptions}
              selectedId={skin}
              disabled={pending}
              onChoose={(id) => {
                setSkin(id as SunSkinExposure);
                setStep("duration");
              }}
            />
          </div>
        )}

        {step === "duration" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-border bg-foreground/[0.03] px-3 py-2.5 text-xs text-muted">
              <p>
                <span className="font-medium text-foreground">
                  {slotDef.label}
                </span>{" "}
                · {grounded ? "grounded" : "not grounded"} ·{" "}
                {SUN_SKIN_OPTIONS.find((o) => o.id === skin)?.label}
              </p>
              <p className="mt-1">
                UV weighting by ZIP comes later — points use quality + duration
                for now.
              </p>
            </div>
            <OptionListChoice
              options={durationOptions}
              selectedId={String(durationMins)}
              disabled={pending}
              onChoose={(id) => {
                const mins = Number(id);
                setDurationMins(mins);
                onLog(input, mins);
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
