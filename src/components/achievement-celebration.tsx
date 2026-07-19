"use client";

import { Award, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { acknowledgeCelebrationsAction } from "@/lib/actions/achievements";
import {
  celebrationHeadline,
  type PendingCelebrations,
} from "@/lib/achievements";
import { formatLevelLabel } from "@/lib/levels";
import { cn } from "@/lib/utils";

type Props = {
  pending: PendingCelebrations;
  /** Hold closed (e.g. while first-run tutorial is active). */
  paused?: boolean;
  onDone: () => void;
};

/**
 * Morning celebration for newly reached levels / streak badges.
 * Shown before sunrise check-in on the next app open after earning.
 */
export function AchievementCelebration({
  pending,
  paused = false,
  onDone,
}: Props) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pendingAck, startAck] = useTransition();

  const hasItems = pending.level != null || pending.badges.length > 0;

  useEffect(() => {
    if (paused || !hasItems) {
      setOpen(false);
      setVisible(false);
      return;
    }
    setOpen(true);
    const t = window.setTimeout(() => setVisible(true), 30);
    return () => window.clearTimeout(t);
  }, [paused, hasItems, pending.level, pending.badges.length]);

  function dismiss() {
    setVisible(false);
    startAck(async () => {
      try {
        await acknowledgeCelebrationsAction({
          level: pending.level,
          badgeKeys: pending.badges.map((b) => b.key),
        });
      } catch {
        /* still continue so sunrise is not blocked */
      }
      setOpen(false);
      onDone();
    });
  }

  if (!open || !hasItems) return null;

  const headline = celebrationHeadline(pending);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[130] flex items-end justify-center bg-black/60 p-4 sm:items-center",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-celebration-title"
    >
      <div
        className={cn(
          "achievement-pop glass relative w-full max-w-sm overflow-hidden rounded-3xl p-6 text-center",
          visible && "achievement-pop-in",
        )}
      >
        <div className="achievement-burst pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent">
          {pending.level != null ? (
            <Trophy className="achievement-icon h-8 w-8" strokeWidth={2} />
          ) : (
            <Award className="achievement-icon h-8 w-8" strokeWidth={2} />
          )}
        </div>

        <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          Nice work
        </p>
        <h2
          id="achievement-celebration-title"
          className="mt-1.5 text-2xl font-semibold tracking-tight"
        >
          {headline}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {pending.level != null && pending.badges.length > 0
            ? "You leveled up and unlocked a streak badge."
            : pending.level != null
              ? `You reached ${formatLevelLabel(pending.level)}.`
              : pending.badges.length === 1
                ? pending.badges[0]!.description
                : "You unlocked new streak milestones."}
        </p>

        <ul className="mt-5 space-y-2 text-left">
          {pending.level != null ? (
            <li className="achievement-item flex items-center gap-3 rounded-2xl border border-accent/35 bg-accent/10 px-3.5 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-on-accent">
                {pending.level}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {formatLevelLabel(pending.level)}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  Lifetime points milestone
                </span>
              </span>
            </li>
          ) : null}
          {pending.badges.map((b, i) => (
            <li
              key={b.key}
              className="achievement-item flex items-center gap-3 rounded-2xl border border-border bg-foreground/[0.03] px-3.5 py-3"
              style={{ animationDelay: `${120 + i * 80}ms` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent/15 text-accent">
                <Award className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{b.label}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {b.days}-day streak · kept forever
                </span>
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={pendingAck}
          onClick={dismiss}
          className="btn-primary mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold disabled:opacity-60"
        >
          {pendingAck ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
