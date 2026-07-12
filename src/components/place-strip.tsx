import { MapPin } from "lucide-react";
import type { Region } from "@/db/schema";
import { formatTimeInZone, type SunTimes } from "@/lib/sun";

/**
 * Compact place context for Schedule home — not a full region card.
 * Parent handles navigation / tab switch (no nested links).
 */
export function PlaceStrip({
  placeLabel,
  region,
  sun,
  timeZone,
  phaseHint,
}: {
  placeLabel?: string | null;
  region?: Region | null;
  sun?: SunTimes | null;
  timeZone?: string | null;
  phaseHint?: string | null;
}) {
  const label = placeLabel || region?.name;
  const tz = timeZone || region?.timezone || "UTC";

  if (!label && !sun) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-foreground/[0.02] px-3.5 py-3 text-sm transition hover:border-accent/30">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted">
          <MapPin className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-medium text-foreground">Set your location</span>
          <span className="mt-0.5 block text-xs text-muted">
            ZIP unlocks sunrise/sunset for your day
          </span>
        </span>
        <span className="shrink-0 text-xs text-accent">Add →</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-foreground/[0.03] px-3.5 py-3 transition hover:border-accent/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
            Place
          </p>
          <p className="mt-0.5 truncate font-medium leading-snug">
            {label || "Your location"}
          </p>
          {sun && (
            <p className="mt-1 text-xs text-muted">
              ↑ {formatTimeInZone(sun.sunrise, tz)}
              {" · "}
              ↓ {formatTimeInZone(sun.sunset, tz)}
              {sun.dayLengthHours != null
                ? ` · ${sun.dayLengthHours.toFixed(1)}h day`
                : ""}
              {region ? ` · ${region.healthRating}/5` : ""}
            </p>
          )}
        </div>
        <span className="shrink-0 text-xs text-accent">Details</span>
      </div>
      {phaseHint && (
        <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted">
          {phaseHint}
        </p>
      )}
    </div>
  );
}
