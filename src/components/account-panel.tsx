import Link from "next/link";
import {
  DisplayNameForm,
  PasswordForm,
  UsernameForm,
} from "@/components/account-forms";
import { logoutAction } from "@/lib/actions/auth";
import {
  updateLeaderboardVisibilityAction,
  updateRecoveryEmailAction,
  updateTimezoneAction,
} from "@/lib/actions/profile";

export type AccountPanelUser = {
  username: string;
  displayName: string | null;
  name: string | null;
  email: string | null;
  timezone: string | null;
  showOnLeaderboard: boolean;
  memberSinceLabel: string | null;
};

async function saveEmail(formData: FormData) {
  "use server";
  await updateRecoveryEmailAction({}, formData);
}

async function saveTimezone(formData: FormData) {
  "use server";
  await updateTimezoneAction({}, formData);
}

export function AccountPanel({ user }: { user: AccountPanelUser }) {
  const displayName = user.displayName || user.name || user.username || "";
  const show = user.showOnLeaderboard;

  async function toggleLeaderboard() {
    "use server";
    await updateLeaderboardVisibilityAction(!show);
  }

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
        <Link
          href="/history"
          className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
        >
          History
        </Link>
        <Link
          href="/leaderboard"
          className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
        >
          Leaderboard
        </Link>
        <Link
          href="/friends"
          className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
        >
          Friends
        </Link>
        <Link
          href="/reminders"
          className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
        >
          Reminders
        </Link>
        <Link
          href="/admin"
          className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
        >
          Admin
        </Link>
        <Link
          href="/api/export/csv"
          className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground"
        >
          Export CSV
        </Link>
      </div>

      <DisplayNameForm initialDisplayName={displayName} />
      <UsernameForm initialUsername={user.username} />
      <PasswordForm />

      <section className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Recovery email</h2>
        <p className="mt-1 text-sm text-muted">
          Optional. Used only for password reset (not for login).
        </p>
        <form action={saveEmail} className="mt-4 space-y-3">
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
        <form action={saveTimezone} className="mt-4 space-y-3">
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
        <h2 className="text-lg font-semibold">Leaderboard</h2>
        <form action={toggleLeaderboard} className="mt-3">
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
