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
 * Daily morning-light accountability with tier + modifier questions.
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

  useEffect(() => {
    if (sunriseMultiplier > 1) {
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
  }, [todayIso, sunriseMultiplier]);

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

  function logTier(
    protocol: Protocol,
    tier: SunriseTier,
    modifiers: SunriseModifiers,
  ) {
    start(async () => {
      try {
        const res = await logCompletionAction(protocol.id, { sunriseModifiers: modifiers });
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
