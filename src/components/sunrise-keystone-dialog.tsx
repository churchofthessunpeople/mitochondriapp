"use client";

import { ArrowLeft, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  computeSunriseMultiplier,
  describeSunriseModifiers,
  formatSunriseMultiplier,
  SUNRISE_TIERS,
  type SunriseModifiers,
  type SunriseTier,
} from "@/lib/scoring";
import { formatTimeInZone, type SunTimes } from "@/lib/sun";
import { cn } from "@/lib/utils";

type TierOption = { tier: SunriseTier; protocol: Protocol };

type Props = {
  todayIso?: string;
  allProtocols: Protocol[];
  sun: SunTimes | null;
  timeZone: string;
  pending?: boolean;
  onLog: (
    protocol: Protocol,
    tier: SunriseTier,
    modifiers: SunriseModifiers,
  ) => void;
  onDismissSession?: () => void;
  onDismissDay?: () => void;
  onCancel?: () => void;
  /** When set, skip tier pick and open modifiers for this protocol */
  initialProtocol?: Protocol | null;
};

type Step = "tier" | "modifiers" | "confirm";

const DEFAULT_MODIFIERS: SunriseModifiers = {
  grounded: true,
  skin: "full",
  sunglasses: "none",
};

function ChoiceButton({
  title,
  subtitle,
  selected,
  highlight,
  onClick,
  disabled,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  highlight?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left transition disabled:opacity-60",
        selected || highlight
          ? "border-accent/40 bg-accent/10 hover:bg-accent/15"
          : "border-border bg-foreground/[0.02] hover:border-accent/30",
      )}
    >
      <span className="text-sm font-semibold text-foreground">{title}</span>
      {subtitle ? (
        <p className="mt-1 text-xs leading-relaxed text-muted">{subtitle}</p>
      ) : null}
    </button>
  );
}

/**
 * Morning-light keystone flow: tier → grounding / skin / sunglasses → confirm.
 */
export function SunriseKeystoneDialog({
  allProtocols,
  sun,
  timeZone,
  pending = false,
  onLog,
  onDismissSession,
  onDismissDay,
  onCancel,
  initialProtocol = null,
}: Props) {
  const tiersAvailable = useMemo(() => {
    const byId = new Map(allProtocols.map((p) => [p.id, p]));
    return SUNRISE_TIERS.map((tier) => ({
      tier,
      protocol: byId.get(tier.protocolId) ?? null,
    })).filter((x) => x.protocol != null) as TierOption[];
  }, [allProtocols]);

  const initialTier = useMemo(() => {
    if (!initialProtocol) return null;
    return (
      tiersAvailable.find((x) => x.protocol.id === initialProtocol.id) ?? null
    );
  }, [initialProtocol, tiersAvailable]);

  const [step, setStep] = useState<Step>(initialTier ? "modifiers" : "tier");
  const [selected, setSelected] = useState<TierOption | null>(initialTier);
  const [modifiers, setModifiers] = useState<SunriseModifiers>(DEFAULT_MODIFIERS);

  const computedMultiplier =
    selected != null ? computeSunriseMultiplier(selected.tier, modifiers) : 1;

  const riseLabel = sun?.sunrise
    ? formatTimeInZone(sun.sunrise, timeZone)
    : null;

  function pickTier(option: TierOption) {
    setSelected(option);
    setModifiers(DEFAULT_MODIFIERS);
    setStep("modifiers");
  }

  function confirm() {
    if (!selected) return;
    onLog(selected.protocol, selected.tier, modifiers);
  }

  if (tiersAvailable.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sunrise-check-title"
    >
      <div className="glass w-full max-w-md rounded-3xl p-5 shadow-xl sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent">
            <Sun className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-accent">
              Daily light check
            </p>
            <h2
              id="sunrise-check-title"
              className="mt-1 text-xl font-semibold tracking-tight"
            >
              {step === "tier"
                ? "Morning light — how did you do?"
                : step === "modifiers"
                  ? "Skin, eyes, and grounding"
                  : "Confirm morning light"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {step === "tier" ? (
                <>
                  First light sets the day. Pick the best sky view — then we&apos;ll
                  fine-tune skin, sunglasses, and grounding for your day boost.
                  {riseLabel ? (
                    <>
                      {" "}
                      Local sunrise ≈{" "}
                      <span className="text-foreground">{riseLabel}</span>.
                    </>
                  ) : null}
                </>
              ) : step === "modifiers" ? (
                <>
                  Horizon + mostly exposed skin + no sunglasses + grounding is the
                  strongest boost. Sunglasses, covered skin, or no grounding lower
                  it.
                </>
              ) : (
                <>
                  Logging{" "}
                  <span className="text-foreground">
                    {selected?.tier.shortLabel}
                  </span>{" "}
                  with {describeSunriseModifiers(modifiers)}.
                </>
              )}
            </p>
          </div>
        </div>

        {step === "tier" ? (
          <div className="mt-5 flex flex-col gap-2">
            {tiersAvailable.map(({ tier, protocol }) => (
              <button
                key={tier.id}
                type="button"
                disabled={pending}
                onClick={() => pickTier({ tier, protocol })}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition disabled:opacity-60",
                  tier.id === "horizon"
                    ? "border-accent/40 bg-accent/10 hover:bg-accent/15"
                    : "border-border bg-foreground/[0.02] hover:border-accent/30",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {tier.shortLabel}
                  </span>
                  <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
                    up to {formatSunriseMultiplier(tier.multiplier)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {tier.description}
                  <span className="text-foreground/80">
                    {" "}
                    · +{protocol.points} pts
                  </span>
                </p>
              </button>
            ))}

            {onDismissSession ? (
              <button
                type="button"
                disabled={pending}
                onClick={onDismissSession}
                className="btn-secondary mt-1 h-11 rounded-2xl text-sm font-semibold"
              >
                Not yet — ask me later
              </button>
            ) : null}
            {onDismissDay ? (
              <button
                type="button"
                disabled={pending}
                onClick={onDismissDay}
                className="h-10 rounded-2xl text-xs font-medium text-muted transition hover:text-foreground"
              >
                Missed it today — don&apos;t ask again until tomorrow
              </button>
            ) : null}
            {onCancel ? (
              <button
                type="button"
                disabled={pending}
                onClick={onCancel}
                className="h-10 rounded-2xl text-xs font-medium text-muted transition hover:text-foreground"
              >
                Cancel
              </button>
            ) : null}
          </div>
        ) : null}

        {step === "modifiers" && selected ? (
          <div className="mt-5 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Grounded?
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <ChoiceButton
                  title="Yes — barefoot earth"
                  selected={modifiers.grounded}
                  onClick={() =>
                    setModifiers((m) => ({ ...m, grounded: true }))
                  }
                  disabled={pending}
                />
                <ChoiceButton
                  title="No"
                  selected={!modifiers.grounded}
                  onClick={() =>
                    setModifiers((m) => ({ ...m, grounded: false }))
                  }
                  disabled={pending}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Skin exposure
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2">
                <ChoiceButton
                  title="Mostly exposed"
                  subtitle="Arms, legs, or torso in open air"
                  selected={modifiers.skin === "full"}
                  onClick={() =>
                    setModifiers((m) => ({ ...m, skin: "full" }))
                  }
                  disabled={pending}
                />
                <ChoiceButton
                  title="Partially covered"
                  subtitle="Mostly clothed or only face/hands out"
                  selected={modifiers.skin === "partial"}
                  onClick={() =>
                    setModifiers((m) => ({ ...m, skin: "partial" }))
                  }
                  disabled={pending}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Sunglasses
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <ChoiceButton
                  title="No sunglasses"
                  selected={modifiers.sunglasses === "none"}
                  onClick={() =>
                    setModifiers((m) => ({ ...m, sunglasses: "none" }))
                  }
                  disabled={pending}
                />
                <ChoiceButton
                  title="Wearing sunglasses"
                  selected={modifiers.sunglasses === "worn"}
                  onClick={() =>
                    setModifiers((m) => ({ ...m, sunglasses: "worn" }))
                  }
                  disabled={pending}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
              <p className="text-xs text-muted">Estimated day boost</p>
              <p className="mt-1 text-lg font-semibold text-accent">
                {formatSunriseMultiplier(computedMultiplier)} on other activities
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setStep("confirm")}
                className="btn-primary h-11 rounded-2xl text-sm font-semibold"
              >
                Review & log
              </button>
              {!initialTier ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setStep("tier")}
                  className="btn-secondary inline-flex h-10 items-center justify-center gap-1 rounded-2xl text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sky type
                </button>
              ) : onCancel ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={onCancel}
                  className="btn-secondary h-10 rounded-2xl text-sm font-medium"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === "confirm" && selected ? (
          <div className="mt-5 flex flex-col gap-3">
            <div className="rounded-2xl border border-border bg-foreground/[0.02] px-4 py-3 text-sm">
              <p>
                <span className="font-semibold text-foreground">
                  {selected.tier.shortLabel}
                </span>
                <span className="text-muted">
                  {" "}
                  · {describeSunriseModifiers(modifiers)}
                </span>
              </p>
              <p className="mt-2 text-accent">
                {formatSunriseMultiplier(computedMultiplier)} day boost · +
                {selected.protocol.points} pts
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={confirm}
              className="btn-primary h-11 rounded-2xl text-sm font-semibold"
            >
              Log morning light
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setStep("modifiers")}
              className="btn-secondary inline-flex h-10 items-center justify-center gap-1 rounded-2xl text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit details
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
