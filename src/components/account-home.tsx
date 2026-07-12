"use client";

import { useEffect, useState } from "react";
import {
  DisplayNameForm,
  PasswordForm,
  UsernameForm,
} from "@/components/account-forms";
import { AccountExpandCard } from "@/components/account-expand-card";
import type { AccountPanelUser } from "@/components/account-panel";
import { FriendsClient } from "@/components/friends-client";
import { HistoryList } from "@/components/history-list";
import {
  LeaderboardPanel,
  type LeaderboardBoards,
} from "@/components/leaderboard-panel";
import { RemindersClient } from "@/components/reminders-client";
import { logoutAction } from "@/lib/actions/auth";
import {
  saveRecoveryEmailFormAction,
  saveTimezoneFormAction,
  toggleLeaderboardVisibilityFormAction,
} from "@/lib/actions/profile";
import type { AccountSection } from "@/lib/app-tabs";
import { formatPoints } from "@/lib/utils";

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

type Props = {
  user: AccountPanelUser;
  initialSection?: AccountSection;
  history: HistoryRow[];
  lifetimePoints: number;
  leaderboards: LeaderboardBoards;
  currentUserId: string;
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
 * Single Account surface: expandable cards (no sub-page navigation).
 */
export function AccountHome({
  user,
  initialSection,
  history,
  lifetimePoints,
  leaderboards,
  currentUserId,
  friends,
  reminders,
  reminderSunPresets,
}: Props) {
  const [open, setOpen] = useState<AccountSection>(initialSection ?? null);

  useEffect(() => {
    if (initialSection) setOpen(initialSection);
  }, [initialSection]);

  function toggle(section: NonNullable<AccountSection>) {
    setOpen((cur) => {
      const next = cur === section ? null : section;
      try {
        const url =
          next == null || next === "profile"
            ? "/app?t=account"
            : `/app?t=${next}`;
        window.history.replaceState(null, "", url);
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const displayName = user.displayName || user.name || user.username || "";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">
          Profile
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Account
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Expand a card for history, ranks, friends, or settings.
          {user.memberSinceLabel
            ? ` Member since ${user.memberSinceLabel}.`
            : null}
        </p>
      </div>

      <AccountExpandCard
        id="history"
        title="History"
        subtitle={`Lifetime ${formatPoints(lifetimePoints)} pts · last 45 days`}
        expanded={open === "history"}
        onToggle={() => toggle("history")}
      >
        <HistoryList rows={history} linkDays={false} />
        <p className="text-center text-sm">
          <a href="/api/export/csv" className="text-accent hover:underline">
            Export all logs (CSV)
          </a>
        </p>
      </AccountExpandCard>

      <AccountExpandCard
        id="leaderboard"
        title="Leaderboard"
        subtitle="Week light · week · month · all time · friends"
        expanded={open === "leaderboard"}
        onToggle={() => toggle("leaderboard")}
      >
        <LeaderboardPanel
          boards={leaderboards}
          currentUserId={currentUserId}
          onOpenFriends={() => {
            setOpen("friends");
            try {
              window.history.replaceState(null, "", "/app?t=friends");
            } catch {
              /* ignore */
            }
          }}
        />
      </AccountExpandCard>

      <AccountExpandCard
        id="friends"
        title="Friends"
        subtitle="Requests and private board"
        expanded={open === "friends"}
        onToggle={() => toggle("friends")}
      >
        <FriendsClient rows={friends} />
      </AccountExpandCard>

      <AccountExpandCard
        id="reminders"
        title="Reminders"
        subtitle="Browser notifications · sun-relative presets"
        expanded={open === "reminders"}
        onToggle={() => toggle("reminders")}
      >
        <RemindersClient
          initial={reminders}
          sunPresets={reminderSunPresets}
        />
      </AccountExpandCard>

      <AccountExpandCard
        id="profile"
        title="Profile & security"
        subtitle="Username, password, email, timezone"
        expanded={open === "profile"}
        onToggle={() => toggle("profile")}
      >
        <div className="space-y-5">
          <DisplayNameForm initialDisplayName={displayName} />
          <UsernameForm initialUsername={user.username} />
          <PasswordForm />

          <section className="rounded-2xl border border-border p-4">
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

          <section className="rounded-2xl border border-border p-4">
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

          <section className="rounded-2xl border border-border p-4">
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
        </div>
      </AccountExpandCard>

      <div className="flex flex-wrap gap-2 pt-1 text-sm">
        <a
          href="/admin"
          className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
        >
          Admin
        </a>
        <a
          href="/api/export/csv"
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
  );
}
