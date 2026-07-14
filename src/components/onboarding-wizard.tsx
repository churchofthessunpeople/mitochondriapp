"use client";

import { Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useOptimistic, useState, useTransition } from "react";
import type { Protocol } from "@/db/schema";
import { logCompletionAction } from "@/lib/actions/completions";
import { markOnboardingCompleteAction } from "@/lib/actions/onboarding";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import {
  setLocationFromZipAction,
  type ZipFormState,
} from "@/lib/actions/region";
import { ROUTES } from "@/lib/routes";
import { isCatalogSelectableProtocol } from "@/lib/scoring";
import { cn } from "@/lib/utils";

type Step = "welcome" | "location" | "activities" | "firstwin" | "done";

type Props = {
  starterProtocols: Protocol[];
  initialAvailableIds: string[];
  currentZip?: string | null;
  placeLabel?: string | null;
};

export function OnboardingWizard({
  starterProtocols,
  initialAvailableIds,
  currentZip,
  placeLabel,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [available, setAvailable] = useOptimistic(
    new Set(initialAvailableIds),
    (current: Set<string>, protocolId: string) => {
      const next = new Set(current);
      if (next.has(protocolId)) next.delete(protocolId);
      else next.add(protocolId);
      return next;
    },
  );

  const [zipState, zipAction, zipPending] = useActionState(
    setLocationFromZipAction,
    {} as ZipFormState,
  );

  useEffect(() => {
    if (zipState.success && step === "location") {
      // Stay on step so they see success; they advance with Next
    }
  }, [zipState.success, step]);

  function toggleActivity(id: string) {
    start(async () => {
      try {
        setAvailable(id);
        await toggleFavoriteAction(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not update");
      }
    });
  }

  function finish() {
    setError(null);
    start(async () => {
      try {
        await markOnboardingCompleteAction();
        router.replace(`${ROUTES.home}?sunrise=1`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not finish setup");
      }
    });
  }

  const steps: Step[] = [
    "welcome",
    "location",
    "activities",
    "firstwin",
    "done",
  ];
  const stepIndex = steps.indexOf(step);

  const winCandidates = starterProtocols
    .filter((p) => available.has(p.id) && isCatalogSelectableProtocol(p))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-1.5">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition",
              i <= stepIndex ? "bg-accent" : "bg-border",
            )}
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {step === "welcome" && (
        <section className="text-center">
          <Image
            src="/icons/app-icon.jpg"
            alt=""
            width={80}
            height={80}
            className="mx-auto h-20 w-20 rounded-2xl object-cover ring-1 ring-border"
          />
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent">
            Welcome
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Optimize mitochondria daily
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Track the habits that support mitochondrial function —{" "}
            <strong className="text-foreground">light</strong>,{" "}
            <strong className="text-foreground">water</strong>, and{" "}
            <strong className="text-foreground">magnetism</strong> — using
            protocols you can actually do. Setup takes about a minute.
          </p>
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-muted">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <strong className="text-foreground">Light</strong> — sunrise
                keystone & outdoor spectrum from your ZIP
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <strong className="text-foreground">Water</strong> — low-D
                hydration & deuterium-aware meals
              </span>
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <strong className="text-foreground">Magnetism</strong> — ground,
                geology place score, cut nnEMF
              </span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => setStep("location")}
            className="btn-primary mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold"
          >
            Get started
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>
      )}

      {step === "location" && (
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Step 1 of 3
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Where are you?
          </h1>
          <p className="mt-2 text-sm text-muted">
            A US ZIP gives sunrise/sunset at your coordinates and the nearest
            lifestyle score. You can change this anytime.
          </p>

          <div className="glass mt-6 rounded-3xl p-5">
            <form action={zipAction} className="flex flex-col gap-3 sm:flex-row">
              <input
                name="zip"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="e.g. 33101"
                defaultValue={currentZip ?? ""}
                maxLength={10}
                required
                className="field-input flex-1 rounded-2xl px-4 py-3 text-[15px]"
              />
              <button
                type="submit"
                disabled={zipPending}
                className="btn-primary h-12 shrink-0 rounded-2xl px-5 text-sm font-semibold disabled:opacity-60"
              >
                {zipPending ? "Looking up…" : "Use ZIP"}
              </button>
            </form>
            {zipState.error && (
              <p className="mt-3 text-sm text-red-400">{zipState.error}</p>
            )}
            {(zipState.success || placeLabel) && (
              <p className="mt-3 rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
                {zipState.success ||
                  `Located ${placeLabel}. Sun times ready.`}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep("activities")}
              className="btn-primary inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold"
            >
              {(zipState.success || currentZip || placeLabel)
                ? "Continue"
                : "Continue with location"}
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep("activities")}
              className="btn-secondary inline-flex h-12 flex-1 items-center justify-center rounded-2xl text-sm font-semibold"
            >
              Skip for now
            </button>
          </div>
        </section>
      )}

      {step === "activities" && (
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Step 2 of 3
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            What can you do?
          </h1>
          <p className="mt-2 text-sm text-muted">
            Toggle only what you can realistically do this week. Example: skip
            gear you don&apos;t have. You can add more later on Activities.
          </p>
          <p className="mt-2 text-sm">
            <span className="font-medium text-accent">{available.size}</span>
            <span className="text-muted"> selected</span>
          </p>

          <ul className="mt-5 max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto pr-0.5">
            {starterProtocols
              .filter(isCatalogSelectableProtocol)
              .map((p) => {
              const on = available.has(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggleActivity(p.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition",
                      on
                        ? "border-accent/40 bg-accent/10"
                        : "border-border bg-card hover:border-accent/25",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        on
                          ? "border-accent/50 bg-accent text-on-accent"
                          : "border-border text-muted",
                      )}
                    >
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    <span className="min-w-0">
                      <span className="font-medium leading-snug">{p.name}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                        {p.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                setStep(available.size > 0 ? "firstwin" : "done")
              }
              className="btn-primary inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold"
            >
              {available.size > 0
                ? `Continue with ${available.size}`
                : "Continue without selecting"}
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep("location")}
              className="btn-secondary inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold"
            >
              Back
            </button>
          </div>
        </section>
      )}

      {step === "firstwin" && (
        <section>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Step 3 of 4
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Log one thing now
          </h1>
          <p className="mt-2 text-sm text-muted">
            First points unlock the habit. Pick anything you already did today
            (or skip).
          </p>
          <ul className="mt-5 space-y-2">
            {winCandidates.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    start(async () => {
                      try {
                        await logCompletionAction(p.id);
                        setStep("done");
                      } catch (e) {
                        setError(
                          e instanceof Error ? e.message : "Could not log",
                        );
                      }
                    });
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-border px-4 py-3 text-left hover:border-accent/40"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-accent">+{p.points} pts</span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setStep("done")}
            className="btn-secondary mt-6 h-12 w-full rounded-2xl text-sm font-semibold"
          >
            Skip for now
          </button>
        </section>
      )}

      {step === "done" && (
        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Ready
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            You&apos;re set
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Each day, cover morning light, a water habit, and ground or low-RF
            time. Place shows sun times and geology. Checklist only shows what
            you can do.
          </p>
          <div className="glass mx-auto mt-6 max-w-sm rounded-3xl p-4 text-left text-sm text-muted">
            <p>
              <span className="text-foreground">Tip:</span> protect darkness at
              night — this app stays warm/low-blue by default.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={finish}
            className="btn-primary mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold disabled:opacity-60"
          >
            {pending ? "Opening checklist…" : "Open today's checklist"}
          </button>
        </section>
      )}
    </div>
  );
}
