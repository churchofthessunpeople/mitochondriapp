"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";
import {
  loginAction,
  registerAction,
  resendVerificationAction,
} from "@/lib/actions/auth";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  banner,
}: {
  mode: Mode;
  banner?: string;
}) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, {});
  const [resendState, resendAction, resendPending] = useActionState(
    resendVerificationAction,
    {},
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/" className="mb-5">
          <Image
            src="/icons/app-icon.jpg"
            alt="Mitochondriapp"
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-[1.15rem] object-cover ring-1 ring-border"
            style={{ boxShadow: "var(--shadow-icon)" }}
            priority
          />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "login"
            ? "Sign in to log today’s protocols."
            : "Start tracking your daily black swan stack."}
        </p>
      </div>

      {banner && (
        <p className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {banner}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        {mode === "register" && (
          <label className="block space-y-1.5 text-left">
            <span className="text-sm font-medium text-foreground/80">
              Display name
            </span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={40}
              placeholder="e.g. Solar Mike"
              className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
            />
          </label>
        )}

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-foreground/80">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-foreground/80">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            maxLength={128}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={
              mode === "register" ? "At least 8 characters" : "••••••••"
            }
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>

        {mode === "register" && (
          <p className="text-left text-xs text-muted">
            At least 8 characters with a letter and a number (e.g. Hoger42@).
            Very common or breached passwords are still blocked.
          </p>
        )}

        <StatusMessage state={state} />

        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        >
          {pending
            ? "Working..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      {(state.needsVerification || mode === "login") && (
        <form action={resendAction} className="mt-4 space-y-2">
          <p className="text-center text-xs text-muted">
            Need a verification email?
          </p>
          <input
            name="email"
            type="email"
            required
            placeholder="Email for resend"
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
          <StatusMessage state={resendState} />
          <button
            type="submit"
            disabled={resendPending}
            className="btn-secondary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold disabled:opacity-60"
          >
            {resendPending ? "Sending..." : "Resend verification link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            No account yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function StatusMessage({ state }: { state: AuthFormState }) {
  if (state.error) {
    return (
      <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <div className="space-y-2">
        <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {state.success}
        </p>
        {state.devVerifyUrl && (
          <p className="break-all rounded-2xl border border-border bg-foreground/5 px-4 py-3 text-left text-xs text-muted">
            Dev verify link:{" "}
            <a href={state.devVerifyUrl} className="text-accent underline">
              {state.devVerifyUrl}
            </a>
          </p>
        )}
      </div>
    );
  }
  return null;
}
