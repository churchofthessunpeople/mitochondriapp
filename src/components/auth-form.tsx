"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";
import { loginAction, registerAction } from "@/lib/actions/auth";

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
            ? "Sign in with your username to log today’s protocols."
            : "Pick a username and password — no email required."}
        </p>
      </div>

      {banner && (
        <p className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {banner}
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-foreground/80">Username</span>
          <input
            name="username"
            required
            minLength={3}
            maxLength={24}
            autoComplete="username"
            placeholder="e.g. solarmike"
            pattern="[A-Za-z][A-Za-z0-9_]*"
            title="Start with a letter; letters, numbers, underscores only"
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>

        {mode === "register" && (
          <label className="block space-y-1.5 text-left">
            <span className="text-sm font-medium text-foreground/80">
              Display name{" "}
              <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              name="displayName"
              minLength={2}
              maxLength={40}
              placeholder="Shown on the leaderboard"
              className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
            />
          </label>
        )}

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
            Username: 3–24 characters, start with a letter. Password: 8+ with a
            letter and a number.
          </p>
        )}

        <StatusPanel state={state} />

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

      {mode === "login" && (
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-accent hover:underline">
            Forgot password?
          </Link>
        </p>
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

function StatusPanel({ state }: { state: AuthFormState }) {
  if (!state.error && !state.success) return null;

  return (
    <div className="space-y-3 text-left">
      {state.error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {state.success}
        </p>
      )}
    </div>
  );
}
