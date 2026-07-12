"use client";

import {
  DisplayNameForm,
  PasswordForm,
  UsernameForm,
} from "@/components/account-forms";
import { logoutAction } from "@/lib/actions/auth";
import {
  saveRecoveryEmailFormAction,
  saveTimezoneFormAction,
  toggleLeaderboardVisibilityFormAction,
} from "@/lib/actions/profile";
import type { AppTab } from "@/lib/app-tabs";
import { cn } from "@/lib/utils";

export type AccountPanelUser = {
  username: string;
  displayName: string | null;
  name: string | null;
  email: string | null;
  timezone: string | null;
  showOnLeaderboard: boolean;
  memberSinceLabel: string | null;
};

const LINKS: { tab: AppTab; label: string; primary?: boolean }[] = [
  { tab: "history", label: "History", primary: true },
  { tab: "leaderboard", label: "Leaderboard" },
  { tab: "friends", label: "Friends" },
  { tab: "reminders", label: "Reminders" },
];

export function AccountPanel({
  user,
  onNavigate,
}: {
  user: AccountPanelUser;
  onNavigate?: (tab: AppTab) => void;
}) {
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
          Sign-in, recovery, and preferences.
          {user.memberSinceLabel
            ? ` Member since ${user.memberSinceLabel}.`
            : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {LINKS.map((l) =>
          onNavigate ? (
            <button
              key={l.tab}
              type="button"
              onClick={() => onNavigate(l.tab)}
              className={cn(
                "rounded-full border px-3 py-1.5",
                l.primary
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          ) : (
            <a
              key={l.tab}
              href={`/app?t=${l.tab}`}
              className={cn(
                "rounded-full border px-3 py-1.5",
                l.primary
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              {l.label}
            </a>
          ),
        )}
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

      <DisplayNameForm initialDisplayName={displayName} />
      <UsernameForm initialUsername={user.username} />
      <PasswordForm />

      <section className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Recovery email</h2>
        <p className="mt-1 text-sm text-muted">
          Optional. Used only for password reset (not for login).
        </p>
        <form action={saveRecoveryEmailFormAction} className="mt-4 space-y-3">
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

      <section className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Timezone</h2>
        <p className="mt-1 text-sm text-muted">
          Used for “today” and streak calendar days (IANA name).
        </p>
        <form action={saveTimezoneFormAction} className="mt-4 space-y-3">
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

      <section className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Leaderboard visibility</h2>
        <form action={toggleLeaderboardVisibilityFormAction} className="mt-3">
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

      <section className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Session</h2>
        <form action={logoutAction} className="mt-5">
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
