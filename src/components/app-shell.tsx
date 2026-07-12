"use client";

import { CalendarCheck, User } from "lucide-react";
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
import type { LeaderboardBoards } from "@/components/leaderboard-panel";
import { SunriseCheckIn } from "@/components/sunrise-check-in";
import { ThemeToggle } from "@/components/theme-toggle";
import { TodayHome } from "@/components/today-home";
import type { AccountSection, AppTab } from "@/lib/app-tabs";
import type { PlaceFactors } from "@/lib/place-factors";
import type { SunTimes } from "@/lib/sun";
import type { WeeklySummary } from "@/lib/weekly";
import { cn } from "@/lib/utils";

const NAV: { id: AppTab; label: string; icon: typeof CalendarCheck }[] = [
  { id: "schedule", label: "Today", icon: CalendarCheck },
  { id: "account", label: "Account", icon: User },
];

const CACHE_KEY = "mitochondriapp-shell-v1";

export type AppShellProps = {
  initialTab: AppTab;
  initialAccountSection?: AccountSection;
  dateLabel: string;
  todayIso: string;
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
  sunriseBuffActive?: boolean;
  isTravel?: boolean;
  travelUntil?: string | null;
  homePostalCode?: string | null;
  travelLabel?: string | null;
  accountUser: AccountPanelUser;
  currentUserId: string;
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
 * Today & Account each use header + in-page tab rows (single-page cards).
 */
export function AppShell({
  initialTab,
  initialAccountSection = null,
  dateLabel,
  todayIso,
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
  sunriseBuffActive: initialSunriseBuff = false,
  isTravel,
  travelUntil,
  homePostalCode,
  travelLabel,
  accountUser,
  currentUserId,
  history,
  lifetimePoints,
  leaderboards,
  friends,
  reminders,
  reminderSunPresets,
}: AppShellProps) {
  const [tab, setTabState] = useState<AppTab>(initialTab);
  const [availableIds, setAvailableIds] = useState(initialAvailableIds);
  const [sunriseBuffActive, setSunriseBuffActive] =
    useState(initialSunriseBuff);

  useEffect(() => {
    setSunriseBuffActive(initialSunriseBuff);
  }, [initialSunriseBuff]);

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
      const url = next === "schedule" ? "/app" : "/app?t=account";
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

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SunriseCheckIn
        todayIso={todayIso}
        sunriseBuffActive={sunriseBuffActive}
        allProtocols={allProtocols}
        sun={sun}
        timeZone={timeZone}
        onLogged={() => setSunriseBuffActive(true)}
      />

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
          <TodayHome
            dateLabel={dateLabel}
            allProtocols={allProtocols}
            availableIds={availableIds}
            onAvailableIdsChange={setAvailableIds}
            completionCounts={completionCounts}
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
            sunriseBuffActive={sunriseBuffActive}
            isTravel={isTravel}
            travelUntil={travelUntil}
            homePostalCode={homePostalCode}
            travelLabel={travelLabel}
          />
        )}

        {tab === "account" && (
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
          />
        )}
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
