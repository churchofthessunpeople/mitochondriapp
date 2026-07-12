"use client";

import { CalendarCheck, MapPin, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Protocol, Region } from "@/db/schema";
import { ActivityCatalogExpand } from "@/components/activity-catalog-expand";
import { PlaceStrip } from "@/components/place-strip";
import { RegionCard } from "@/components/region-card";
import { ScheduleDay } from "@/components/schedule-day";
import { ThemeToggle } from "@/components/theme-toggle";
import { ZipForm } from "@/components/zip-form";
import type { AppTab } from "@/lib/app-tabs";
import type { PlaceFactors } from "@/lib/place-factors";
import type { SunTimes } from "@/lib/sun";
import type { WeeklySummary } from "@/lib/weekly";
import { cn } from "@/lib/utils";

const NAV: { id: AppTab; label: string; icon: typeof MapPin }[] = [
  { id: "schedule", label: "Today", icon: CalendarCheck },
  { id: "place", label: "Place", icon: MapPin },
  { id: "account", label: "Account", icon: User },
];

const CACHE_KEY = "mitochondriapp-shell-v1";

export type AppShellProps = {
  initialTab: AppTab;
  dateLabel: string;
  allProtocols: Protocol[];
  availableIds: string[];
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
  isTravel?: boolean;
  travelUntil?: string | null;
  homePostalCode?: string | null;
  travelLabel?: string | null;
  accountPanel: React.ReactNode;
};

export function AppShell({
  initialTab,
  dateLabel,
  allProtocols,
  availableIds: initialAvailableIds,
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
  isTravel,
  travelUntil,
  homePostalCode,
  travelLabel,
  accountPanel,
}: AppShellProps) {
  const [tab, setTabState] = useState<AppTab>(initialTab);
  const [availableIds, setAvailableIds] = useState(initialAvailableIds);
  const [catalogOpen, setCatalogOpen] = useState(
    initialAvailableIds.length === 0,
  );

  // Warm paint cache for next visit (checklist ids + points)
  useEffect(() => {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          availableIds,
          dayPoints,
          streak,
          dateLabel,
          at: Date.now(),
        }),
      );
    } catch {
      /* ignore */
    }
  }, [availableIds, dayPoints, streak, dateLabel]);

  const setTab = useCallback((next: AppTab) => {
    setTabState(next);
    try {
      const url = next === "schedule" ? "/app" : `/app?t=${next}`;
      window.history.replaceState(null, "", url);
    } catch {
      /* ignore */
    }
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const availableProtocols = useMemo(() => {
    const set = new Set(availableIds);
    return allProtocols.filter((p) => set.has(p.id));
  }, [allProtocols, availableIds]);

  const missingPlace = !placeLabel && !region;

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <header
        className="sticky top-0 z-40 border-b border-border backdrop-blur-xl"
        style={{ background: "var(--header-bg)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => setTab("schedule")}
            className="flex min-w-0 items-center gap-2 text-left"
          >
            <Image
              src="/icons/app-icon.jpg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
            />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold tracking-wide text-foreground">
                Mitochondriapp
              </div>
              <div className="hidden text-[11px] text-muted sm:block">
                Light · Place · Protocol
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-sm transition",
                    tab === item.id
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted hover:bg-foreground/5 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <ThemeToggle size="sm" className="ml-1 shrink-0" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {tab === "schedule" && (
          <div className="space-y-5">
            {missingPlace && (
              <button
                type="button"
                onClick={() => setTab("place")}
                className="w-full rounded-2xl border border-accent/25 bg-accent/5 px-3.5 py-3 text-left text-sm"
              >
                <p className="font-medium">Add your ZIP for local sun times</p>
                <p className="mt-1 text-accent">Set location on Place →</p>
              </button>
            )}

            {isTravel && (
              <p className="rounded-2xl border border-accent/25 bg-accent/5 px-3.5 py-2 text-xs text-accent">
                Travel mode through {travelUntil} — sun times from temporary ZIP
              </p>
            )}

            <button
              type="button"
              onClick={() => setTab("place")}
              className="block w-full text-left"
            >
              <PlaceStrip
                placeLabel={placeLabel}
                region={region}
                sun={sun}
                timeZone={timeZone}
                phaseHint={phaseHint}
              />
            </button>

            <ScheduleDay
              protocols={availableProtocols}
              completionCounts={completionCounts}
              dayPoints={dayPoints}
              streak={streak}
              dateLabel={dateLabel}
              onExpandCatalog={() => setCatalogOpen(true)}
              phase={phase}
              localHour={localHour}
              seasonLine={seasonLine}
              weekly={weekly}
            />

            <ActivityCatalogExpand
              protocols={allProtocols}
              availableIds={availableIds}
              onAvailableIdsChange={setAvailableIds}
              expanded={catalogOpen}
              onExpandedChange={setCatalogOpen}
            />
          </div>
        )}

        {tab === "place" && (
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-accent">
                Your environment
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Place
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                {dateLabel} · light, scores, and place factors.{" "}
                <Link
                  href="/region/scoring"
                  className="text-accent hover:underline"
                >
                  How scoring works
                </Link>
              </p>
            </div>

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
                  Enter your US ZIP below for sunrise/sunset and the nearest
                  lifestyle score.
                </p>
              </div>
            )}

            <ZipForm
              currentZip={homePostalCode ?? postalCode}
              travelLabel={travelLabel}
              travelUntil={travelUntil}
            />

            <button
              type="button"
              onClick={() => setTab("schedule")}
              className="glass w-full rounded-2xl border border-border px-4 py-3 text-left text-sm font-medium hover:border-accent/40"
            >
              Today&apos;s checklist →
            </button>
            <p className="text-center text-xs text-muted">
              Prefer a curated metro score?{" "}
              <Link href="/region" className="text-accent hover:underline">
                Browse rated regions
              </Link>
            </p>
          </div>
        )}

        {tab === "account" && <div>{accountPanel}</div>}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--header-bg)] pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
        aria-label="Main"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <li key={id} className="flex-1">
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium transition",
                    active ? "text-accent" : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
