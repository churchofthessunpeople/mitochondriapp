"use client";

import { Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Protocol } from "@/db/schema";
import { logCompletionAction } from "@/lib/actions/completions";
import {
  formatSunriseMultiplier,
  SUNRISE_TIERS,
  type SunriseTier,
} from "@/lib/scoring";
import { formatTimeInZone, type SunTimes } from "@/lib/sun";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

const DAY_KEY = (date: string) => `mito-sunrise-missed:${date}`;
const SESSION_KEY = (date: string) => `mito-sunrise-session:${date}`;

type Props = {
  todayIso: string;
  /** Best multiplier today (1 = none) */
  sunriseMultiplier: number;
  allProtocols: Protocol[];
  sun: SunTimes | null;
  timeZone: string;
  onLogged?: (multiplier: number) => void;
};

/**
 * Daily morning-light accountability: pick a quality tier (2× / 1.5× / 1.25×).
 */
export function SunriseCheckIn({
  todayIso,
  sunriseMultiplier,
  allProtocols,
  sun,
  timeZone,
  onLogged,
}: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const tiersAvailable = useMemo(() => {
    const byId = new Map(allProtocols.map((p) => [p.id, p]));
    return SUNRISE_TIERS.map((tier) => ({
      tier,
      protocol: byId.get(tier.protocolId) ?? null,
    })).filter((x) => x.protocol != null) as {
      tier: SunriseTier;
      protocol: Protocol;
    }[];
  }, [allProtocols]);

  useEffect(() => {
    if (sunriseMultiplier > 1 || tiersAvailable.length === 0) {
      setOpen(false);
      return;
    }
    try {
      if (localStorage.getItem(DAY_KEY(todayIso)) === "1") {
        setOpen(false);
        return;
      }
      if (sessionStorage.getItem(SESSION_KEY(todayIso)) === "1") {
        setOpen(false);
        return;
      }
    } catch {
      /* private mode */
    }
    setOpen(true);
  }, [todayIso, sunriseMultiplier, tiersAvailable.length]);

  function dismissSession() {
    try {
      sessionStorage.setItem(SESSION_KEY(todayIso), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function dismissDay() {
    try {
      localStorage.setItem(DAY_KEY(todayIso), "1");
      sessionStorage.setItem(SESSION_KEY(todayIso), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function logTier(protocol: Protocol, tier: SunriseTier) {
    start(async () => {
      try {
        const res = await logCompletionAction(protocol.id);
        try {
          sessionStorage.setItem(SESSION_KEY(todayIso), "1");
          localStorage.removeItem(DAY_KEY(todayIso));
        } catch {
          /* ignore */
        }
        setOpen(false);
        const boost =
          res.sunriseMultiplier > 1
            ? ` · ${formatSunriseMultiplier(res.sunriseMultiplier)} day boost`
            : "";
        push(`${tier.shortLabel} · +${res.points} pts${boost}`);
        onLogged?.(res.sunriseMultiplier);
        router.refresh();
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not log", "err");
      }
    });
  }

  if (!open || tiersAvailable.length === 0) return null;

  const riseLabel = sun?.sunrise
    ? formatTimeInZone(sun.sunrise, timeZone)
    : null;

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
              Morning light — how did you do?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              First light sets the day. Pick the best description that fits —
              higher quality unlocks a stronger points boost on everything else
              you log today.
              {riseLabel ? (
                <>
                  {" "}
                  Local sunrise ≈{" "}
                  <span className="text-foreground">{riseLabel}</span>.
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          {tiersAvailable.map(({ tier, protocol }) => (
            <button
              key={tier.id}
              type="button"
              disabled={pending}
              onClick={() => logTier(protocol, tier)}
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
                  {formatSunriseMultiplier(tier.multiplier)} day
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

          <button
            type="button"
            disabled={pending}
            onClick={dismissSession}
            className="btn-secondary mt-1 h-11 rounded-2xl text-sm font-semibold"
          >
            Not yet — ask me later
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={dismissDay}
            className="h-10 rounded-2xl text-xs font-medium text-muted transition hover:text-foreground"
          >
            Missed it today — don&apos;t ask again until tomorrow
          </button>
        </div>
      </div>
    </div>
  );
}
