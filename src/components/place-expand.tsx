"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import type { Region } from "@/db/schema";
import { PlaceStrip } from "@/components/place-strip";
import { RegionCard } from "@/components/region-card";
import { ZipForm } from "@/components/zip-form";
import type { PlaceFactors } from "@/lib/place-factors";
import type { SunTimes } from "@/lib/sun";
import { cn } from "@/lib/utils";

type Props = {
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  placeLabel: string | null;
  postalCode: string | null;
  region: Region | null;
  sun: SunTimes | null;
  timeZone: string;
  phaseHint: string | null;
  placeFactors: PlaceFactors | null;
  distanceKm: number | null;
  isTravel?: boolean;
  travelUntil?: string | null;
  homePostalCode?: string | null;
  travelLabel?: string | null;
  dateLabel?: string;
};

/**
 * Minimized place strip at top of Today; expand for full card + ZIP / travel.
 */
export function PlaceExpand({
  expanded,
  onExpandedChange,
  placeLabel,
  postalCode,
  region,
  sun,
  timeZone,
  phaseHint,
  placeFactors,
  distanceKm,
  isTravel,
  travelUntil,
  homePostalCode,
  travelLabel,
  dateLabel,
}: Props) {
  const hasPlace = Boolean(region || placeLabel);

  return (
    <div className="space-y-3">
      {isTravel && travelUntil && (
        <p className="rounded-2xl border border-accent/25 bg-accent/5 px-3.5 py-2 text-xs text-accent">
          Travel mode through {travelUntil} — sun times from temporary ZIP
        </p>
      )}

      <div className="glass overflow-hidden rounded-3xl">
        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          className="flex w-full items-start gap-2 p-1 text-left"
          aria-expanded={expanded}
        >
          <div className="min-w-0 flex-1">
            <PlaceStrip
              placeLabel={placeLabel}
              region={region}
              sun={sun}
              timeZone={timeZone}
              phaseHint={expanded ? null : phaseHint}
              compact
              showChevron
              expanded={expanded}
            />
          </div>
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
              <p className="text-xs text-muted">
                {dateLabel ? `${dateLabel} · ` : null}
                Full place context — scores, factors, ZIP / travel.{" "}
                <Link
                  href="/region/scoring"
                  className="text-accent hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  How scoring works
                </Link>
              </p>

              {hasPlace && sun ? (
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
                <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted">
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

              <p className="text-center text-xs text-muted">
                Override metro score?{" "}
                <Link
                  href="/region"
                  className="text-accent hover:underline"
                >
                  Browse rated regions
                </Link>
              </p>

              <button
                type="button"
                onClick={() => onExpandedChange(false)}
                className="flex w-full items-center justify-center gap-1 text-xs text-muted hover:text-foreground"
              >
                Collapse place
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
