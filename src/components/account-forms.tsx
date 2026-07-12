"use client";

import { useActionState, useEffect, useRef } from "react";
import type { AccountFormState } from "@/lib/actions/account";
import {
  updateDisplayNameAction,
  updateEmailAction,
  updatePasswordAction,
} from "@/lib/actions/account";

function FormMessage({ state }: { state: AccountFormState }) {
  if (state.error) {
    return (
      <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
        {state.success}
      </p>
    );
  }
  return null;
}

function AccountSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DisplayNameForm({
  initialDisplayName,
}: {
  initialDisplayName: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateDisplayNameAction,
    {},
  );

  return (
    <AccountSection
      title="Display name"
      description="Shown on the leaderboard and in your account."
    >
      <form action={formAction} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">Name</span>
          <input
            name="displayName"
            required
            minLength={2}
            maxLength={40}
            defaultValue={initialDisplayName}
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>
        <FormMessage state={state} />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {pending ? "Saving..." : "Save name"}
        </button>
      </form>
    </AccountSection>
  );
}

export function EmailForm({ initialEmail }: { initialEmail: string }) {
  const [state, formAction, pending] = useActionState(updateEmailAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.querySelector<HTMLInputElement>(
        'input[name="currentPassword"]',
      ) &&
        ((
          formRef.current.querySelector(
            'input[name="currentPassword"]',
          ) as HTMLInputElement
        ).value = "");
    }
  }, [state.success]);

  return (
    <AccountSection
      title="Email"
      description="Used to sign in. Confirm with your current password."
    >
      <form ref={formRef} action={formAction} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">Email</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={initialEmail}
            autoComplete="email"
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">
            Current password
          </span>
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>
        <FormMessage state={state} />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {pending ? "Saving..." : "Save email"}
        </button>
      </form>
    </AccountSection>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <AccountSection
      title="Password"
      description="At least 8 characters with a letter and a number. Changing password signs you out everywhere."
    >
      <form ref={formRef} action={formAction} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">
            Current password
          </span>
          <input
            name="currentPassword"
            type="password"
            required
            maxLength={128}
            autoComplete="current-password"
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">
            New password
          </span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">
            Confirm new password
          </span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>
        <FormMessage state={state} />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {pending ? "Updating..." : "Update password"}
        </button>
      </form>
    </AccountSection>
  );
}
