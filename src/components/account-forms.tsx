"use client";

import { useActionState, useEffect, useRef } from "react";
import type { AccountFormState } from "@/lib/actions/account";
import {
  updateDisplayNameAction,
  updatePasswordAction,
} from "@/lib/actions/account";
import {
  updateRecoveryEmailAction,
  type ProfileFormState,
} from "@/lib/actions/profile";

function FormMessage({
  state,
}: {
  state: AccountFormState | ProfileFormState;
}) {
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
  changeBlockedUntilLabel,
}: {
  initialDisplayName: string;
  changeBlockedUntilLabel?: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateDisplayNameAction,
    {},
  );
  const locked = Boolean(changeBlockedUntilLabel);

  return (
    <AccountSection
      title="Display name"
      description={
        locked
          ? `Shown on the leaderboard when set; otherwise your username appears. You can change it again on ${changeBlockedUntilLabel}.`
          : "Shown on the leaderboard when set; otherwise your username appears. You can change this once every 30 days after your first week on the app."
      }
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
            disabled={locked}
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
        <FormMessage state={state} />
        <button
          type="submit"
          disabled={pending || locked}
          className="btn-primary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {pending ? "Saving..." : "Save name"}
        </button>
      </form>
    </AccountSection>
  );
}

export function UsernameSection({ username }: { username: string }) {
  return (
    <AccountSection
      title="Username"
      description="Used to sign in. Permanent after signup — choose carefully at registration."
    >
      <p className="rounded-2xl border border-border bg-foreground/[0.03] px-4 py-3 font-mono text-[15px] text-foreground">
        {username}
      </p>
    </AccountSection>
  );
}

export function RecoveryEmailForm({
  initialEmail,
}: {
  initialEmail: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateRecoveryEmailAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      const el = formRef.current?.querySelector<HTMLInputElement>(
        'input[name="currentPassword"]',
      );
      if (el) el.value = "";
    }
  }, [state.success]);

  return (
    <AccountSection
      title="Recovery email"
      description="Optional. Used only for password reset. Confirm with your current password."
    >
      <form ref={formRef} action={formAction} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={initialEmail ?? ""}
            placeholder="you@example.com"
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
