"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  clearTravelModeAction,
  setLocationFromZipAction,
  type ZipFormState,
} from "@/lib/actions/region";

export function ZipForm({
  currentZip,
  travelLabel,
  travelUntil,
}: {
  currentZip?: string | null;
  travelLabel?: string | null;
  travelUntil?: string | null;
}) {
  const router = useRouter();
  const [travel, setTravel] = useState(false);
  const [travelDays, setTravelDays] = useState(7);
  const [state, action, pending] = useActionState(
    setLocationFromZipAction,
    {} as ZipFormState,
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="glass space-y-4 rounded-3xl p-5">
      <div>
        <h2 className="text-lg font-semibold">
          {travel
            ? "Travel ZIP"
            : currentZip
              ? "Update home ZIP"
              : "US ZIP code"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {travel
            ? "Temporary sun times at another city. Your home ZIP stays saved."
            : "Looks up your city for sunrise/sunset, then nearest lifestyle score."}
        </p>
      </div>

      {travelLabel && travelUntil && !travel && (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm">
          <p className="text-accent">
            Travel mode: {travelLabel} through {travelUntil}
          </p>
          <button
            type="button"
            className="mt-2 text-xs text-muted underline"
            onClick={() => {
              void clearTravelModeAction().then(() => router.refresh());
            }}
          >
            End travel mode
          </button>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={travel}
          onChange={(e) => setTravel(e.target.checked)}
          className="rounded border-border"
        />
        I&apos;m traveling (temporary override)
      </label>

      {travel && (
        <label className="block text-xs text-muted">
          Days away
          <input
            type="number"
            min={1}
            max={30}
            value={travelDays}
            onChange={(e) => setTravelDays(Number(e.target.value) || 7)}
            className="field-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
          />
        </label>
      )}

      <form action={action} className="flex flex-col gap-3 sm:flex-row">
        {travel && <input type="hidden" name="travel" value="1" />}
        {travel && (
          <input type="hidden" name="travelDays" value={String(travelDays)} />
        )}
        <input
          name="zip"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="e.g. 75001"
          defaultValue={travel ? "" : (currentZip ?? "")}
          maxLength={10}
          required
          className="field-input flex-1 rounded-2xl px-4 py-3 text-[15px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-primary h-12 shrink-0 rounded-2xl px-5 text-sm font-semibold disabled:opacity-60"
        >
          {pending
            ? "Looking up…"
            : travel
              ? "Set travel ZIP"
              : currentZip
                ? "Update"
                : "Use ZIP"}
        </button>
      </form>
      {state.error && (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          {state.success}
        </p>
      )}
    </div>
  );
}
