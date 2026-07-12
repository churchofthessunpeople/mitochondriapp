"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="glass mx-auto w-full max-w-md rounded-3xl p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          Mitochondriapp
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {mode === "login"
            ? "Log your protocols, bank points, climb the board."
            : "Start tracking light, grounding, and lifestyle protocols daily."}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {mode === "register" && (
          <label className="block space-y-1.5">
            <span className="text-sm text-muted">Display name</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={40}
              placeholder="e.g. Solar Mike"
              className="w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm outline-none ring-accent placeholder:text-muted/60 focus:ring-2"
            />
          </label>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm outline-none ring-accent placeholder:text-muted/60 focus:ring-2"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
            className="w-full rounded-xl border border-border bg-black/20 px-3 py-2.5 text-sm outline-none ring-accent placeholder:text-muted/60 focus:ring-2"
          />
        </label>

        {state.error && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#041016] transition hover:brightness-110 disabled:opacity-60"
        >
          {pending
            ? "Working..."
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            No account yet?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
