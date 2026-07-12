"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, Suspense } from "react";
import { resetPasswordAction } from "@/lib/actions/password-reset";
import { ThemeToggle } from "@/components/theme-toggle";

function Form() {
  const sp = useSearchParams();
  const token = sp.get("token") ?? "";
  const uid = sp.get("uid") ?? "";
  const [state, action, pending] = useActionState(resetPasswordAction, {});

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="uid" value={uid} />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="New password"
        className="field-input w-full rounded-2xl px-4 py-3"
      />
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-accent">
          {state.success}{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !token || !uid}
        className="btn-primary flex h-12 w-full items-center justify-center rounded-2xl font-semibold disabled:opacity-50"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="welcome-screen min-h-dvh">
      <div className="flex justify-end px-4 pt-4">
        <ThemeToggle size="sm" />
      </div>
      <main className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <Suspense>
          <Form />
        </Suspense>
      </main>
    </div>
  );
}
