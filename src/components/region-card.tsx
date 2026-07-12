import Link from "next/link";
import type { Region } from "@/db/schema";
import { formatDistanceKm } from "@/lib/geo";
import { ratingLabel } from "@/lib/regions";
import { formatTimeInZone, type SunTimes } from "@/lib/sun";
import { cn } from "@/lib/utils";

export function RegionCard({
  region,
  sun,
  compact,
  placeLabel,
  postalCode,
  distanceKm,
  timeZone,
}: {
  region: Region | null;
  sun: SunTimes;
  compact?: boolean;
  placeLabel?: string | null;
  postalCode?: string | null;
  /** Distance from user ZIP to curated region centroid */
  distanceKm?: number | null;
  timeZone?: string | null;
}) {
  const tz = timeZone || region?.timezone || "UTC";
  if (!region && !placeLabel) {
    return null;
  }

  return (
    <section className="glass rounded-3xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Your location
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            {placeLabel || region?.name || "Location"}
          </h2>
          <p className="text-xs text-muted">
            {postalCode ? `ZIP ${postalCode}` : null}
            {postalCode && region ? " · " : null}
            {region
              ? `Score from ${region.name}${
                  distanceKm != null && distanceKm > 25
                    ? ` (${formatDistanceKm(distanceKm)} away)`
                    : ""
                }`
              : null}
            {!region && placeLabel ? " · sun times only (no nearby rated region)" : null}
          </p>
        </div>
        {region && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Health score
            </p>
            <p className="text-2xl font-semibold tabular-nums text-accent">
              {region.healthRating}
              <span className="text-sm text-muted">/5</span>
            </p>
            <p className="text-[11px] text-accent-2">
              {ratingLabel(region.healthRating)}
            </p>
          </div>
        )}
      </div>

      {/* One 3-col grid so sun + score columns share the same tracks */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatCell
          label="Sunrise"
          value={formatTimeInZone(sun.sunrise, tz)}
        />
        <StatCell
          label="Sunset"
          value={formatTimeInZone(sun.sunset, tz)}
        />
        <StatCell
          label="Day length"
          value={
            sun.dayLengthHours != null
              ? `${sun.dayLengthHours.toFixed(1)} h`
              : "—"
          }
        />
        {region && (
          <>
            <StatCell
              label="Sun"
              value={String(region.sunScore)}
              valueClassName={scoreColor(region.sunScore)}
            />
            <StatCell
              label="Magnetism"
              value={String(region.magnetismScore)}
              valueClassName={scoreColor(region.magnetismScore)}
            />
            <StatCell
              label="Policy"
              value={String(region.policyScore)}
              valueClassName={scoreColor(region.policyScore)}
            />
          </>
        )}
      </div>

      {!compact && region && (
        <>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {region.summary}
          </p>
          <div className="mt-3 space-y-2 text-xs text-muted">
            <p>
              <span className="font-medium text-foreground">Magnetism: </span>
              {region.magnetismNotes}
            </p>
            <p>
              <span className="font-medium text-foreground">Light: </span>
              {region.lightNotes}
            </p>
            <p>
              <span className="font-medium text-foreground">Policy: </span>
              {region.policyNotes}
            </p>
          </div>
        </>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted">
        Scores are lifestyle-framework ratings for the nearest curated place —
        not a medical rating of your street.{" "}
        <Link href="/region" className="text-accent hover:underline">
          Change ZIP or region
        </Link>
      </p>
    </section>
  );
}

function scoreColor(score: number): string {
  if (score >= 4) return "text-accent";
  if (score <= 2) return "text-accent-2";
  return "text-foreground";
}

function StatCell({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-border bg-foreground/[0.03] px-2 py-2.5 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums leading-tight",
          valueClassName ?? "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
