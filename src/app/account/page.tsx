import { eq } from "drizzle-orm";
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

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db
    .select({
      username: users.username,
      displayName: users.displayName,
      name: users.name,
      createdAt: users.createdAt,
    })
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
    <div className="min-h-screen pb-16">
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
            Update how you appear and how you sign in.
            {memberSince ? ` Member since ${memberSince}.` : null}
          </p>
        </div>

        <div className="space-y-5">
          <DisplayNameForm initialDisplayName={displayName} />
          <UsernameForm initialUsername={user.username} />
          <PasswordForm />

          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">Session</h2>
            <p className="mt-1 text-sm text-muted">
              Sign out on this device when you&apos;re done.
            </p>
            <form action={logoutAction} className="mt-5">
              <button
                type="submit"
                className="btn-secondary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition hover:bg-foreground/5 sm:w-auto sm:px-6"
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
