"use client";

import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useActionState, useState } from "react";
import {
  convertGuestAction,
  type ConvertGuestState,
} from "@/lib/actions/auth";
import { generateStrongPassword } from "@/lib/generate-password";
import { cn } from "@/lib/utils";

export function ConvertGuestPanel() {
  const [state, formAction, pending] = useActionState(
    convertGuestAction,
    {} as ConvertGuestState,
  );
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedHint, setGeneratedHint] = useState(false);

  function applyPassword(value: string) {
    setPassword(value);
    setConfirmPassword(value);
    setGeneratedHint(true);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted">
        Choose a username and password to keep your logs, history, and place
        settings. You&apos;ll unlock Account and the leaderboard.
      </p>

      <form action={formAction} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">
            Username
          </span>
          <input
            name="username"
            required
            minLength={3}
            maxLength={24}
            autoComplete="username"
            pattern="[A-Za-z][A-Za-z0-9_]*"
            placeholder="your_name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">
            Display name{" "}
            <span className="font-normal text-muted">(optional)</span>
          </span>
          <input
            name="displayName"
            maxLength={40}
            placeholder="Shown on the leaderboard"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">
            Password
          </span>
          <div className="relative flex gap-2">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input w-full rounded-2xl px-4 py-3 pr-12 text-[15px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground/80">
            Confirm password
          </span>
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="field-input w-full rounded-2xl px-4 py-3 text-[15px]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPassword(generateStrongPassword())}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:border-accent/40 hover:text-accent"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.25} />
            Generate strong
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!password) return;
              try {
                await navigator.clipboard.writeText(password);
              } catch {
                /* ignore */
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted transition hover:border-accent/40 hover:text-accent"
          >
            <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />
            Copy
          </button>
        </div>

        <p
          className={cn(
            "text-xs text-muted",
            generatedHint && "text-accent/90",
          )}
        >
          {generatedHint
            ? "Strong password generated — copy it somewhere safe before saving."
            : "Username is permanent after you save. Password: 8+ with a letter and a number."}
        </p>

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

        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save account & keep progress"}
        </button>
      </form>
    </div>
  );
}
