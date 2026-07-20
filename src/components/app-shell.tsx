"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Protocol, Region } from "@/db/schema";
import type { HistoryRow, ReminderRow } from "@/components/account-home";
import type { AccountPanelUser } from "@/components/account-panel";
import { AchievementCelebration } from "@/components/achievement-celebration";
import type { StreakBadgeView } from "@/components/level-progress";
import type { PendingCelebrations } from "@/lib/achievements";
import type { LevelProgress } from "@/lib/levels";
import { AppContentProvider } from "@/components/app-content-context";
import { AppTutorial } from "@/components/app-tutorial";
import type { AppContentBundle } from "@/lib/content-overrides";
import { AppSheet } from "@/components/app-sheet";
import type { LeaderboardBoards } from "@/components/leaderboard-panel";
import { SunriseCheckIn } from "@/components/sunrise-check-in";
import { ThemeToggle } from "@/components/theme-toggle";
import { TodayHome } from "@/components/today-home";
import type { AccountSection, AppTab, TodaySection } from "@/lib/app-tabs";
import type { AppSheet as AppSheetState } from "@/lib/app-sheets";
import type { TourStep } from "@/lib/app-tour";
import type { PlaceFactors } from "@/lib/place-factors";
import { ROUTES } from "@/lib/routes";
import type { SunTimes } from "@/lib/sun";
import { useFocusSync } from "@/lib/use-focus-sync";
import type { WeeklySummary } from "@/lib/weekly";
import { cn } from "@/lib/utils";

const ConvertGuestPanel = dynamic(
  () =>
    import("@/components/convert-guest-panel").then((m) => ({
      default: m.ConvertGuestPanel,
    })),
  { ssr: false },
);

const AccountHome = dynamic(
  () =>
    import("@/components/account-home").then((m) => ({
      default: m.AccountHome,
    })),
  { ssr: false },
);
const AdminPanel = dynamic(
  () =>
    import("@/components/admin-panel").then((m) => ({
      default: m.AdminPanel,
    })),
  { ssr: false },
);
const MitoversityHome = dynamic(
  () =>
    import("@/components/mitoversity-home").then((m) => ({
      default: m.MitoversityHome,
    })),
  { ssr: false },
);
const GuideLightPanel = dynamic(
  () =>
    import("@/components/guide-light-panel").then((m) => ({
      default: m.GuideLightPanel,
    })),
  { ssr: false },
);
const GuideWaterPanel = dynamic(
  () =>
    import("@/components/guide-water-panel").then((m) => ({
      default: m.GuideWaterPanel,
    })),
  { ssr: false },
);
const GuideMagnetismPanel = dynamic(
  () =>
    import("@/components/guide-magnetism-panel").then((m) => ({
      default: m.GuideMagnetismPanel,
    })),
  { ssr: false },
);
const HistoryDayPanel = dynamic(
  () =>
    import("@/components/history-day-panel").then((m) => ({
      default: m.HistoryDayPanel,
    })),
  { ssr: false },
);
const RegionBrowsePanel = dynamic(
  () =>
    import("@/components/region-browse-panel").then((m) => ({
      default: m.RegionBrowsePanel,
    })),
  { ssr: false },
);
const ScoringGuidePanel = dynamic(
  () =>
    import("@/components/scoring-guide-panel").then((m) => ({
      default: m.ScoringGuidePanel,
    })),
  { ssr: false },
);

const NAV: {
  id: AppTab;
  label: string;
  /** Shorter label for compact layouts */
  shortLabel?: string;
}[] = [
  { id: "schedule", label: "Today" },
  {
    id: "mitoversity",
    label: "Mitoversity",
    shortLabel: "Learn",
  },
  { id: "account", label: "Account" },
];

const CACHE_KEY = "mitochondriapp-shell-v1";

export type AppShellProps = {
  initialTab: AppTab;
  initialAccountSection?: AccountSection;
  initialTodaySection?: TodaySection | null;
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
  travelPostalCode?: string | null;
  travelLabel?: string | null;
  magneticoGauss?: number;
  sleepRoomTempF?: number;
  accountUser: AccountPanelUser;
  currentUserId: string;
  isAdmin?: boolean;
  /** Open morning-light check-in on first paint (e.g. after onboarding ?sunrise=1) */
  forceSunriseCheckIn?: boolean;
  /** Server truth — skip check-in when keystone already logged today */
  morningLightLogged?: boolean;
  /** Open admin sheet on first paint (e.g. ?t=admin) */
  initialOpenAdmin?: boolean;
  history: HistoryRow[];
  lifetimePoints: number;
  levelProgress: LevelProgress;
  streakBadges: StreakBadgeView[];
  /** Unseen level/badge wins — shown before sunrise check-in */
  pendingCelebrations?: PendingCelebrations | null;
  leaderboards?: LeaderboardBoards | null;
  reminders: ReminderRow[];
  reminderSunPresets?: {
    sunrise?: string | null;
    sunset?: string | null;
    beforeSunset?: string | null;
    afterSunrise?: string | null;
  };
  appContent: AppContentBundle;
  isGuest?: boolean;
  tutorialComplete?: boolean;
};

/**
 * Today · Mitoversity · Account.
 * Scoring, regions, day detail, admin, guides open as in-page cards.
 */
export function AppShell({
  initialTab,
  initialAccountSection = null,
  initialTodaySection = null,
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
  travelPostalCode,
  travelLabel,
  magneticoGauss = 10,
  sleepRoomTempF = 65,
  accountUser,
  currentUserId,
  isAdmin = false,
  forceSunriseCheckIn = false,
  morningLightLogged = false,
  initialOpenAdmin = false,
  history,
  lifetimePoints,
  levelProgress,
  streakBadges,
  pendingCelebrations = null,
  leaderboards,
  reminders,
  reminderSunPresets,
  appContent,
  isGuest = false,
  tutorialComplete = true,
}: AppShellProps) {
  const guestSafeInitialTab: AppTab =
    isGuest && initialTab === "account" ? "schedule" : initialTab;
  const guestSafeTodaySection: TodaySection | null =
    isGuest && initialTodaySection === "leaderboard"
      ? "checklist"
      : initialTodaySection;

  const [tab, setTabState] = useState<AppTab>(guestSafeInitialTab);
  const [sheet, setSheet] = useState<AppSheetState | null>(
    initialOpenAdmin && isAdmin && !isGuest ? { id: "admin" } : null,
  );
  const [showTutorial, setShowTutorial] = useState(!tutorialComplete);
  const [celebration, setCelebration] = useState<PendingCelebrations | null>(
    pendingCelebrations,
  );
  const [tourTodaySection, setTourTodaySection] =
    useState<TodaySection | null>(null);
  const [adminContentFocus, setAdminContentFocus] = useState<string | null>(
    null,
  );
  const [accountSection, setAccountSection] =
    useState<AccountSection>(initialAccountSection);
  const [availableIds, setAvailableIds] = useState(initialAvailableIds);
  const [sunriseMultiplier, setSunriseMultiplier] =
    useState(initialSunriseMult);
  const [morningLightDone, setMorningLightDone] = useState(morningLightLogged);
  const [sunriseTierLabel, setSunriseTierLabel] = useState(
    initialSunriseTierLabel,
  );

  useFocusSync();

  useEffect(() => {
    setAvailableIds(initialAvailableIds);
  }, [initialAvailableIds]);

  useEffect(() => {
    setMorningLightDone(morningLightLogged);
  }, [morningLightLogged]);

  useEffect(() => {
    setCelebration(pendingCelebrations);
  }, [pendingCelebrations]);

  const showCelebration = celebration != null;
  const holdSunrise = showTutorial || showCelebration;

  useEffect(() => {
    setSunriseMultiplier(initialSunriseMult);
  }, [initialSunriseMult]);

  useEffect(() => {
    setSunriseTierLabel(initialSunriseTierLabel);
  }, [initialSunriseTierLabel]);

  useEffect(() => {
    setAccountSection(initialAccountSection);
  }, [initialAccountSection]);

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

  const navItems = useMemo(
    () => (isGuest ? NAV.filter((item) => item.id !== "account") : NAV),
    [isGuest],
  );

  const setTab = useCallback(
    (next: AppTab) => {
      if (isGuest && next === "account") {
        setSheet({ id: "convertGuest" });
        return;
      }
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
    },
    [isGuest],
  );

  const openSheet = useCallback((next: AppSheetState) => {
    setSheet(next);
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const openAdminContent = useCallback((focus: string) => {
    setAdminContentFocus(focus);
    setSheet({ id: "admin" });
    try {
      window.history.replaceState(null, "", ROUTES.admin);
    } catch {
      /* ignore */
    }
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(null);
    setAdminContentFocus(null);
  }, []);

  const prepareTourStep = useCallback(
    (step: TourStep) => {
      setSheet(null);
      if (step.appTab) {
        setTabState(step.appTab);
      }
      if (step.todaySection) {
        setTourTodaySection(step.todaySection);
      } else {
        setTourTodaySection(null);
      }
    },
    [],
  );

  return (
    <AppContentProvider content={appContent}>
    <div className="min-h-screen pb-[calc(3rem+var(--site-disclaimer-offset))]">
      {showTutorial && (
        <AppTutorial
          isGuest={isGuest}
          onDone={() => {
            setShowTutorial(false);
            setTab("schedule");
            setTourTodaySection("checklist");
          }}
          onPrepareStep={prepareTourStep}
        />
      )}

      {celebration ? (
        <AchievementCelebration
          pending={celebration}
          paused={showTutorial}
          onDone={() => setCelebration(null)}
        />
      ) : null}

      <SunriseCheckIn
        userId={currentUserId}
        todayIso={todayIso}
        sunriseMultiplier={sunriseMultiplier}
        morningLightLogged={morningLightDone}
        allProtocols={allProtocols}
        sun={sun}
        timeZone={timeZone}
        paused={holdSunrise}
        forceOpen={forceSunriseCheckIn && !holdSunrise}
        onLogged={(mult) => {
          setMorningLightDone(true);
          setSunriseMultiplier(mult);
        }}
      />

      <header
        className="sticky top-0 z-40 border-b border-border backdrop-blur-xl"
        style={{ background: "var(--header-bg)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-center px-2 sm:h-16 sm:px-6">
          <div className="flex items-center justify-center gap-0.5 sm:gap-2">
            <nav
              className="flex items-center gap-0.5 sm:gap-1"
              aria-label="Primary left"
            >
              {navItems
                .filter((item) => item.id !== "account")
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-tour={
                      item.id === "mitoversity"
                        ? "nav-mitoversity"
                        : item.id === "schedule"
                          ? "nav-today"
                          : undefined
                    }
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "shrink-0 rounded-full px-2 py-1.5 text-xs transition sm:px-3 sm:text-sm",
                      tab === item.id && !sheet
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
            </nav>

            <button
              type="button"
              onClick={() => setTab("schedule")}
              className="mx-1 flex shrink-0 items-center sm:mx-2"
              aria-label="Today home"
            >
              <Image
                src="/icons/app-icon.jpg"
                alt="Mitochondriapp"
                width={36}
                height={36}
                className="h-9 w-9 rounded-[0.65rem] object-cover ring-1 ring-border sm:h-10 sm:w-10"
              />
            </button>

            <nav
              className="flex items-center gap-0.5 sm:gap-1"
              aria-label="Primary right"
            >
              {navItems
                .filter((item) => item.id === "account")
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "shrink-0 rounded-full px-2 py-1.5 text-xs transition sm:px-3 sm:text-sm",
                      tab === item.id && !sheet
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted hover:bg-foreground/5 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              {isGuest && (
                <button
                  type="button"
                  data-tour="nav-save-progress"
                  onClick={() => openSheet({ id: "convertGuest" })}
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1.5 text-xs transition sm:px-3 sm:text-sm",
                    sheet?.id === "convertGuest"
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted hover:bg-foreground/5 hover:text-foreground",
                  )}
                >
                  Save progress
                </button>
              )}
              {isAdmin && !isGuest && (
                <button
                  type="button"
                  onClick={() => openSheet({ id: "admin" })}
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1.5 text-xs transition sm:px-3 sm:text-sm",
                    sheet?.id === "admin"
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted hover:bg-foreground/5 hover:text-foreground",
                  )}
                >
                  Admin
                </button>
              )}
              <ThemeToggle size="sm" className="shrink-0" />
            </nav>
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
            title="Admin"
            subtitle="Users, profiles, and editable content"
            onClose={closeSheet}
          >
            <AdminPanel
              allowed={isAdmin}
              currentUserId={currentUserId}
              contentFocus={adminContentFocus}
            />
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

        {sheet?.id === "convertGuest" && (
          <AppSheet
            title="Save your progress"
            subtitle="Create a username to keep history and unlock the leaderboard"
            onClose={closeSheet}
          >
            <ConvertGuestPanel />
          </AppSheet>
        )}

        {!sheet && tab === "schedule" && (
          <TodayHome
            dateLabel={dateLabel}
            todayIso={todayIso}
            allProtocols={allProtocols}
            availableIds={availableIds}
            onAvailableIdsChange={setAvailableIds}
            completionCounts={completionCounts}
            completionDurations={completionDurations}
            dayPoints={dayPoints}
            streak={streak}
            lifetimePoints={lifetimePoints}
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
            travelPostalCode={travelPostalCode}
            travelLabel={travelLabel}
            magneticoGauss={magneticoGauss}
            sleepRoomTempF={sleepRoomTempF}
            initialSection={guestSafeTodaySection}
            leaderboards={leaderboards}
            currentUserId={currentUserId}
            onOpenSheet={openSheet}
            isAdmin={isAdmin && !isGuest}
            onAdminEditContent={openAdminContent}
            isGuest={isGuest}
            tourSection={tourTodaySection}
          />
        )}

        {!sheet && tab === "mitoversity" && (
          <MitoversityHome
            initialEntryId={initialMitoLesson}
            isAdmin={isAdmin && !isGuest}
            onAdminEditContent={openAdminContent}
          />
        )}

        {!sheet && tab === "account" && !isGuest && (
          <AccountHome
            user={accountUser}
            initialSection={accountSection}
            history={history}
            lifetimePoints={lifetimePoints}
            levelProgress={levelProgress}
            streakBadges={streakBadges}
            isAdmin={isAdmin}
            reminders={reminders}
            reminderSunPresets={reminderSunPresets}
            onOpenSheet={openSheet}
          />
        )}
      </main>
    </div>
    </AppContentProvider>
  );
}
