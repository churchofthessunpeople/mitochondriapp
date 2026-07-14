"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Protocol, Region } from "@/db/schema";
import { ActivityCatalogExpand } from "@/components/activity-catalog-expand";
import { LwmStrip } from "@/components/lwm-strip";
import { RegionCard } from "@/components/region-card";
import { ScheduleDay } from "@/components/schedule-day";
import { ZipForm } from "@/components/zip-form";
import type { OpenAppSheet } from "@/lib/app-sheets";
import type { PlaceFactors } from "@/lib/place-factors";
import type { SunTimes } from "@/lib/sun";
import type { WeeklySummary } from "@/lib/weekly";
import { formatTimeInZone } from "@/lib/sun";
import { cn } from "@/lib/utils";

export type TodaySection = "checklist" | "place" | "catalog";

type Props = {
  dateLabel: string;
  allProtocols: Protocol[];
  availableIds: string[];
  onAvailableIdsChange: (ids: string[]) => void;
  completionCounts: Record<string, number>;
  dayPoints: number;
  streak: { current: number; best: number };
  placeLabel: string | null;
  postalCode: string | null;
  region: Region | null;
  sun: SunTimes | null;
  timeZone: string;
  phaseHint: string | null;
  placeFactors: PlaceFactors | null;
  distanceKm: number | null;
  phase: "night" | "sunrise" | "day" | "sunset";
  localHour: number;
  seasonLine: string | null;
  weekly: WeeklySummary | null;
  sunriseMultiplier: number;
  sunriseTierLabel?: string | null;
  isTravel?: boolean;
  travelUntil?: string | null;
  homePostalCode?: string | null;
  travelLabel?: string | null;
  onOpenSheet?: OpenAppSheet;
};

const TABS: { id: TodaySection; label: string }[] = [
  { id: "checklist", label: "Checklist" },
  { id: "place", label: "Place" },
  { id: "catalog", label: "Catalog" },
];

/**
 * Today: header + tab row (Checklist | Place | Catalog) + one panel.
 */
export function TodayHome({
  dateLabel,
  allProtocols,
  availableIds,
  onAvailableIdsChange,
  completionCounts,
  dayPoints,
  streak,
  placeLabel,
  postalCode,
  region,
  sun,
  timeZone,
  phaseHint,
  placeFactors,
  distanceKm,
  phase,
  localHour,
  seasonLine,
  weekly,
  sunriseMultiplier,
  sunriseTierLabel,
  isTravel,
  travelUntil,
  homePostalCode,
  travelLabel,
  onOpenSheet,
}: Props) {
  const hasPlace = Boolean(placeLabel || region);
  const [section, setSection] = useState<TodaySection>(
    hasPlace ? "checklist" : "place",
  );
  const [liveCounts, setLiveCounts] = useState(completionCounts);

  useEffect(() => {
    setLiveCounts(completionCounts);
  }, [completionCounts]);

  const onCompletionCountsChange = useCallback(
    (counts: Record<string, number>) => {
      setLiveCounts((prev) => {
        const pk = Object.keys(prev);
        const nk = Object.keys(counts);
        if (
          pk.length === nk.length &&
          pk.every((k) => prev[k] === counts[k])
        ) {
          return prev;
        }
        return counts;
      });
    },
    [],
  );

  const availableProtocols = useMemo(() => {
    const set = new Set(availableIds);
    return allProtocols.filter((p) => set.has(p.id));
  }, [allProtocols, availableIds]);

  const placeSummary = useMemo(() => {
    if (!placeLabel && !region) return "Set ZIP for sun times";
    const label = placeLabel || region?.name || "Location";
    if (!sun) return label;
    return `${label} · ↑${formatTimeInZone(sun.sunrise, timeZone)} ↓${formatTimeInZone(sun.sunset, timeZone)}`;
  }, [placeLabel, region, sun, timeZone]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">
          Today
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {dateLabel}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Support mitochondrial function with light, water, and magnetism where
          you are.
        </p>
        <p className="mt-1 truncate text-xs text-muted">{placeSummary}</p>
      </div>

      <LwmStrip
        completionCounts={liveCounts}
        protocols={allProtocols}
        sunriseMultiplier={sunriseMultiplier}
        onOpenSheet={onOpenSheet}
      />

      {isTravel && travelUntil && (
        <p className="rounded-2xl border border-accent/25 bg-accent/5 px-3.5 py-2 text-xs text-accent">
          Travel mode through {travelUntil}
        </p>
      )}

      <div
        className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-foreground/[0.03] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Today sections"
      >
        {TABS.map((t) => {
          const active = section === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSection(t.id)}
              className={cn(
                "min-w-0 flex-1 shrink-0 rounded-xl px-2.5 py-2.5 text-center text-xs font-semibold transition sm:px-3 sm:text-sm",
                active
                  ? "bg-accent text-on-accent shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="min-h-[12rem]">
        {section === "checklist" && (
          <ScheduleDay
            protocols={availableProtocols}
            completionCounts={completionCounts}
            dayPoints={dayPoints}
            streak={streak}
            dateLabel={dateLabel}
            hideTitle
            onExpandCatalog={() => setSection("catalog")}
            phase={phase}
            localHour={localHour}
            seasonLine={seasonLine}
            weekly={weekly}
            sunriseMultiplier={sunriseMultiplier}
            sunriseTierLabel={sunriseTierLabel}
            sun={sun}
            timeZone={timeZone}
            allProtocols={allProtocols}
            onCompletionCountsChange={onCompletionCountsChange}
          />
        )}

        {section === "place" && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              <strong className="font-medium text-foreground">Light</strong>{" "}
              environment (sun times, latitude) and{" "}
              <strong className="font-medium text-foreground">Magnetism</strong>{" "}
              place context (geology).{" "}
              {onOpenSheet ? (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenSheet({ id: "guideLight" })}
                    className="text-accent hover:underline"
                  >
                    Light
                  </button>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => onOpenSheet({ id: "guideMagnetism" })}
                    className="text-accent hover:underline"
                  >
                    Magnetism
                  </button>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => onOpenSheet({ id: "scoring" })}
                    className="text-accent hover:underline"
                  >
                    How scores work
                  </button>
                </>
              ) : null}
            </p>

            {(region || placeLabel) && sun ? (
              <RegionCard
                region={region}
                sun={sun}
                placeLabel={placeLabel}
                postalCode={
                  isTravel ? travelLabel || postalCode : postalCode
                }
                distanceKm={distanceKm}
                timeZone={timeZone}
                placeFactors={placeFactors}
                phaseHint={phaseHint}
              />
            ) : (
              <div className="glass rounded-3xl border border-dashed border-border p-5 text-sm text-muted">
                <p className="font-medium text-foreground">No location yet</p>
                <p className="mt-1">
                  Enter a US ZIP for sunrise/sunset and the nearest lifestyle
                  score.
                </p>
              </div>
            )}

            <ZipForm
              currentZip={homePostalCode ?? postalCode}
              travelLabel={travelLabel}
              travelUntil={travelUntil}
            />

            {onOpenSheet ? (
              <p className="text-center text-xs text-muted">
                Override metro score?{" "}
                <button
                  type="button"
                  onClick={() => onOpenSheet({ id: "regions" })}
                  className="text-accent hover:underline"
                >
                  Browse rated regions
                </button>
              </p>
            ) : null}
          </div>
        )}

        {section === "catalog" && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Grouped by{" "}
              <strong className="font-medium text-foreground">
                Light · Water · Magnetism · Support
              </strong>
              . Toggle only what you can actually do.
            </p>
            <ActivityCatalogExpand
              protocols={allProtocols}
              availableIds={availableIds}
              onAvailableIdsChange={onAvailableIdsChange}
              embedded
            />
          </div>
        )}
      </div>
    </div>
  );
}
