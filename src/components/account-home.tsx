"use client";

import { useEffect, useState } from "react";
import {
  DisplayNameForm,
  PasswordForm,
  UsernameForm,
} from "@/components/account-forms";
import type { AccountPanelUser } from "@/components/account-panel";
import { FriendsClient } from "@/components/friends-client";
import { HistoryList } from "@/components/history-list";
import { RemindersClient } from "@/components/reminders-client";
import { logoutAction } from "@/lib/actions/auth";
import {
  saveRecoveryEmailFormAction,
  saveTimezoneFormAction,
  toggleLeaderboardVisibilityFormAction,
} from "@/lib/actions/profile";
import type { AccountSection } from "@/lib/app-tabs";
import type { OpenAppSheet } from "@/lib/app-sheets";
import { ROUTES } from "@/lib/routes";
import { cn, formatPoints } from "@/lib/utils";

export type FriendRow = {
  id: string;
  status: string;
  otherName: string;
  otherUsername: string;
  isIncoming: boolean;
  isOutgoing: boolean;
};

export type ReminderRow = {
  id: string;
  label: string;
  localTime: string;
  enabled: boolean;
};

export type HistoryRow = { date: string; points: number; count: number };

type Section = NonNullable<AccountSection>;

const TABS: { id: Section; label: string }[] = [
  { id: "history", label: "History" },
  { id: "friends", label: "Friends" },
  { id: "reminders", label: "Reminders" },
  { id: "profile", label: "Profile" },
];

type Props = {
  user: AccountPanelUser;
  initialSection?: AccountSection;
  history: HistoryRow[];
  lifetimePoints: number;
  isAdmin?: boolean;
  friends: FriendRow[];
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
 * Account: header + tab row + one content panel (no expand cards / stray links).
 */
export function AccountHome({
  user,
  initialSection,
  history,
  lifetimePoints,
  isAdmin = false,
  friends,
  reminders,
  reminderSunPresets,
  onOpenSheet,
}: Props) {
  const [section, setSection] = useState<Section>(
    initialSection && initialSection !== null ? initialSection : "history",
  );

  useEffect(() => {
    if (initialSection) setSection(initialSection);
  }, [initialSection]);

  function select(next: Section) {
    setSection(next);
    try {
      window.history.replaceState(
        null,
        "",
        next === "history" ? ROUTES.account : `/app?t=${next}`,
      );
    } catch {
      /* ignore */
    }
  }

  const displayName = user.displayName || user.name || user.username || "";

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
            : "History, friends, reminders, and settings."}
        </p>
      </div>

      {/* Tab row under header */}
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
              onClick={() => select(t.id)}
              className={cn(
                "min-w-0 flex-1 shrink-0 rounded-xl px-2.5 py-2.5 text-center text-xs font-semibold transition sm:px-3 sm:text-sm",
                active
                  ? "bg-accent text-on-accent shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="min-h-[12rem]">
        {section === "history" && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Lifetime{" "}
              <span className="font-medium text-foreground">
                {formatPoints(lifetimePoints)} pts
              </span>{" "}
              · last 45 days
            </p>
            <HistoryList
              rows={history}
              onSelectDay={
                onOpenSheet
                  ? (date) => onOpenSheet({ id: "historyDay", date })
                  : undefined
              }
            />
            <p className="text-center text-sm">
              <a href={ROUTES.exportCsv} className="text-accent hover:underline">
                Export all logs (CSV)
              </a>
            </p>
          </div>
        )}

        {section === "friends" && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Private board among people you accept.
            </p>
            <FriendsClient rows={friends} />
          </div>
        )}

        {section === "reminders" && (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Browser notifications · sun-relative presets when ZIP is set.
            </p>
            <RemindersClient
              initial={reminders}
              sunPresets={reminderSunPresets}
            />
          </div>
        )}

        {section === "profile" && (
          <div className="space-y-5">
            <DisplayNameForm initialDisplayName={displayName} />
            <UsernameForm initialUsername={user.username} />
            <PasswordForm />

            <section className="glass rounded-3xl p-5">
              <h2 className="font-semibold">Recovery email</h2>
              <p className="mt-1 text-xs text-muted">
                Optional. Password reset only.
              </p>
              <form
                action={saveRecoveryEmailFormAction}
                className="mt-3 space-y-3"
              >
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email ?? ""}
                  placeholder="you@example.com"
                  className="field-input w-full rounded-2xl px-4 py-3 text-sm"
                />
                <button
                  type="submit"
                  className="btn-primary h-11 rounded-2xl px-5 text-sm font-semibold"
                >
                  Save email
                </button>
              </form>
            </section>

            <section className="glass rounded-3xl p-5">
              <h2 className="font-semibold">Timezone</h2>
              <p className="mt-1 text-xs text-muted">
                Calendar day for streaks (IANA name).
              </p>
              <form action={saveTimezoneFormAction} className="mt-3 space-y-3">
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
            </section>

            <section className="glass rounded-3xl p-5">
              <h2 className="font-semibold">Leaderboard visibility</h2>
              <form
                action={toggleLeaderboardVisibilityFormAction}
                className="mt-3"
              >
                <button
                  type="submit"
                  className="btn-secondary h-11 rounded-2xl px-5 text-sm font-semibold"
                >
                  {user.showOnLeaderboard
                    ? "Hide me from public boards"
                    : "Show me on public boards"}
                </button>
              </form>
            </section>

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

            <section className="glass rounded-3xl p-5">
              <h2 className="text-lg font-semibold tracking-tight">Session</h2>
              <form action={logoutAction} className="mt-4">
                <button
                  type="submit"
                  className="btn-secondary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold sm:w-auto sm:px-6"
                >
                  Log out
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
