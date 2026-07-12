"use client";

import { Check, Flame, ListChecks } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import type { Protocol } from "@/db/schema";
import {
  logCompletionAction,
  removeOneCompletionAction,
} from "@/lib/actions/completions";
import { maxLogsPerDay } from "@/lib/scoring";
import { useToast } from "@/components/toast";
import { cn, formatPoints } from "@/lib/utils";

type Props = {
  /** Only activities on the user's available list */
  protocols: Protocol[];
  completionCounts: Record<string, number>;
  dayPoints: number;
  streak: { current: number; best: number };
  dateLabel: string;
};

/**
 * Daily checklist: flat list of available activities (no time-of-day buckets).
 */
export function ScheduleDay({
  protocols,
  completionCounts,
  dayPoints,
  streak,
  dateLabel,
}: Props) {
  const { push } = useToast();
  const [, start] = useTransition();
  const [counts, setCounts] = useOptimistic(
    completionCounts,
    (
      current: Record<string, number>,
      update: { protocolId: string; delta: number },
    ) => {
      const next = { ...current };
      const v = Math.max(0, (next[update.protocolId] ?? 0) + update.delta);
      if (v === 0) delete next[update.protocolId];
      else next[update.protocolId] = v;
      return next;
    },
  );

  const done = protocols.filter((p) => (counts[p.id] ?? 0) > 0).length;
  const total = protocols.length;

  function toggle(protocol: Protocol) {
    start(async () => {
      try {
        const count = counts[protocol.id] ?? 0;
        if (!protocol.allowsMultiple) {
          setCounts({ protocolId: protocol.id, delta: count > 0 ? -1 : 1 });
          const res = await logCompletionAction(protocol.id);
          if (res.action === "added") {
            const extra =
              res.streakBonus && res.streakBonus > 0
                ? ` · +${res.streakBonus} streak`
                : "";
            push(`Done · +${res.points} pts${extra}`);
          } else {
            push("Unchecked");
          }
          return;
        }
        if (count >= maxLogsPerDay(protocol)) {
          setCounts({ protocolId: protocol.id, delta: -1 });
          await removeOneCompletionAction(protocol.id);
          push("Removed one log");
          return;
        }
        setCounts({ protocolId: protocol.id, delta: 1 });
        const res = await logCompletionAction(protocol.id);
        if (res.action === "added") {
          push(`Logged · +${res.points} pts`);
        }
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not update", "err");
      }
    });
  }

  return (
    <div className="space-y-5">
      <DayStats
        dateLabel={dateLabel}
        points={dayPoints}
        streak={streak}
        done={done}
        total={total}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">Tap to mark done for today</p>
        <Link
          href="/activities"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
        >
          <ListChecks className="h-3.5 w-3.5" />
          Edit available
        </Link>
      </div>

      {protocols.length === 0 ? (
        <div className="glass rounded-3xl border border-dashed border-border p-6 text-center">
          <p className="font-medium">No activities selected</p>
          <p className="mt-2 text-sm text-muted">
            Choose what you can actually do (equipment, access, preference).
            Only those show up here as today&apos;s checklist.
          </p>
          <Link
            href="/activities"
            className="btn-primary mt-4 inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold"
          >
            Pick available activities
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {protocols.map((p) => {
            const count = counts[p.id] ?? 0;
            const isDone = count > 0;
            const max = maxLogsPerDay(p);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggle(p)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition",
                    isDone
                      ? "border-accent/40 bg-accent/10"
                      : "border-border bg-card hover:border-accent/30",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                      isDone
                        ? "border-accent/50 bg-accent text-[#041016]"
                        : "border-border text-muted",
                    )}
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block font-medium leading-snug",
                        isDone && "text-accent",
                      )}
                    >
                      {p.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {p.points} pts
                      {p.allowsMultiple
                        ? ` · ${count}/${max} today`
                        : isDone
                          ? " · done"
                          : " · tap to complete"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {protocols.length > 0 && (
        <p className="text-center text-xs text-muted">
          Missing something?{" "}
          <Link href="/activities" className="text-accent hover:underline">
            Update available activities
          </Link>
        </p>
      )}
    </div>
  );
}

function DayStats({
  dateLabel,
  points,
  streak,
  done,
  total,
}: {
  dateLabel: string;
  points: number;
  streak: { current: number; best: number };
  done: number;
  total: number;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-accent">
        Daily checklist
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        {dateLabel}
      </h1>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-foreground/[0.03] px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted">
            Points
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">
            {formatPoints(points)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-foreground/[0.03] px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted">
            Done
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">
            {total > 0 ? `${done}/${total}` : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-foreground/[0.03] px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted">
            Streak
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
            {streak.current > 0 && (
              <Flame className="h-3.5 w-3.5 text-accent-2" />
            )}
            {streak.current}d
          </p>
        </div>
      </div>
    </div>
  );
}
