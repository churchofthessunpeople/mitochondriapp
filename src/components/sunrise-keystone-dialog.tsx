"use client";

import { ArrowLeft, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  describeSunriseModifiers,
  formatSunriseMultiplier,
  resolveSunriseTierOptions,
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

type Step = "tier" | "sky" | "grounded" | "skin" | "sunglasses" | "confirm";

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

/**
 * Morning-light keystone flow: one choice at a time through tier + modifiers → confirm.
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
  const tiersAvailable = useMemo(
    () => resolveSunriseTierOptions(allProtocols) as TierOption[],
    [allProtocols],
  );

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

  const [step, setStep] = useState<Step>(initialTier ? "sky" : "tier");
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

  const tierOptions: ClickThroughOption[] = useMemo(
    () =>
      tiersAvailable.map(({ tier, protocol }) => ({
        id: tier.id,
        title: tier.shortLabel,
        subtitle: `${tier.description} · +${protocol.points} pts`,
        badge: `up to ${formatSunriseMultiplier(tier.multiplier)}`,
        highlight: tier.id === "horizon",
      })),
    [tiersAvailable],
  );

  const skyOptions: ClickThroughOption[] = useMemo(
    () =>
      SUNRISE_SKY_OPTIONS.map((option) => ({
        id: option.id,
        title: option.label,
        subtitle: option.subtitle,
      })),
    [],
  );

  const groundedOptions: ClickThroughOption[] = useMemo(
    () => [
      {
        id: "yes",
        title: "Yes — barefoot earth",
        subtitle: "Soil, grass, sand, or stone",
        highlight: true,
      },
      {
        id: "no",
        title: "No",
        subtitle: "Shoes, pavement, or not on earth",
      },
    ],
    [],
  );

  const skinOptions: ClickThroughOption[] = useMemo(
    () => [
      {
        id: "full",
        title: "Mostly exposed",
        subtitle: "Arms, legs, or torso in open air",
        highlight: true,
      },
      {
        id: "partial",
        title: "Partially covered",
        subtitle: "Mostly clothed or only face/hands out",
      },
    ],
    [],
  );

  const sunglassesOptions: ClickThroughOption[] = useMemo(
    () => [
      {
        id: "none",
        title: "No sunglasses",
        subtitle: "Eyes open to morning light",
        highlight: true,
      },
      {
        id: "worn",
        title: "Wearing sunglasses",
        subtitle: "Lowers your day boost",
      },
    ],
    [],
  );

  function pickTier(tierId: string) {
    const option = tiersAvailable.find((x) => x.tier.id === tierId);
    if (!option) return;
    setSelected(option);
    setModifiers(DEFAULT_MODIFIERS);
    const hm = defaultSessionHm(timeZone, sun?.sunrise);
    setStartHm(hm.startHm);
    setFinishHm(hm.endHm);
    setStep("sky");
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

  function goBack() {
    if (step === "sky" && !initialTier) setStep("tier");
    else if (step === "grounded") setStep("sky");
    else if (step === "skin") setStep("grounded");
    else if (step === "sunglasses") setStep("skin");
    else if (step === "confirm") setStep("sunglasses");
  }

  const canGoBack =
    step === "grounded" ||
    step === "skin" ||
    step === "sunglasses" ||
    step === "confirm" ||
    (step === "sky" && !initialTier);

  const title =
    step === "tier"
      ? "Morning light — how did you do?"
      : step === "sky"
        ? "Sky conditions"
        : step === "grounded"
          ? "Were you grounded?"
          : step === "skin"
            ? "Skin exposure"
            : step === "sunglasses"
              ? "Sunglasses"
              : "Confirm morning light";

  const subtitle =
    step === "tier" ? (
      <>
        First light sets the day. Tap the sky view that fits.
        {riseLabel ? (
          <>
            {" "}
            Local sunrise ≈{" "}
            <span className="text-foreground">{riseLabel}</span>
            {optimalWindow ? (
              <>
                . Optimal window{" "}
                <span className="text-foreground">{optimalWindow}</span>.
              </>
            ) : null}
          </>
        ) : null}
      </>
    ) : step === "sky" ? (
      <>
        Clear skies need 30 min for full points and boost; cloudier skies need
        longer.
      </>
    ) : step === "grounded" ? (
      <>Barefoot contact with earth can raise your day boost.</>
    ) : step === "skin" ? (
      <>More open skin in morning light can raise your day boost.</>
    ) : step === "sunglasses" ? (
      <>Sunglasses lower how much morning light reaches your eyes.</>
    ) : (
      <>
        Logging{" "}
        <span className="text-foreground">{selected?.tier.shortLabel}</span>{" "}
        with {describeSunriseModifiers(modifiers)}.
      </>
    );

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
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {subtitle}
              </p>
            </div>
          </div>
          {canGoBack ? (
            <button
              type="button"
              disabled={pending}
              onClick={goBack}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground disabled:opacity-60"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6 sm:pb-6">
          {step === "tier" ? (
            <OptionListChoice
              options={tierOptions}
              selectedId={selected?.tier.id ?? "horizon"}
              disabled={pending}
              onChoose={pickTier}
              footer={
                <div className="mt-1 flex flex-col gap-2">
                  {onDismissSession ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={onDismissSession}
                      className="btn-secondary h-11 rounded-2xl text-sm font-semibold"
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
              }
            />
          ) : null}

          {step === "sky" && selected ? (
            <OptionListChoice
              options={skyOptions}
              selectedId={modifiers.sky}
              disabled={pending}
              onChoose={(id) => {
                setModifiers((m) => ({
                  ...m,
                  sky: id as SunriseModifiers["sky"],
                }));
                setStep("grounded");
              }}
            />
          ) : null}

          {step === "grounded" && selected ? (
            <OptionListChoice
              options={groundedOptions}
              selectedId={modifiers.grounded ? "yes" : "no"}
              disabled={pending}
              onChoose={(id) => {
                setModifiers((m) => ({ ...m, grounded: id === "yes" }));
                setStep("skin");
              }}
            />
          ) : null}

          {step === "skin" && selected ? (
            <OptionListChoice
              options={skinOptions}
              selectedId={modifiers.skin}
              disabled={pending}
              onChoose={(id) => {
                setModifiers((m) => ({
                  ...m,
                  skin: id as SunriseModifiers["skin"],
                }));
                setStep("sunglasses");
              }}
            />
          ) : null}

          {step === "sunglasses" && selected ? (
            <OptionListChoice
              options={sunglassesOptions}
              selectedId={modifiers.sunglasses}
              disabled={pending}
              onChoose={(id) => {
                setModifiers((m) => ({
                  ...m,
                  sunglasses: id as SunriseModifiers["sunglasses"],
                }));
                setStep("confirm");
              }}
            />
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
                    <span className="text-foreground">
                      {requiredSkyMinutes} min
                    </span>{" "}
                    for full points and boost.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted">
                    {modifiers.sky === "clear" ? "Clear" : "Your"} skies need{" "}
                    <span className="text-foreground">
                      {requiredSkyMinutes} min
                    </span>{" "}
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
                      <span className="text-foreground">
                        {sessionMinutes} min
                      </span>
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
                            minutesBeyondOptimalWindow(
                              sessionOffsets.startOffset,
                            ),
                            minutesBeyondOptimalWindow(
                              sessionOffsets.endOffset,
                            ),
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
              {initialTier && onCancel ? (
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
