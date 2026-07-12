"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  setLocationFromZipAction,
  type ZipFormState,
} from "@/lib/actions/region";

export function ZipForm({ currentZip }: { currentZip?: string | null }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    setLocationFromZipAction,
    {} as ZipFormState,
  );

  // Refresh page data when ZIP succeeds so assigned region card updates
  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="glass rounded-3xl p-5">
      <h2 className="text-lg font-semibold">
        {currentZip ? "Update ZIP code" : "US ZIP code"}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Looks up your city for <strong>sunrise/sunset</strong>, then assigns the
        nearest rated region for lifestyle scores.
      </p>
      <form action={action} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          name="zip"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="e.g. 75001"
          defaultValue={currentZip ?? ""}
          maxLength={10}
          required
          className="field-input flex-1 rounded-2xl px-4 py-3 text-[15px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary h-12 shrink-0 rounded-2xl px-5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "Looking up…" : currentZip ? "Update" : "Use ZIP"}
        </button>
      </form>
      {state.error && (
        <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          {state.success}
        </p>
      )}
    </div>
  );
}
