"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Protocol } from "@/db/schema";
import { SunriseKeystoneDialog } from "@/components/sunrise-keystone-dialog";
import { logCompletionAction } from "@/lib/actions/completions";
import {
  formatSunriseMultiplier,
  type SunriseModifiers,
  type SunriseTier,
} from "@/lib/scoring";
import type { SunTimes } from "@/lib/sun";
import { useToast } from "@/components/toast";

const dayKey = (userId: string, date: string) =>
  `mito-sunrise-missed:${userId}:${date}`;
const sessionKey = (userId: string, date: string) =>
  `mito-sunrise-session:${userId}:${date}`;

/** Legacy keys (pre–per-user) — cleared so a new account is not blocked. */
const legacyDayKey = (date: string) => `mito-sunrise-missed:${date}`;
const legacySessionKey = (date: string) => `mito-sunrise-session:${date}`;

type Props = {
  userId: string;
  todayIso: string;
  /** Best multiplier today (1 = none) */
  sunriseMultiplier: number;
  /** Server truth — keystone logged today even when boost is exactly 1× */
  morningLightLogged?: boolean;
  allProtocols: Protocol[];
  sun: SunTimes | null;
  timeZone: string;
  /** After onboarding — show even if this browser dismissed for another user */
  forceOpen?: boolean;
  /** Hold closed (e.g. while the first-run tour is active). */
  paused?: boolean;
  onLogged?: (multiplier: number) => void;
};

/**
 * Daily morning-light accountability with tier + modifier questions.
 */
export function SunriseCheckIn({
  userId,
  todayIso,
  sunriseMultiplier,
  morningLightLogged = false,
  allProtocols,
  sun,
  timeZone,
  forceOpen = false,
  paused = false,
  onLogged,
}: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem(legacyDayKey(todayIso));
      sessionStorage.removeItem(legacySessionKey(todayIso));
    } catch {
      /* private mode */
    }
  }, [todayIso]);

  useEffect(() => {
    if (paused) {
      setOpen(false);
      return;
    }
    if (morningLightLogged || sunriseMultiplier > 1) {
      setOpen(false);
      return;
    }
    if (forceOpen) {
      setOpen(true);
      return;
    }
    try {
      if (localStorage.getItem(dayKey(userId, todayIso)) === "1") {
        setOpen(false);
        return;
      }
      if (sessionStorage.getItem(sessionKey(userId, todayIso)) === "1") {
        setOpen(false);
        return;
      }
    } catch {
      /* private mode */
    }
    setOpen(true);
  }, [
    userId,
    todayIso,
    sunriseMultiplier,
    morningLightLogged,
    forceOpen,
    paused,
  ]);

  function dismissSession() {
    try {
      sessionStorage.setItem(sessionKey(userId, todayIso), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function dismissDay() {
    try {
      localStorage.setItem(dayKey(userId, todayIso), "1");
      sessionStorage.setItem(sessionKey(userId, todayIso), "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function logTier(
    protocol: Protocol,
    tier: SunriseTier,
    modifiers: SunriseModifiers,
    viewedAtStartIso: string,
    viewedAtEndIso: string,
  ) {
    start(async () => {
      try {
        const res = await logCompletionAction(protocol.id, {
          sunriseModifiers: modifiers,
          viewedAtStart: viewedAtStartIso,
          viewedAtEnd: viewedAtEndIso,
        });
        try {
          sessionStorage.setItem(sessionKey(userId, todayIso), "1");
          localStorage.removeItem(dayKey(userId, todayIso));
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

  if (!open) return null;

  return (
    <SunriseKeystoneDialog
      todayIso={todayIso}
      allProtocols={allProtocols}
      sun={sun}
      timeZone={timeZone}
      pending={pending}
      onLog={logTier}
      onDismissSession={dismissSession}
      onDismissDay={dismissDay}
    />
  );
}
