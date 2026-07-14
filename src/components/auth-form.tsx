"use client";

import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";
import { loginAction, registerAction } from "@/lib/actions/auth";
import { generateStrongPassword } from "@/lib/generate-password";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedHint, setGeneratedHint] = useState(false);

  function applyPassword(value: string) {
    const input = passwordRef.current;
    if (!input) return;
    input.value = value;
    setGeneratedHint(true);
  }

  function handleGeneratePassword() {
    applyPassword(generateStrongPassword());
    setShowPassword(true);
  }

  async function handleCopyPassword() {
    const value = passwordRef.current?.value;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setGeneratedHint(true);
    } catch {
      /* ignore — user can still copy manually */
    }
  }

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
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground/80">
              Password
            </span>
            {mode === "register" && (
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.25} />
                Generate strong
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              ref={passwordRef}
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={mode === "register" ? 8 : 1}
              maxLength={128}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder={
                mode === "register" ? "At least 8 characters" : "••••••••"
              }
              className="field-input min-w-0 flex-1 rounded-2xl px-4 py-3 text-[15px]"
            />
            {mode === "register" && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border text-muted transition hover:border-accent/40 hover:text-accent"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={2.25} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={2.25} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border text-muted transition hover:border-accent/40 hover:text-accent"
                  aria-label="Copy password"
                >
                  <Copy className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </>
            )}
          </div>
        </label>

        {mode === "register" && (
          <p
            className={cn(
              "text-left text-xs text-muted",
              generatedHint && "text-accent/90",
            )}
          >
            {generatedHint
              ? "Strong password generated — copy it somewhere safe before creating your account."
              : "Username: 3–24 characters, start with a letter. Password: 8+ with a letter and a number, or use Generate strong."}
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
              href={ROUTES.register}
              className="font-semibold text-foreground underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href={ROUTES.login}
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
