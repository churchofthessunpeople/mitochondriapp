"use client";

import { ArrowLeft, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
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
import { cn } from "@/lib/utils";

type Step = "time" | "grounded" | "skin" | "duration";

type Props = {
  protocol: Protocol;
  timeZone: string;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (input: SunExposureLogInput, durationMinutes: number) => void;
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
 * Daytime sun exposure: time → grounded → skin → duration.
 * Logs into morning / noon / afternoon slots (additive minutes per slot).
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
              Logs into{" "}
              <span className="font-medium text-foreground">
                {slotDef.label}
              </span>{" "}
              ({slotDef.clockLabel}). You can add more time to the same slot
              later.
            </p>
            <div className="grid gap-2">
              {SUN_EXPOSURE_SLOTS.map((s) => (
                <ChoiceButton
                  key={s.id}
                  title={s.label}
                  subtitle={s.clockLabel}
                  selected={slot === s.id}
                  onClick={() => {
                    setSlotOverride(s.id);
                    const mid = s.startHour + 1;
                    setStartHm(
                      `${String(mid).padStart(2, "0")}:00`,
                    );
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("grounded")}
              className="btn-primary h-11 w-full rounded-2xl text-sm font-semibold"
            >
              Continue
            </button>
          </div>
        )}

        {step === "grounded" && (
          <div className="mt-4 space-y-3">
            <ChoiceButton
              title="Yes — barefoot on earth"
              subtitle="Soil, grass, sand, or stone"
              selected={grounded}
              onClick={() => {
                setGrounded(true);
                setStep("skin");
              }}
            />
            <ChoiceButton
              title="No — not grounded"
              subtitle="Shoes, pavement, or indoors patio"
              selected={!grounded}
              onClick={() => {
                setGrounded(false);
                setStep("skin");
              }}
            />
          </div>
        )}

        {step === "skin" && (
          <div className="mt-4 space-y-3">
            {SUN_SKIN_OPTIONS.map((opt) => (
              <ChoiceButton
                key={opt.id}
                title={opt.label}
                subtitle={opt.detail}
                selected={skin === opt.id}
                onClick={() => {
                  setSkin(opt.id);
                  setStep("duration");
                }}
              />
            ))}
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
            <div className="flex flex-wrap gap-2">
              {durationChoices.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMins(m)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                    durationMins === m
                      ? "bg-accent text-on-accent"
                      : "border border-border text-muted",
                  )}
                >
                  {m} min
                </button>
              ))}
            </div>
            <label className="block text-xs text-muted">
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
            <p className="text-xs text-accent">≈ {previewPts} pts this log</p>
            <button
              type="button"
              disabled={pending}
              onClick={() => onLog(input, durationMins)}
              className="btn-primary h-11 w-full rounded-2xl text-sm font-semibold disabled:opacity-50"
            >
              {pending
                ? "Logging…"
                : `Log ${durationMins} min · ${slotDef.label}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
