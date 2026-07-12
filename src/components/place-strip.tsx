import { ChevronDown, MapPin } from "lucide-react";
import type { Region } from "@/db/schema";
import { formatTimeInZone, type SunTimes } from "@/lib/sun";
import { cn } from "@/lib/utils";

/**
 * Compact place summary — used collapsed on Today (expand for full place).
 */
export function PlaceStrip({
  placeLabel,
  region,
  sun,
  timeZone,
  phaseHint,
  compact,
  showChevron,
  expanded,
}: {
  placeLabel?: string | null;
  region?: Region | null;
  sun?: SunTimes | null;
  timeZone?: string | null;
  phaseHint?: string | null;
  compact?: boolean;
  showChevron?: boolean;
  expanded?: boolean;
}) {
  const label = placeLabel || region?.name;
  const tz = timeZone || region?.timezone || "UTC";

  if (!label && !sun) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-3.5 py-3 text-sm",
          !compact &&
            "rounded-2xl border border-dashed border-border bg-foreground/[0.02]",
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted">
          <MapPin className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-medium text-foreground">Set your location</span>
          <span className="mt-0.5 block text-xs text-muted">
            ZIP unlocks sunrise/sunset for your day
          </span>
        </span>
        {showChevron ? (
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted transition-transform",
              expanded && "rotate-180",
            )}
          />
        ) : (
          <span className="shrink-0 text-xs text-accent">Add →</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("px-3.5 py-3", !compact && "rounded-2xl border border-border bg-foreground/[0.03]")}>
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
        {showChevron ? (
          <ChevronDown
            className={cn(
              "mt-1 h-5 w-5 shrink-0 text-muted transition-transform",
              expanded && "rotate-180",
            )}
          />
        ) : (
          <span className="shrink-0 text-xs text-accent">Details</span>
        )}
      </div>
      {phaseHint && (
        <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted">
          {phaseHint}
        </p>
      )}
    </div>
  );
}
