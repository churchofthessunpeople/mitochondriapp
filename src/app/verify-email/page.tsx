import Link from "next/link";
import { eq } from "drizzle-orm";
import { ThemeToggle } from "@/components/theme-toggle";
import { db } from "@/db";
import { users } from "@/db/schema";
import { consumeEmailVerificationToken } from "@/lib/email";
import { ROUTES } from "@/lib/routes";

export const metadata = { title: "Verify email" };

type Props = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const email = params.email?.trim().toLowerCase() ?? "";

  let status: "ok" | "bad" | "missing" = "missing";

  if (token && email) {
    const valid = await consumeEmailVerificationToken(email, token);
    if (valid) {
      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.email, email));
      status = "ok";
    } else {
      status = "bad";
    }
  }

  return (
    <div className="welcome-screen min-h-dvh">
      <div className="flex justify-end px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <ThemeToggle size="sm" />
      </div>
      <main className="mx-auto flex w-full max-w-md flex-col px-6 pb-10 pt-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {status === "ok"
            ? "Email verified"
            : status === "bad"
              ? "Link invalid or expired"
              : "Verify your email"}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {status === "ok"
            ? "Your account is active. You can sign in now."
            : status === "bad"
              ? "Request a new verification link from the sign-in page."
              : "Open the link from your email to activate your account."}
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href={ROUTES.login}
            className="btn-primary flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold"
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.register}
            className="btn-secondary flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold"
          >
            Create account
          </Link>
        </div>
      </main>
    </div>
  );
}
