"use client";

import { ArrowLeft, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  computeSunriseMultiplier,
  describeSunriseModifiers,
  formatSunriseMultiplier,
  SUNRISE_TIERS,
  type SunriseModifiers,
  type SunriseTier,
} from "@/lib/scoring";
import {
  effectiveSunriseBoostMultiplier,
  encodeSunriseEndOffset,
  pointsForSunriseKeystoneLog,
} from "@/lib/sunrise-keystone-points";
import {
  fullMinutesForSky,
  SUNRISE_SKY_OPTIONS,
  sunriseSessionMinutesFromOffsets,
  sunriseSkyDurationFactor,
} from "@/lib/sunrise-sky";
import {
  computeSunriseSessionOffsets,
  currentLocalHm,
  formatSunriseWindow,
  isSunriseSessionOptimal,
  minutesBeyondOptimalWindow,
  optimalWindowHm,
  viewedAtFromLocalHm,
} from "@/lib/sunrise-timing";
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
    viewedAtStartIso: string,
    viewedAtEndIso: string,
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
  sky: "clear",
};

function defaultSessionHm(
  timeZone: string,
  sunrise: Date | string | null | undefined,
): { startHm: string; endHm: string } {
  if (sunrise) {
    try {
      return optimalWindowHm(sunrise, timeZone);
    } catch {
      /* fall through */
    }
  }
  const now = currentLocalHm(timeZone);
  return { startHm: now, endHm: now };
}

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
  todayIso,
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

  const initialHm = useMemo(
    () => defaultSessionHm(timeZone, sun?.sunrise),
    [timeZone, sun?.sunrise],
  );

  const [step, setStep] = useState<Step>(initialTier ? "modifiers" : "tier");
  const [selected, setSelected] = useState<TierOption | null>(initialTier);
  const [modifiers, setModifiers] = useState<SunriseModifiers>(DEFAULT_MODIFIERS);
  const [startHm, setStartHm] = useState(initialHm.startHm);
  const [finishHm, setFinishHm] = useState(initialHm.endHm);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const computedMultiplier =
    selected != null ? computeSunriseMultiplier(selected.tier, modifiers) : 1;

  const sessionOffsets =
    todayIso && sun?.sunrise
      ? computeSunriseSessionOffsets(
          todayIso,
          startHm,
          finishHm,
          timeZone,
          sun.sunrise,
        )
      : null;
  const sessionMinutes =
    sessionOffsets != null
      ? sunriseSessionMinutesFromOffsets(
          sessionOffsets.startOffset,
          sessionOffsets.endOffset,
        )
      : null;
  const encodedEndOffset =
    sessionOffsets != null
      ? encodeSunriseEndOffset(sessionOffsets.endOffset, modifiers.sky)
      : null;
  const timingPoints =
    selected != null && sessionOffsets != null
      ? pointsForSunriseKeystoneLog(
          selected.protocol.points,
          sessionOffsets.startOffset,
          encodedEndOffset,
        )
      : selected?.protocol.points ?? 0;
  const effectiveBoost =
    selected != null
      ? effectiveSunriseBoostMultiplier(
          selected.tier,
          modifiers,
          sessionOffsets?.startOffset ?? null,
          encodedEndOffset,
        )
      : 1;
  const skyDurationFactor = sunriseSkyDurationFactor(
    sessionMinutes,
    modifiers.sky,
  );
  const requiredSkyMinutes = fullMinutesForSky(modifiers.sky);
  const timingOptimal =
    sessionOffsets != null &&
    isSunriseSessionOptimal(
      sessionOffsets.startOffset,
      sessionOffsets.endOffset,
    );

  const riseLabel = sun?.sunrise
    ? formatTimeInZone(sun.sunrise, timeZone)
    : null;
  const optimalWindow = sun?.sunrise
    ? formatSunriseWindow(sun.sunrise, timeZone)
    : null;

  function pickTier(option: TierOption) {
    setSelected(option);
    setModifiers(DEFAULT_MODIFIERS);
    const hm = defaultSessionHm(timeZone, sun?.sunrise);
    setStartHm(hm.startHm);
    setFinishHm(hm.endHm);
    setStep("modifiers");
  }

  function confirm() {
    if (!selected) return;
    let viewedAtStartIso: string;
    let viewedAtEndIso: string;
    if (todayIso) {
      try {
        viewedAtStartIso = viewedAtFromLocalHm(
          todayIso,
          startHm,
          timeZone,
        ).toISOString();
        viewedAtEndIso = viewedAtFromLocalHm(
          todayIso,
          finishHm,
          timeZone,
        ).toISOString();
      } catch {
        const now = new Date().toISOString();
        viewedAtStartIso = now;
        viewedAtEndIso = now;
      }
    } else {
      const now = new Date().toISOString();
      viewedAtStartIso = now;
      viewedAtEndIso = now;
    }
    onLog(
      selected.protocol,
      selected.tier,
      modifiers,
      viewedAtStartIso,
      viewedAtEndIso,
    );
  }

  if (tiersAvailable.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-hidden bg-black/55 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sunrise-check-title"
    >
      <div className="glass flex max-h-[min(90dvh,calc(100vh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-3xl shadow-xl">
        <div className="shrink-0 p-5 sm:p-6">
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
                    ? "Sky, skin, eyes, and grounding"
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
                        <span className="text-foreground">{riseLabel}</span>
                        {optimalWindow ? (
                          <>
                            . Optimal window{" "}
                            <span className="text-foreground">
                              {optimalWindow}
                            </span>
                            .
                          </>
                        ) : null}
                      </>
                    ) : null}
                  </>
                ) : step === "modifiers" ? (
                  <>
                    Clear skies need 30 min for full points and boost; cloudy skies
                    need 45 min. Skin, sunglasses, and grounding still adjust your
                    day multiplier.
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6 sm:pb-6">
        {step === "tier" ? (
          <div className="flex flex-col gap-2">
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
                className="btn-secondary h-10 rounded-2xl text-xs font-medium text-muted transition hover:text-foreground"
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
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Sky conditions
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2">
                {SUNRISE_SKY_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.id}
                    title={option.label}
                    subtitle={option.subtitle}
                    selected={modifiers.sky === option.id}
                    onClick={() =>
                      setModifiers((m) => ({ ...m, sky: option.id }))
                    }
                    disabled={pending}
                  />
                ))}
              </div>
            </div>

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
              <p className="text-xs text-muted">Max day boost (at full duration)</p>
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
          <div className="flex flex-col gap-3">
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
              {optimalWindow ? (
                <p className="mt-2 text-xs text-muted">
                  Best timing within{" "}
                  <span className="text-foreground">{optimalWindow}</span>
                  {riseLabel ? (
                    <span> (sunrise {riseLabel})</span>
                  ) : null}
                  . {modifiers.sky === "clear" ? "Clear" : "Your"} skies need{" "}
                  <span className="text-foreground">{requiredSkyMinutes} min</span>{" "}
                  for full points and boost.
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted">
                  {modifiers.sky === "clear" ? "Clear" : "Your"} skies need{" "}
                  <span className="text-foreground">{requiredSkyMinutes} min</span>{" "}
                  for full points and boost.
                </p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Start
                  </span>
                  <input
                    type="time"
                    value={startHm}
                    onChange={(e) => setStartHm(e.target.value)}
                    disabled={pending}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Finish
                  </span>
                  <input
                    type="time"
                    value={finishHm}
                    onChange={(e) => setFinishHm(e.target.value)}
                    disabled={pending}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
              </div>
              <p
                className={cn(
                  "mt-2 text-xs",
                  timingOptimal && skyDurationFactor >= 1
                    ? "text-accent"
                    : "text-muted",
                )}
              >
                {sessionMinutes != null ? (
                  <>
                    Session length:{" "}
                    <span className="text-foreground">{sessionMinutes} min</span>
                    {skyDurationFactor >= 1 ? (
                      timingOptimal ? (
                        " — optimal timing & full sky duration"
                      ) : (
                        " — full sky duration"
                      )
                    ) : (
                      ` — need ${requiredSkyMinutes} min for full credit (${Math.round(skyDurationFactor * 100)}%)`
                    )}
                    {!timingOptimal && sessionOffsets != null ? (
                      <>
                        {" "}
                        ·{" "}
                        {Math.max(
                          minutesBeyondOptimalWindow(sessionOffsets.startOffset),
                          minutesBeyondOptimalWindow(sessionOffsets.endOffset),
                        )}{" "}
                        min outside sunrise window
                      </>
                    ) : null}
                  </>
                ) : (
                  `+${timingPoints} pts`
                )}
              </p>
              <p className="mt-2 text-accent">
                {formatSunriseMultiplier(effectiveBoost)} day boost · +
                {timingPoints} pts
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
    </div>
  );
}
