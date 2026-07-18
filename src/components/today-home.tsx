"use client";

import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Flame,
  MapPin,
  Trophy,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Protocol, Region } from "@/db/schema";
import {
  LeaderboardPanel,
  type LeaderboardBoards,
} from "@/components/leaderboard-panel";
import { LwmStrip } from "@/components/lwm-strip";
import { RegionCard } from "@/components/region-card";
import { ScheduleDay } from "@/components/schedule-day";
import { ZipForm } from "@/components/zip-form";
import type { PermanentAutoLogSnap } from "@/lib/actions/favorites";
import type { OpenAppSheet } from "@/lib/app-sheets";
import type { TodaySection } from "@/lib/app-tabs";
import type { PlaceFactors } from "@/lib/place-factors";
import { enrichPlaceMagnetismAction } from "@/lib/actions/place";
import { ROUTES } from "@/lib/routes";
import {
  formatSunriseMultiplier,
  isCatalogSelectableProtocol,
} from "@/lib/scoring";
import type { SunTimes } from "@/lib/sun";
import type { WeeklySummary } from "@/lib/weekly";
import { formatTimeInZone } from "@/lib/sun";
import { cn, formatPoints } from "@/lib/utils";

export type { TodaySection };

type Props = {
  dateLabel: string;
  todayIso: string;
  allProtocols: Protocol[];
  availableIds: string[];
  onAvailableIdsChange: (ids: string[]) => void;
  completionCounts: Record<string, number>;
  completionDurations?: Record<string, number>;
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
  travelPostalCode?: string | null;
  travelLabel?: string | null;
  magneticoGauss?: number;
  sleepRoomTempF?: number;
  initialSection?: TodaySection | null;
  leaderboards?: LeaderboardBoards | null;
  currentUserId?: string;
  onOpenSheet?: OpenAppSheet;
  isAdmin?: boolean;
  onAdminEditContent?: (focus: string) => void;
};

const TABS: {
  id: TodaySection;
  label: string;
  shortLabel: string;
  icon: typeof ClipboardList;
}[] = [
  { id: "checklist", label: "Checklist", shortLabel: "Log", icon: ClipboardList },
  { id: "place", label: "Place", shortLabel: "Place", icon: MapPin },
  {
    id: "leaderboard",
    label: "Leaderboard",
    shortLabel: "Ranks",
    icon: Trophy,
  },
];

/**
 * Today: section tabs at top · collapsible day summary · focused activity panel.
 */
export function TodayHome({
  dateLabel,
  todayIso,
  allProtocols,
  availableIds,
  onAvailableIdsChange,
  completionCounts,
  completionDurations,
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
  travelPostalCode,
  travelLabel,
  magneticoGauss = 10,
  sleepRoomTempF = 65,
  initialSection,
  leaderboards,
  currentUserId,
  onOpenSheet,
  isAdmin = false,
  onAdminEditContent,
}: Props) {
  const hasPlace = Boolean(placeLabel || region);
  const [section, setSection] = useState<TodaySection>(() => {
    if (initialSection === "catalog") return "checklist";
    return initialSection ?? (hasPlace ? "checklist" : "place");
  });
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [liveCounts, setLiveCounts] = useState(completionCounts);
  const [liveDurations, setLiveDurations] = useState(completionDurations ?? {});
  const [livePoints, setLivePoints] = useState(dayPoints);
  const [liveStreak, setLiveStreak] = useState(streak);
  const [liveSunriseMult, setLiveSunriseMult] = useState(sunriseMultiplier);
  const [liveSunriseTierLabel, setLiveSunriseTierLabel] = useState(
    sunriseTierLabel ?? null,
  );
  const [livePlaceFactors, setLivePlaceFactors] = useState(placeFactors);
  const [placeMagnetismLoading, setPlaceMagnetismLoading] = useState(false);

  useEffect(() => {
    setLivePlaceFactors(placeFactors);
  }, [placeFactors]);

  useEffect(() => {
    if (section !== "place" || !livePlaceFactors) return;
    if (
      livePlaceFactors.geomag?.source === "bgs-wmm" &&
      livePlaceFactors.artificialEm
    ) {
      return;
    }

    let cancelled = false;
    setPlaceMagnetismLoading(true);
    const zip = isTravel ? (travelPostalCode ?? postalCode) : postalCode;
    enrichPlaceMagnetismAction(
      livePlaceFactors.latitude,
      livePlaceFactors.longitude,
      livePlaceFactors.elevationM,
      zip,
    )
      .then((enriched) => {
        if (cancelled) return;
        setLivePlaceFactors((prev) =>
          prev
            ? {
                ...prev,
                geomag: enriched.geomag,
                artificialEm: enriched.artificialEm ?? prev.artificialEm,
                elevationM: enriched.elevationM ?? prev.elevationM,
                elevationLabel:
                  enriched.elevationLabel ?? prev.elevationLabel,
              }
            : prev,
        );
      })
      .catch(() => {
        /* keep dipole baseline */
      })
      .finally(() => {
        if (!cancelled) setPlaceMagnetismLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    section,
    livePlaceFactors?.latitude,
    livePlaceFactors?.longitude,
    livePlaceFactors?.geomag?.source,
    livePlaceFactors?.artificialEm,
    postalCode,
    isTravel,
    travelPostalCode,
  ]);

  useEffect(() => {
    if (initialSection === "catalog") {
      setSection("checklist");
      return;
    }
    if (initialSection) setSection(initialSection);
  }, [initialSection]);

  function selectSection(next: TodaySection) {
    const resolved = next === "catalog" ? "checklist" : next;
    setSection(resolved);
    try {
      const url =
        resolved === "leaderboard"
          ? ROUTES.leaderboard
          : resolved === "place"
            ? "/app?t=place"
            : ROUTES.home;
      window.history.replaceState(null, "", url);
    } catch {
      /* ignore */
    }
  }

  // New calendar day (or hard navigation) — adopt server props once.
  // Do not sync on every prop change: logs update live state without /app revalidate.
  useEffect(() => {
    setLiveCounts(completionCounts);
    setLiveDurations(completionDurations ?? {});
    setLivePoints(dayPoints);
    setLiveStreak(streak);
    setLiveSunriseMult(sunriseMultiplier);
    setLiveSunriseTierLabel(sunriseTierLabel ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dateLabel only
  }, [dateLabel]);

  const onCompletionCountsChange = useCallback(
    (counts: Record<string, number>) => {
      setLiveCounts(counts);
    },
    [],
  );

  const onCompletionDurationsChange = useCallback(
    (durations: Record<string, number>) => {
      setLiveDurations(durations);
    },
    [],
  );

  const onPermanentAutoLog = useCallback((snap: PermanentAutoLogSnap) => {
    setLiveCounts((prev) => ({ ...prev, [snap.protocolId]: snap.count }));
    if (snap.dayPoints > 0) setLivePoints(snap.dayPoints);
    if (snap.streak.current > 0 || snap.streak.best > 0) {
      setLiveStreak(snap.streak);
    }
  }, []);

  const onStatsChange = useCallback(
    (s: {
      dayPoints: number;
      streak: { current: number; best: number };
      sunriseMultiplier?: number;
      sunriseTierLabel?: string | null;
    }) => {
      setLivePoints(s.dayPoints);
      setLiveStreak(s.streak);
      if (s.sunriseMultiplier != null) setLiveSunriseMult(s.sunriseMultiplier);
      if (s.sunriseTierLabel !== undefined) {
        setLiveSunriseTierLabel(s.sunriseTierLabel);
      }
    },
    [],
  );

  const catalogProtocols = useMemo(
    () => allProtocols.filter(isCatalogSelectableProtocol),
    [allProtocols],
  );

  const availableProtocols = useMemo(() => {
    const set = new Set(availableIds);
    return catalogProtocols.filter((p) => set.has(p.id));
  }, [catalogProtocols, availableIds]);

  const placeSummary = useMemo(() => {
    if (!placeLabel && !region) return "Set ZIP for sun times";
    const label = placeLabel || region?.name || "Location";
    if (!sun) return label;
    return `${label} · ↑${formatTimeInZone(sun.sunrise, timeZone)} ↓${formatTimeInZone(sun.sunset, timeZone)}`;
  }, [placeLabel, region, sun, timeZone]);

  const showMorningLightTip = liveSunriseMult <= 1;

  return (
    <div className="space-y-3">
      <div
        className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-foreground/[0.03] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Today sections"
      >
        {TABS.map((t) => {
          const active = section === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectSection(t.id)}
              className={cn(
                "flex min-w-0 flex-1 shrink-0 flex-col items-center gap-0.5 rounded-xl px-2 py-2 transition sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5",
                active
                  ? "bg-accent text-on-accent shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
              <span className="text-[10px] font-semibold sm:text-sm">
                <span className="sm:hidden">{t.shortLabel}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {section === "checklist" && (
        <div className="rounded-2xl border border-border bg-foreground/[0.02]">
          <button
            type="button"
            onClick={() => setOverviewOpen((o) => !o)}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
            aria-expanded={overviewOpen}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight">
                {dateLabel}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                <span className="tabular-nums">
                  {formatPoints(livePoints)} pts
                </span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-0.5 tabular-nums">
                  {liveStreak.current > 0 && (
                    <Flame className="h-3 w-3 text-accent-2" />
                  )}
                  {liveStreak.current}d streak
                </span>
                {!overviewOpen && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="truncate">{placeSummary}</span>
                  </>
                )}
              </p>
            </div>
            {overviewOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
            )}
          </button>

          {overviewOpen && (
            <div className="space-y-4 border-t border-border px-3.5 py-3.5">
              <p className="text-sm text-muted">
                Support mitochondrial function with light, water, and magnetism
                where you are.
              </p>
              <p className="truncate text-xs text-muted">{placeSummary}</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-border bg-foreground/[0.03] px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted">
                    Points
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums">
                    {formatPoints(livePoints)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-foreground/[0.03] px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted">
                    Streak
                  </p>
                  <p className="mt-0.5 inline-flex items-center justify-center gap-1 text-sm font-semibold tabular-nums">
                    {liveStreak.current > 0 && (
                      <Flame className="h-3.5 w-3.5 text-accent-2" />
                    )}
                    {liveStreak.current}d
                  </p>
                </div>
              </div>

              <LwmStrip
                completionCounts={liveCounts}
                protocols={allProtocols}
                sunriseMultiplier={liveSunriseMult}
                onOpenSheet={onOpenSheet}
              />

              {isTravel && travelUntil && (
                <p className="rounded-xl border border-accent/25 bg-accent/5 px-3 py-2 text-xs text-accent">
                  Travel mode through {travelUntil}
                </p>
              )}

              {liveSunriseMult > 1 ? (
                <p className="rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs leading-relaxed text-accent">
                  <span className="font-semibold">
                    {formatSunriseMultiplier(liveSunriseMult)} day boost
                  </span>
                  {liveSunriseTierLabel ? (
                    <span className="text-accent/90">
                      {" "}
                      · {liveSunriseTierLabel}
                    </span>
                  ) : null}
                </p>
              ) : (
                showMorningLightTip && (
                  <p className="rounded-xl border border-border px-3 py-2 text-xs leading-relaxed text-muted">
                    Morning light boosts the rest of today: horizon 2× · open
                    sky 1.5× · outside 1.25×
                  </p>
                )
              )}

              {seasonLine && (
                <p className="rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-muted">
                  <span className="font-medium text-foreground">Season · </span>
                  {seasonLine}
                </p>
              )}

              {weekly && (weekly.daysActive > 0 || weekly.lightLogs > 0) && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-border px-2 py-2">
                    <p className="text-[10px] uppercase text-muted">7d active</p>
                    <p className="text-sm font-semibold tabular-nums">
                      {weekly.daysActive}d
                    </p>
                  </div>
                  <div className="rounded-xl border border-border px-2 py-2">
                    <p className="text-[10px] uppercase text-muted">7d pts</p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatPoints(weekly.totalPoints)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border px-2 py-2">
                    <p className="text-[10px] uppercase text-muted">
                      Light logs
                    </p>
                    <p className="text-sm font-semibold tabular-nums text-accent">
                      {weekly.lightLogs}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div role="tabpanel" className="min-h-[12rem]">
        {section === "checklist" && (
          <ScheduleDay
            key={todayIso}
            protocols={availableProtocols}
            completionCounts={liveCounts}
            completionDurations={liveDurations}
            dayPoints={livePoints}
            streak={liveStreak}
            dateLabel={dateLabel}
            todayIso={todayIso}
            hideTitle
            compact
            catalogProtocols={catalogProtocols}
            availableIds={availableIds}
            onAvailableIdsChange={onAvailableIdsChange}
            onPermanentAutoLog={onPermanentAutoLog}
            isAdmin={isAdmin}
            onAdminEditContent={onAdminEditContent}
            phase={phase}
            localHour={localHour}
            seasonLine={seasonLine}
            weekly={weekly}
            sunriseMultiplier={liveSunriseMult}
            sunriseTierLabel={liveSunriseTierLabel}
            sun={sun}
            timeZone={timeZone}
            allProtocols={allProtocols}
            onCompletionCountsChange={onCompletionCountsChange}
            onCompletionDurationsChange={onCompletionDurationsChange}
            magneticoGauss={magneticoGauss}
            sleepRoomTempF={sleepRoomTempF}
            onStatsChange={onStatsChange}
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
                placeFactors={livePlaceFactors}
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

            {placeMagnetismLoading ? (
              <p className="text-center text-xs text-muted">
                Loading WMM magnetic field for your ZIP…
              </p>
            ) : null}

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

        {section === "leaderboard" && currentUserId && (
          <LeaderboardPanel
            compact
            boards={leaderboards ?? null}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}
