"use client";

import { Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Protocol } from "@/db/schema";
import { logCompletionAction } from "@/lib/actions/completions";
import { isSunriseProtocol, SUNRISE_MULTIPLIER } from "@/lib/scoring";
import { formatTimeInZone, type SunTimes } from "@/lib/sun";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

const DAY_KEY = (date: string) => `mito-sunrise-missed:${date}`;
const SESSION_KEY = (date: string) => `mito-sunrise-session:${date}`;

type Props = {
  /** User's calendar day YYYY-MM-DD */
  todayIso: string;
  sunriseBuffActive: boolean;
  allProtocols: Protocol[];
  sun: SunTimes | null;
  timeZone: string;
  /** Called after a successful Yes log so parent can refresh buff UI */
  onLogged?: () => void;
};

/**
 * Daily sunrise accountability prompt.
 * - Resets each calendar day.
 * - Every app open until sunrise is logged, or user marks "missed today".
 * - "Not yet" only dismisses this browser session.
 */
export function SunriseCheckIn({
  todayIso,
  sunriseBuffActive,
  allProtocols,
  sun,
  timeZone,
  onLogged,
}: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  const sunriseProtocol =
    allProtocols.find((p) => p.id === "sunrise-grounding") ??
    allProtocols.find((p) => isSunriseProtocol(p)) ??
    null;

  useEffect(() => {
    if (sunriseBuffActive || !sunriseProtocol) {
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
  }, [todayIso, sunriseBuffActive, sunriseProtocol]);

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

  function logYes() {
    if (!sunriseProtocol) return;
    start(async () => {
      try {
        const res = await logCompletionAction(sunriseProtocol.id);
        try {
          sessionStorage.setItem(SESSION_KEY(todayIso), "1");
          localStorage.removeItem(DAY_KEY(todayIso));
        } catch {
          /* ignore */
        }
        setOpen(false);
        const buff =
          res.sunriseBuffActive
            ? ` · ${SUNRISE_MULTIPLIER}× on other activities today`
            : "";
        push(`Sunrise logged · +${res.points} pts${buff}`);
        onLogged?.();
        router.refresh();
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not log", "err");
      }
    });
  }

  if (!open || !sunriseProtocol) return null;

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
              Did you see the sunrise today?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              First light is the highest-leverage signal of the day. Logging it
              earns base points and unlocks{" "}
              <strong className="text-foreground">
                {SUNRISE_MULTIPLIER}×
              </strong>{" "}
              on everything else you log today.
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
          <button
            type="button"
            disabled={pending}
            onClick={logYes}
            className="btn-primary h-12 rounded-2xl text-sm font-semibold disabled:opacity-60"
          >
            {pending
              ? "Logging…"
              : `Yes — log “${sunriseProtocol.name}” (+${sunriseProtocol.points})`}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={dismissSession}
            className="btn-secondary h-11 rounded-2xl text-sm font-semibold"
          >
            Not yet — ask me later
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={dismissDay}
            className={cn(
              "h-10 rounded-2xl text-xs font-medium text-muted transition hover:text-foreground",
            )}
          >
            Missed it today — don&apos;t ask again until tomorrow
          </button>
        </div>
      </div>
    </div>
  );
}
