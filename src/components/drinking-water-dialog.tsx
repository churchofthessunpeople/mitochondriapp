"use client";

import { ArrowLeft, Droplets, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  DEUTERIUM_PPM_OPTIONS,
  WATER_CARBONATION_OPTIONS,
  WATER_MINERAL_AMOUNT_OPTIONS,
  WATER_MINERAL_OPTIONS,
  WATER_SOURCE_OPTIONS,
  drinkingWaterBasePoints,
  normalizeDrinkingWaterInput,
  waterMineralLabel,
  waterSourceLabel,
  type DeuteriumPpm,
  type DrinkingWaterLogInput,
  type WaterCarbonation,
  type WaterMineral,
  type WaterMineralAmount,
  type WaterSource,
} from "@/lib/drinking-water";
import { pointsForLog } from "@/lib/scoring";

type Step = "source" | "ppm" | "mineral" | "amount" | "carbonation";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (input: DrinkingWaterLogInput) => void;
  onCancel: () => void;
};

/**
 * Drinking water: source → (DDW ppm) → minerals → (amount) → still/carbonated.
 */
export function DrinkingWaterDialog({
  protocol,
  pending,
  sunriseMultiplier = 1,
  onLog,
  onCancel,
}: Props) {
  const [step, setStep] = useState<Step>("source");
  const [source, setSource] = useState<WaterSource>("spring");
  const [deuteriumPpm, setDeuteriumPpm] = useState<DeuteriumPpm>(50);
  const [mineral, setMineral] = useState<WaterMineral>("none");
  const [mineralAmount, setMineralAmount] =
    useState<WaterMineralAmount>("quarter_tsp");
  const [carbonation, setCarbonation] = useState<WaterCarbonation>("still");

  const draft: DrinkingWaterLogInput = useMemo(
    () =>
      normalizeDrinkingWaterInput({
        source,
        carbonation,
        mineral,
        mineralAmount,
        deuteriumPpm,
      }),
    [source, carbonation, mineral, mineralAmount, deuteriumPpm],
  );

  const basePoints = useMemo(
    () => drinkingWaterBasePoints(draft, protocol.points),
    [draft, protocol.points],
  );

  const previewPts = pointsForLog(protocol, null, {
    sunriseMultiplier,
    basePoints,
  });

  const sourceOptions: ClickThroughOption[] = useMemo(
    () =>
      WATER_SOURCE_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: o.detail,
        highlight: o.id === "spring",
      })),
    [],
  );

  const ppmOptions: ClickThroughOption[] = useMemo(
    () =>
      DEUTERIUM_PPM_OPTIONS.map((ppm) => ({
        id: String(ppm),
        title: `${ppm} ppm deuterium`,
        subtitle:
          ppm <= 50
            ? "Strongly depleted"
            : ppm <= 105
              ? "Moderately depleted"
              : "Near natural (~150 ppm)",
        highlight: ppm === 50,
      })),
    [],
  );

  const mineralOptions: ClickThroughOption[] = useMemo(
    () =>
      WATER_MINERAL_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: o.detail,
        highlight: o.id === "salt",
      })),
    [],
  );

  const amountOptions: ClickThroughOption[] = useMemo(
    () =>
      WATER_MINERAL_AMOUNT_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: o.detail,
        highlight: o.id === "quarter_tsp",
      })),
    [],
  );

  const carbonationOptions: ClickThroughOption[] = useMemo(
    () =>
      WATER_CARBONATION_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: `${o.detail} · ≈ ${previewPts} pts`,
        highlight: o.id === "still",
      })),
    [previewPts],
  );

  function goBack() {
    if (step === "ppm") setStep("source");
    else if (step === "mineral") {
      setStep(source === "deuterium_depleted" ? "ppm" : "source");
    } else if (step === "amount") setStep("mineral");
    else if (step === "carbonation") {
      setStep(mineral === "none" ? "mineral" : "amount");
    }
  }

  const stepHint =
    step === "source"
      ? "What kind of water?"
      : step === "ppm"
        ? `${waterSourceLabel(source)} · deuterium concentration?`
        : step === "mineral"
          ? `${waterSourceLabel(source)} · remineralized?`
          : step === "amount"
            ? `${waterMineralLabel(mineral)} · how much?`
            : `${waterSourceLabel(source)} · still or carbonated?`;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drinking-water-title"
      >
        <div className="flex items-start gap-2">
          {step !== "source" ? (
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
              <Droplets className="h-4 w-4 shrink-0 text-accent" />
              <p
                id="drinking-water-title"
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

        {step === "source" ? (
          <div className="mt-4">
            <OptionListChoice
              options={sourceOptions}
              selectedId={source}
              disabled={pending}
              onChoose={(id) => {
                const next = id as WaterSource;
                setSource(next);
                setStep(next === "deuterium_depleted" ? "ppm" : "mineral");
              }}
            />
          </div>
        ) : step === "ppm" ? (
          <div className="mt-4">
            <OptionListChoice
              options={ppmOptions}
              selectedId={String(deuteriumPpm)}
              disabled={pending}
              onChoose={(id) => {
                setDeuteriumPpm(Number(id) as DeuteriumPpm);
                setStep("mineral");
              }}
            />
          </div>
        ) : step === "mineral" ? (
          <div className="mt-4">
            <OptionListChoice
              options={mineralOptions}
              selectedId={mineral}
              disabled={pending}
              onChoose={(id) => {
                const next = id as WaterMineral;
                setMineral(next);
                if (next === "none") setStep("carbonation");
                else setStep("amount");
              }}
            />
          </div>
        ) : step === "amount" ? (
          <div className="mt-4">
            <OptionListChoice
              options={amountOptions}
              selectedId={mineralAmount}
              disabled={pending}
              onChoose={(id) => {
                setMineralAmount(id as WaterMineralAmount);
                setStep("carbonation");
              }}
            />
          </div>
        ) : (
          <div className="mt-4">
            <OptionListChoice
              options={carbonationOptions}
              selectedId={carbonation}
              disabled={pending}
              onChoose={(id) => {
                const next = id as WaterCarbonation;
                setCarbonation(next);
                onLog(
                  normalizeDrinkingWaterInput({
                    source,
                    carbonation: next,
                    mineral,
                    mineralAmount,
                    deuteriumPpm,
                  }),
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
