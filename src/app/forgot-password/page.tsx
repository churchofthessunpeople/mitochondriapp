"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/actions/password-reset";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, {});

  return (
    <div className="welcome-screen min-h-dvh">
      <div className="flex justify-end px-4 pt-4">
        <ThemeToggle size="sm" />
      </div>
      <main className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-muted">
          Requires a recovery email saved on your account (Account settings).
        </p>
        <form action={action} className="mt-6 space-y-4">
          <input
            name="username"
            required
            placeholder="Username"
            className="field-input w-full rounded-2xl px-4 py-3"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Recovery email"
            className="field-input w-full rounded-2xl px-4 py-3"
          />
          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
          {state.success && (
            <p className="break-all text-sm text-accent">{state.success}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="btn-primary flex h-12 w-full items-center justify-center rounded-2xl font-semibold"
          >
            {pending ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
