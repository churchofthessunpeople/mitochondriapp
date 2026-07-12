"use client";

import Image from "next/image";
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
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <Link href="/" className="mb-5">
          <Image
            src="/icons/app-icon.jpg"
            alt="Mitochondriapp"
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-[1.15rem] object-cover shadow-md ring-1 ring-zinc-200"
            priority
          />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {mode === "login"
            ? "Sign in to log today’s protocols."
            : "Start tracking your daily black swan stack."}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {mode === "register" && (
          <label className="block space-y-1.5 text-left">
            <span className="text-sm font-medium text-zinc-700">Display name</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={40}
              placeholder="e.g. Solar Mike"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-2"
            />
          </label>
        )}

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-2"
          />
        </label>

        <label className="block space-y-1.5 text-left">
          <span className="text-sm font-medium text-zinc-700">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={mode === "register" ? 8 : 1}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] text-zinc-900 outline-none ring-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:ring-2"
          />
        </label>

        {state.error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-900 text-[15px] font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60"
        >
          {pending
            ? "Working..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {mode === "login" ? (
          <>
            No account yet?{" "}
            <Link href="/register" className="font-semibold text-zinc-900 underline-offset-2 hover:underline">
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-zinc-900 underline-offset-2 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
