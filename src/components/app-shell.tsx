"use client";

import { CalendarCheck, GraduationCap, User } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Protocol, Region } from "@/db/schema";
import {
  AccountHome,
  type FriendRow,
  type HistoryRow,
  type ReminderRow,
} from "@/components/account-home";
import type { AccountPanelUser } from "@/components/account-panel";
import { AdminPanel } from "@/components/admin-panel";
import { AppSheet } from "@/components/app-sheet";
import { GuideLightPanel } from "@/components/guide-light-panel";
import { GuideMagnetismPanel } from "@/components/guide-magnetism-panel";
import { GuideWaterPanel } from "@/components/guide-water-panel";
import { HistoryDayPanel } from "@/components/history-day-panel";
import { MitoversityHome } from "@/components/mitoversity-home";
import type { LeaderboardBoards } from "@/components/leaderboard-panel";
import { RegionBrowsePanel } from "@/components/region-browse-panel";
import { ScoringGuidePanel } from "@/components/scoring-guide-panel";
import { SunriseCheckIn } from "@/components/sunrise-check-in";
import { ThemeToggle } from "@/components/theme-toggle";
import { TodayHome } from "@/components/today-home";
import type { AccountSection, AppTab } from "@/lib/app-tabs";
import type { AppSheet as AppSheetState } from "@/lib/app-sheets";
import type { PlaceFactors } from "@/lib/place-factors";
import { ROUTES } from "@/lib/routes";
import type { SunTimes } from "@/lib/sun";
import type { WeeklySummary } from "@/lib/weekly";
import { cn } from "@/lib/utils";

const NAV: {
  id: AppTab;
  label: string;
  /** Shorter label for bottom nav */
  shortLabel?: string;
  icon: typeof CalendarCheck;
}[] = [
  { id: "schedule", label: "Today", icon: CalendarCheck },
  {
    id: "mitoversity",
    label: "Mitoversity",
    shortLabel: "Learn",
    icon: GraduationCap,
  },
  { id: "account", label: "Account", icon: User },
];

const CACHE_KEY = "mitochondriapp-shell-v1";

export type AppShellProps = {
  initialTab: AppTab;
  initialAccountSection?: AccountSection;
  /** Deep-link lesson id for Mitoversity (?lesson=) */
  initialMitoLesson?: string | null;
  dateLabel: string;
  todayIso: string;
  allProtocols: Protocol[];
  availableIds: string[];
  completionCounts: Record<string, number>;
  completionDurations?: Record<string, number>;
  dayPoints: number;
  streak: { current: number; best: number };
  placeLabel: string | null;
  postalCode: string | null;
  region: Region | null;
  regions: Region[];
  sun: SunTimes | null;
  timeZone: string;
  phaseHint: string | null;
  placeFactors: PlaceFactors | null;
  distanceKm: number | null;
  phase: "night" | "sunrise" | "day" | "sunset";
  localHour: number;
  seasonLine: string | null;
  weekly: WeeklySummary | null;
  sunriseMultiplier?: number;
  sunriseTierLabel?: string | null;
  isTravel?: boolean;
  travelUntil?: string | null;
  homePostalCode?: string | null;
  travelLabel?: string | null;
  accountUser: AccountPanelUser;
  currentUserId: string;
  isAdmin?: boolean;
  history: HistoryRow[];
  lifetimePoints: number;
  leaderboards: LeaderboardBoards;
  friends: FriendRow[];
  reminders: ReminderRow[];
  reminderSunPresets?: {
    sunrise?: string | null;
    sunset?: string | null;
    beforeSunset?: string | null;
    afterSunrise?: string | null;
  };
};

/**
 * Today · Mitoversity · Account.
 * Scoring, regions, day detail, admin, guides open as in-page cards.
 */
export function AppShell({
  initialTab,
  initialAccountSection = null,
  initialMitoLesson = null,
  dateLabel,
  todayIso,
  allProtocols,
  availableIds: initialAvailableIds,
  completionCounts,
  completionDurations,
  dayPoints,
  streak,
  placeLabel,
  postalCode,
  region,
  regions,
  sun,
  timeZone,
  phaseHint,
  placeFactors,
  distanceKm,
  phase,
  localHour,
  seasonLine,
  weekly,
  sunriseMultiplier: initialSunriseMult = 1,
  sunriseTierLabel: initialSunriseTierLabel = null,
  isTravel,
  travelUntil,
  homePostalCode,
  travelLabel,
  accountUser,
  currentUserId,
  isAdmin = false,
  history,
  lifetimePoints,
  leaderboards,
  friends,
  reminders,
  reminderSunPresets,
}: AppShellProps) {
  const [tab, setTabState] = useState<AppTab>(initialTab);
  const [sheet, setSheet] = useState<AppSheetState | null>(null);
  const [availableIds, setAvailableIds] = useState(initialAvailableIds);
  const [sunriseMultiplier, setSunriseMultiplier] =
    useState(initialSunriseMult);
  const [sunriseTierLabel, setSunriseTierLabel] = useState(
    initialSunriseTierLabel,
  );

  useEffect(() => {
    setSunriseMultiplier(initialSunriseMult);
  }, [initialSunriseMult]);

  useEffect(() => {
    setSunriseTierLabel(initialSunriseTierLabel);
  }, [initialSunriseTierLabel]);

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
    setSheet(null);
    setTabState(next);
    try {
      const url =
        next === "schedule"
          ? ROUTES.home
          : next === "mitoversity"
            ? ROUTES.mitoversity
            : ROUTES.account;
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

  const openSheet = useCallback((next: AppSheetState) => {
    setSheet(next);
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const closeSheet = useCallback(() => setSheet(null), []);

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SunriseCheckIn
        todayIso={todayIso}
        sunriseMultiplier={sunriseMultiplier}
        allProtocols={allProtocols}
        sun={sun}
        timeZone={timeZone}
        onLogged={(mult) => setSunriseMultiplier(mult)}
      />

      <header
        className="sticky top-0 z-40 border-b border-border backdrop-blur-xl"
        style={{ background: "var(--header-bg)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => setTab("schedule")}
            className="flex shrink-0 items-center text-left"
            aria-label="Today"
          >
            <Image
              src="/icons/app-icon.jpg"
              alt="Mitochondriapp"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
            />
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
                    tab === item.id && !sheet
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

      <main
        className={cn(
          "mx-auto max-w-2xl px-4 sm:px-6",
          tab === "schedule" ? "py-3" : "py-6 sm:py-8",
        )}
      >
        {sheet?.id === "scoring" && (
          <AppSheet
            title="How scores are calculated"
            subtitle="Transparent 1–5 model for curated regions and ZIP-mapped scores. Educational / lifestyle only — not medical advice."
            onClose={closeSheet}
          >
            <ScoringGuidePanel />
          </AppSheet>
        )}

        {sheet?.id === "regions" && (
          <AppSheet
            title="Browse rated regions"
            subtitle="Optional override of the nearest-match score from your ZIP."
            onClose={closeSheet}
          >
            <RegionBrowsePanel
              regions={regions}
              currentId={region?.id ?? null}
              onOpenSheet={openSheet}
            />
          </AppSheet>
        )}

        {sheet?.id === "historyDay" && (
          <AppSheet title="Day detail" onClose={closeSheet}>
            <HistoryDayPanel date={sheet.date} />
          </AppSheet>
        )}

        {sheet?.id === "admin" && (
          <AppSheet
            title="Admin · protocols"
            subtitle="Catalog management"
            onClose={closeSheet}
          >
            <AdminPanel allowed={isAdmin} />
          </AppSheet>
        )}

        {sheet?.id === "guideLight" && (
          <AppSheet
            title="Light"
            subtitle="Solar call · circadian timing · mitochondrial light stack"
            onClose={closeSheet}
          >
            <GuideLightPanel />
          </AppSheet>
        )}

        {sheet?.id === "guideWater" && (
          <AppSheet
            title="Water"
            subtitle="Deuterium-aware hydration & fuel · lifestyle frame for ATP synthase"
            onClose={closeSheet}
          >
            <GuideWaterPanel />
          </AppSheet>
        )}

        {sheet?.id === "guideMagnetism" && (
          <AppSheet
            title="Magnetism"
            subtitle="Earth / geology context · grounding · nnEMF hygiene"
            onClose={closeSheet}
          >
            <GuideMagnetismPanel />
          </AppSheet>
        )}

        {!sheet && tab === "schedule" && (
          <TodayHome
            dateLabel={dateLabel}
            allProtocols={allProtocols}
            availableIds={availableIds}
            onAvailableIdsChange={setAvailableIds}
            completionCounts={completionCounts}
            completionDurations={completionDurations}
            dayPoints={dayPoints}
            streak={streak}
            placeLabel={placeLabel}
            postalCode={postalCode}
            region={region}
            sun={sun}
            timeZone={timeZone}
            phaseHint={phaseHint}
            placeFactors={placeFactors}
            distanceKm={distanceKm}
            phase={phase}
            localHour={localHour}
            seasonLine={seasonLine}
            weekly={weekly}
            sunriseMultiplier={sunriseMultiplier}
            sunriseTierLabel={sunriseTierLabel}
            isTravel={isTravel}
            travelUntil={travelUntil}
            homePostalCode={homePostalCode}
            travelLabel={travelLabel}
            onOpenSheet={openSheet}
          />
        )}

        {!sheet && tab === "mitoversity" && (
          <MitoversityHome initialEntryId={initialMitoLesson} />
        )}

        {!sheet && tab === "account" && (
          <AccountHome
            user={accountUser}
            initialSection={initialAccountSection}
            history={history}
            lifetimePoints={lifetimePoints}
            leaderboards={leaderboards}
            currentUserId={currentUserId}
            friends={friends}
            reminders={reminders}
            reminderSunPresets={reminderSunPresets}
            onOpenSheet={openSheet}
          />
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--header-bg)] pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
        aria-label="Main"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {NAV.map(({ id, label, shortLabel, icon: Icon }) => {
            const active = tab === id && !sheet;
            return (
              <li key={id} className="flex-1">
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium transition",
                    active ? "text-accent" : "text-muted hover:text-foreground",
                  )}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                  {shortLabel ?? label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
