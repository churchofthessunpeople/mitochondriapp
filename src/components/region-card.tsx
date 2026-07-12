import Link from "next/link";
import type { Region } from "@/db/schema";
import { formatDistanceKm } from "@/lib/geo";
import type { PlaceFactors } from "@/lib/place-factors";
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
  placeFactors,
  phaseHint,
}: {
  region: Region | null;
  sun: SunTimes;
  compact?: boolean;
  placeLabel?: string | null;
  postalCode?: string | null;
  /** Distance from user ZIP to curated region centroid */
  distanceKm?: number | null;
  timeZone?: string | null;
  placeFactors?: PlaceFactors | null;
  /** Optional sun-phase protocol line (Today) */
  phaseHint?: string | null;
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
            {!region && placeLabel
              ? " · sun times only (no nearby rated region)"
              : null}
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

      {phaseHint && (
        <p className="mt-3 rounded-2xl border border-accent/20 bg-accent/5 px-3 py-2 text-xs leading-relaxed text-foreground">
          {phaseHint}
        </p>
      )}

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

      {placeFactors && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Place factors
          </p>
          <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-foreground/[0.02]">
            <FactorRow
              label="Solar noon"
              value={placeFactors.solarNoonLabel}
            />
            <FactorRow
              label="Latitude"
              value={`${placeFactors.latitudeLabel} · ${placeFactors.bandLabel}`}
            />
            <FactorRow label="UV season" value={placeFactors.uvSeasonLabel} />
            {placeFactors.elevationLabel && (
              <FactorRow
                label="Elevation"
                value={placeFactors.elevationLabel}
              />
            )}
            <FactorRow
              label="Nearest magma"
              value={placeFactors.geologyLabel}
              detail={placeFactors.geologyDetail}
            />
          </ul>
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
        Scores and place factors are a lifestyle framework for the nearest
        curated place — not a medical rating of your street.{" "}
        <Link href="/region" className="text-accent hover:underline">
          Change ZIP or region
        </Link>
      </p>
    </section>
  );
}

function FactorRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <li className="flex items-start justify-between gap-3 px-3 py-2.5 text-xs">
      <span className="shrink-0 pt-0.5 text-muted">{label}</span>
      <div className="min-w-0 text-right">
        <p className="font-medium leading-snug text-foreground">{value}</p>
        {detail && (
          <p className="mt-0.5 text-[11px] font-normal leading-snug text-muted">
            {detail}
          </p>
        )}
      </div>
    </li>
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
