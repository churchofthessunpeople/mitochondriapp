"use client";

import { Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Protocol } from "@/db/schema";
import {
  OptionGroup,
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
  isPastSunriseMorningWindow,
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
  /** When set, pre-select this sunrise tier */
  initialProtocol?: Protocol | null;
};

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
  if (sunrise && !isPastSunriseMorningWindow(sunrise, timeZone)) {
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
 * Morning-light check-in — all choices on one screen, then log.
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
    if (!initialProtocol) {
      return tiersAvailable.find((x) => x.tier.id === "horizon") ?? tiersAvailable[0] ?? null;
    }
    return (
      tiersAvailable.find((x) => x.protocol.id === initialProtocol.id) ??
      tiersAvailable[0] ??
      null
    );
  }, [initialProtocol, tiersAvailable]);

  const initialHm = useMemo(
    () => defaultSessionHm(timeZone, sun?.sunrise),
    [timeZone, sun?.sunrise],
  );

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

  const pastMorning = isPastSunriseMorningWindow(sun?.sunrise, timeZone);

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
        <div className="shrink-0 p-5 pb-3 sm:p-6 sm:pb-3">
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
                {pastMorning
                  ? "Morning light — log or skip?"
                  : "Sunrise — how did you do?"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {pastMorning
                  ? "The morning window has passed. Log if you caught sunrise earlier, or skip until tomorrow."
                  : "First light sets the day. Set your sky view and conditions, then log."}
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
                ) : (
                  <> Set a US ZIP in Place for accurate sunrise times.</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-4 sm:px-6">
          <OptionGroup
            label="Sky view"
            options={tierOptions}
            selectedId={selected?.tier.id}
            disabled={pending}
            onChoose={pickTier}
          />
          <OptionGroup
            label="Sky conditions"
            options={skyOptions}
            selectedId={modifiers.sky}
            disabled={pending}
            onChoose={(id) =>
              setModifiers((m) => ({
                ...m,
                sky: id as SunriseModifiers["sky"],
              }))
            }
          />
          <OptionGroup
            label="Grounded?"
            options={groundedOptions}
            selectedId={modifiers.grounded ? "yes" : "no"}
            disabled={pending}
            onChoose={(id) =>
              setModifiers((m) => ({ ...m, grounded: id === "yes" }))
            }
          />
          <OptionGroup
            label="Skin exposure"
            options={skinOptions}
            selectedId={modifiers.skin}
            disabled={pending}
            onChoose={(id) =>
              setModifiers((m) => ({
                ...m,
                skin: id as SunriseModifiers["skin"],
              }))
            }
          />
          <OptionGroup
            label="Sunglasses"
            options={sunglassesOptions}
            selectedId={modifiers.sunglasses}
            disabled={pending}
            onChoose={(id) =>
              setModifiers((m) => ({
                ...m,
                sunglasses: id as SunriseModifiers["sunglasses"],
              }))
            }
          />

          <div className="rounded-2xl border border-border bg-foreground/[0.02] px-4 py-3 text-sm">
            <p>
              <span className="font-semibold text-foreground">
                {selected?.tier.shortLabel ?? "Sunrise"}
              </span>
              <span className="text-muted">
                {" "}
                · {describeSunriseModifiers(modifiers)}
              </span>
            </p>
            <p className="mt-2 text-xs text-muted">
              {modifiers.sky === "clear" ? "Clear" : "Your"} skies need{" "}
              <span className="text-foreground">{requiredSkyMinutes} min</span>{" "}
              for full points and boost.
            </p>
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
        </div>

        <div className="shrink-0 space-y-2 border-t border-border px-5 py-4 sm:px-6">
          <button
            type="button"
            disabled={pending || !selected}
            onClick={confirm}
            className="btn-primary h-12 w-full rounded-2xl text-sm font-semibold disabled:opacity-60"
          >
            {pending ? "Logging…" : "Log Sunrise"}
          </button>
          {pastMorning && onDismissDay ? (
            <button
              type="button"
              disabled={pending}
              onClick={onDismissDay}
              className="btn-secondary h-11 w-full rounded-2xl text-sm font-semibold"
            >
              Missed it today — ask again tomorrow
            </button>
          ) : null}
          {onDismissSession ? (
            <button
              type="button"
              disabled={pending}
              onClick={onDismissSession}
              className="btn-secondary h-11 w-full rounded-2xl text-sm font-semibold"
            >
              Not yet — ask me later
            </button>
          ) : null}
          {!pastMorning && onDismissDay ? (
            <button
              type="button"
              disabled={pending}
              onClick={onDismissDay}
              className="h-10 w-full rounded-2xl text-xs font-medium text-muted transition hover:text-foreground"
            >
              Missed it today — don&apos;t ask again until tomorrow
            </button>
          ) : null}
          {onCancel ? (
            <button
              type="button"
              disabled={pending}
              onClick={onCancel}
              className="h-10 w-full rounded-2xl text-xs font-medium text-muted transition hover:text-foreground"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
