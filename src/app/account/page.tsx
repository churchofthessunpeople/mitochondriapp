import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  DisplayNameForm,
  PasswordForm,
  UsernameForm,
} from "@/components/account-forms";
import { SiteHeader } from "@/components/site-header";
import { db } from "@/db";
import { users } from "@/db/schema";
import { logoutAction } from "@/lib/actions/auth";
import {
  updateLeaderboardVisibilityAction,
  updateRecoveryEmailAction,
  updateTimezoneAction,
} from "@/lib/actions/profile";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) redirect("/login");

  const displayName = user.displayName || user.name || user.username || "";
  const memberSince = user.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(user.createdAt)
    : null;

  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <SiteHeader active="account" />
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Profile
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign-in, recovery, and preferences.
            {memberSince ? ` Member since ${memberSince}.` : null}
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2 text-sm">
          <Link href="/friends" className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground">
            Friends
          </Link>
          <Link href="/reminders" className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground">
            Reminders
          </Link>
          <Link href="/admin" className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground">
            Admin
          </Link>
          <Link href="/api/export/csv" className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground">
            Export CSV
          </Link>
        </div>

        <div className="space-y-5">
          <DisplayNameForm initialDisplayName={displayName} />
          <UsernameForm initialUsername={user.username} />
          <PasswordForm />

          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Recovery email</h2>
            <p className="mt-1 text-sm text-muted">
              Optional. Used only for password reset (not for login).
            </p>
            <form
              action={async (fd) => {
                "use server";
                await updateRecoveryEmailAction({}, fd);
              }}
              className="mt-4 space-y-3"
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

          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Timezone</h2>
            <p className="mt-1 text-sm text-muted">
              Used for “today” and streak calendar days (IANA name).
            </p>
            <form
              action={async (fd) => {
                "use server";
                await updateTimezoneAction({}, fd);
              }}
              className="mt-4 space-y-3"
            >
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
            <form
              action={async () => {
                "use server";
                await updateLeaderboardVisibilityAction(!user.showOnLeaderboard);
              }}
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
      </main>
    </div>
  );
}
