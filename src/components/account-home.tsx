"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DisplayNameForm,
  PasswordForm,
  RecoveryEmailForm,
  UsernameSection,
} from "@/components/account-forms";
import { AccountExpandCard } from "@/components/account-expand-card";
import type { AccountPanelUser } from "@/components/account-panel";
import { HistoryList } from "@/components/history-list";
import {
  LevelProgressBar,
  StreakBadgeStrip,
  type StreakBadgeView,
} from "@/components/level-progress";
import { logoutAction } from "@/lib/actions/auth";
import {
  saveTimezoneFormAction,
  toggleLeaderboardVisibilityFormAction,
} from "@/lib/actions/profile";
import type { AccountSection } from "@/lib/app-tabs";
import type { OpenAppSheet } from "@/lib/app-sheets";
import type { LevelProgress } from "@/lib/levels";
import { ROUTES } from "@/lib/routes";
import { cn, formatPoints } from "@/lib/utils";

export type ReminderRow = {
  id: string;
  label: string;
  localTime: string;
  enabled: boolean;
};

export type HistoryRow = { date: string; points: number; count: number };

type Section = NonNullable<AccountSection>;

const TABS: {
  id: Section;
  label: string;
  disabled?: boolean;
}[] = [
  { id: "profile", label: "Profile" },
  { id: "history", label: "History" },
  { id: "reminders", label: "Reminders", disabled: true },
];

function resolveInitialSection(initialSection?: AccountSection): Section {
  if (initialSection === "history") return "history";
  if (initialSection === "reminders") return "profile";
  return "profile";
}

type Props = {
  user: AccountPanelUser;
  initialSection?: AccountSection;
  history: HistoryRow[];
  lifetimePoints: number;
  levelProgress: LevelProgress;
  streakBadges: StreakBadgeView[];
  isAdmin?: boolean;
  reminders: ReminderRow[];
  reminderSunPresets?: {
    sunrise?: string | null;
    sunset?: string | null;
    beforeSunset?: string | null;
    afterSunrise?: string | null;
  };
  onOpenSheet?: OpenAppSheet;
};

/**
 * Account: tab row + collapsible sections (all collapsed by default).
 */
export function AccountHome({
  user,
  initialSection,
  history,
  lifetimePoints,
  levelProgress,
  streakBadges,
  isAdmin = false,
  onOpenSheet,
}: Props) {
  const [section, setSection] = useState<Section>(() =>
    resolveInitialSection(initialSection),
  );
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialSection) {
      setSection(resolveInitialSection(initialSection));
    }
  }, [initialSection]);

  const cardExpand = useCallback(
    (id: string) => ({
      expanded: openCards[id] ?? false,
      onToggle: () =>
        setOpenCards((prev) => ({ ...prev, [id]: !(prev[id] ?? false) })),
    }),
    [openCards],
  );

  function select(next: Section) {
    if (next === "reminders") return;
    setSection(next);
    try {
      window.history.replaceState(
        null,
        "",
        next === "profile" || next === "history"
          ? next === "profile"
            ? ROUTES.account
            : `${ROUTES.account}?t=history`
          : ROUTES.account,
      );
    } catch {
      /* ignore */
    }
  }

  const displayName = user.displayName ?? user.name ?? "";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">
          Profile
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Account
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {user.memberSinceLabel
            ? `Member since ${user.memberSinceLabel}.`
            : "Settings and activity history."}
        </p>
      </div>

      <div
        className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-foreground/[0.03] p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Account sections"
      >
        {TABS.map((t) => {
          const active = section === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-disabled={t.disabled || undefined}
              disabled={t.disabled}
              onClick={() => select(t.id)}
              className={cn(
                "min-w-0 flex-1 shrink-0 rounded-xl px-2.5 py-2.5 text-center text-xs font-semibold transition sm:px-3 sm:text-sm",
                t.disabled
                  ? "cursor-not-allowed opacity-40"
                  : active
                    ? "bg-accent text-on-accent shadow-sm"
                    : "text-muted hover:text-foreground",
              )}
            >
              {t.label}
              {t.disabled ? (
                <span className="mt-0.5 block text-[10px] font-normal opacity-80">
                  Soon
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="min-h-[12rem] space-y-3">
        {section === "history" && (
          <>
            <AccountExpandCard
              id="activity-history"
              title="Activity history"
              subtitle={`${formatPoints(lifetimePoints)} pts lifetime · last 45 days`}
              expanded={cardExpand("activity-history").expanded}
              onToggle={cardExpand("activity-history").onToggle}
            >
              <HistoryList
                rows={history}
                timeZone={user.timezone ?? "UTC"}
                onSelectDay={
                  onOpenSheet
                    ? (date) => onOpenSheet({ id: "historyDay", date })
                    : undefined
                }
              />
            </AccountExpandCard>

            <AccountExpandCard
              id="export-data"
              title="Export data"
              subtitle="Download all logs as CSV"
              expanded={cardExpand("export-data").expanded}
              onToggle={cardExpand("export-data").onToggle}
            >
              <a
                href={ROUTES.exportCsv}
                className="btn-secondary inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold"
              >
                Export all logs (CSV)
              </a>
            </AccountExpandCard>
          </>
        )}

        {section === "profile" && (
          <>
            <div className="rounded-2xl border border-border bg-foreground/[0.03] px-4 py-4">
              <LevelProgressBar progress={levelProgress} />
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Streak badges
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Earned once for longest streak milestones — kept forever.
                </p>
                <StreakBadgeStrip badges={streakBadges} className="mt-3" />
              </div>
            </div>

            <DisplayNameForm
              initialDisplayName={displayName}
              changeBlockedUntilLabel={user.displayNameChangeBlockedUntilLabel}
              expand={cardExpand("display-name")}
            />
            <UsernameSection
              username={user.username}
              expand={cardExpand("username")}
            />
            <PasswordForm expand={cardExpand("password")} />
            <RecoveryEmailForm
              initialEmail={user.email ?? null}
              expand={cardExpand("recovery-email")}
            />

            <AccountExpandCard
              id="timezone"
              title="Timezone"
              subtitle="Calendar day for streaks (IANA name)"
              expanded={cardExpand("timezone").expanded}
              onToggle={cardExpand("timezone").onToggle}
            >
              <form action={saveTimezoneFormAction} className="space-y-3">
                <input
                  name="timezone"
                  defaultValue={user.timezone ?? "UTC"}
                  placeholder="America/New_York"
                  className="field-input w-full rounded-2xl px-4 py-3 text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary h-11 rounded-2xl px-5 text-sm font-semibold"
                >
                  Save timezone
                </button>
              </form>
            </AccountExpandCard>

            <AccountExpandCard
              id="leaderboard-visibility"
              title="Leaderboard visibility"
              subtitle={
                user.showOnLeaderboard
                  ? "You appear on public boards"
                  : "Hidden from public boards"
              }
              expanded={cardExpand("leaderboard-visibility").expanded}
              onToggle={cardExpand("leaderboard-visibility").onToggle}
            >
              <form action={toggleLeaderboardVisibilityFormAction}>
                <button
                  type="submit"
                  className="btn-secondary h-11 rounded-2xl px-5 text-sm font-semibold"
                >
                  {user.showOnLeaderboard
                    ? "Hide me from public boards"
                    : "Show me on public boards"}
                </button>
              </form>
            </AccountExpandCard>

            <AccountExpandCard
              id="tools"
              title="Tools"
              subtitle="Export and admin shortcuts"
              expanded={cardExpand("tools").expanded}
              onToggle={cardExpand("tools").onToggle}
            >
              <div className="flex flex-wrap gap-2 text-sm">
                {isAdmin && onOpenSheet ? (
                  <button
                    type="button"
                    onClick={() => onOpenSheet({ id: "admin" })}
                    className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
                  >
                    Admin
                  </button>
                ) : null}
                <a
                  href={ROUTES.exportCsv}
                  className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
                >
                  Export CSV
                </a>
              </div>
            </AccountExpandCard>

            <AccountExpandCard
              id="session"
              title="Session"
              subtitle="Sign out on this device"
              expanded={cardExpand("session").expanded}
              onToggle={cardExpand("session").onToggle}
            >
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="btn-secondary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold sm:w-auto sm:px-6"
                >
                  Log out
                </button>
              </form>
            </AccountExpandCard>
          </>
        )}
      </div>
    </div>
  );
}
