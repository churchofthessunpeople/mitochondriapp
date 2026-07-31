"use client";

import { Droplets, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionGroup,
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
  type DeuteriumPpm,
  type DrinkingWaterLogInput,
  type WaterCarbonation,
  type WaterMineral,
  type WaterMineralAmount,
  type WaterSource,
} from "@/lib/drinking-water";
import { pointsForLog } from "@/lib/scoring";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  sunriseMultiplier?: number;
  onLog: (input: DrinkingWaterLogInput) => void;
  onCancel: () => void;
};

/** Drinking water — source, minerals, and carbonation on one screen. */
export function DrinkingWaterDialog({
  protocol,
  pending,
  sunriseMultiplier = 1,
  onLog,
  onCancel,
}: Props) {
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
      })),
    [],
  );

  const mineralOptions: ClickThroughOption[] = useMemo(
    () =>
      WATER_MINERAL_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: o.detail,
      })),
    [],
  );

  const amountOptions: ClickThroughOption[] = useMemo(
    () =>
      WATER_MINERAL_AMOUNT_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: o.detail,
      })),
    [],
  );

  const carbonationOptions: ClickThroughOption[] = useMemo(
    () =>
      WATER_CARBONATION_OPTIONS.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: o.detail,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drinking-water-title"
      >
        <div className="flex shrink-0 items-start gap-2 px-5 pt-5">
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
            <p className="mt-1 text-xs text-muted">
              Set source, minerals, and still or sparkling
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
            label="Source"
            options={sourceOptions}
            selectedId={source}
            disabled={pending}
            onChoose={(id) => setSource(id as WaterSource)}
          />
          {source === "deuterium_depleted" ? (
            <OptionGroup
              label="Deuterium PPM"
              options={ppmOptions}
              selectedId={String(deuteriumPpm)}
              disabled={pending}
              onChoose={(id) => setDeuteriumPpm(Number(id) as DeuteriumPpm)}
            />
          ) : null}
          <OptionGroup
            label="Minerals"
            options={mineralOptions}
            selectedId={mineral}
            disabled={pending}
            onChoose={(id) => setMineral(id as WaterMineral)}
          />
          {mineral !== "none" ? (
            <OptionGroup
              label="Amount"
              options={amountOptions}
              selectedId={mineralAmount}
              disabled={pending}
              onChoose={(id) => setMineralAmount(id as WaterMineralAmount)}
            />
          ) : null}
          <OptionGroup
            label="Still or carbonated"
            options={carbonationOptions}
            selectedId={carbonation}
            disabled={pending}
            onChoose={(id) => setCarbonation(id as WaterCarbonation)}
          />
        </div>

        <div className="shrink-0 space-y-2 border-t border-border px-5 py-4">
          <p className="text-center text-xs text-accent">
            Preview ≈ {previewPts} pts
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => onLog(draft)}
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "Logging…" : "Log Drinking Water"}
          </button>
        </div>
      </div>
    </div>
  );
}
