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
  sunFromZip,
  timeZone,
}: {
  region: Region | null;
  sun: SunTimes;
  compact?: boolean;
  placeLabel?: string | null;
  postalCode?: string | null;
  /** Distance from user ZIP to curated region centroid */
  distanceKm?: number | null;
  /** True when sunrise/sunset used user lat/lng from ZIP */
  sunFromZip?: boolean;
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

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SunStat
          label="Sunrise"
          value={formatTimeInZone(sun.sunrise, tz)}
        />
        <SunStat
          label="Sunset"
          value={formatTimeInZone(sun.sunset, tz)}
        />
        <SunStat
          label="Day length"
          value={
            sun.dayLengthHours != null
              ? `${sun.dayLengthHours.toFixed(1)} h`
              : "—"
          }
        />
        <SunStat
          label={sunFromZip ? "Sun source" : "Timezone"}
          value={
            sunFromZip
              ? "Your ZIP"
              : (region?.timezone.split("/").pop() ?? "—")
          }
        />
      </div>

      {region && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <ScorePill label="Sun" score={region.sunScore} />
          <ScorePill label="Magnetism" score={region.magnetismScore} />
          <ScorePill label="Policy" score={region.policyScore} />
        </div>
      )}

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

function SunStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-foreground/[0.03] px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ScorePill({ label, score }: { label: string; score: number }) {
  return (
    <div className="rounded-2xl border border-border px-2 py-2 text-center">
      <p className="text-[10px] text-muted">{label}</p>
      <p
        className={cn(
          "text-lg font-semibold tabular-nums",
          score >= 4
            ? "text-accent"
            : score <= 2
              ? "text-accent-2"
              : "text-foreground",
        )}
      >
        {score}
      </p>
    </div>
  );
}
