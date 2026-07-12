"use client";

import {
  CloudSun,
  Lock,
  Minus,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import type { Protocol, TimeOfDay } from "@/db/schema";
import {
  logCompletionAction,
  removeOneCompletionAction,
} from "@/lib/actions/completions";
import type { ScheduleEntry } from "@/lib/schedule";
import { TIME_OF_DAY_META, TIME_OF_DAY_ORDER } from "@/lib/time-of-day";
import { cn, formatPoints } from "@/lib/utils";

const ICONS = {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Sparkles,
} as const;

type Props = {
  entries: ScheduleEntry[];
  completionCounts: Record<string, number>;
  dayPoints: number;
};

export function DayBoard({ entries, completionCounts, dayPoints }: Props) {
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
  const [, startTransition] = useTransition();

  const byTime = new Map<TimeOfDay, ScheduleEntry[]>();
  for (const tod of TIME_OF_DAY_ORDER) byTime.set(tod, []);
  for (const e of entries) byTime.get(e.timeOfDay)?.push(e);

  const points = entries.reduce((sum, e) => {
    const n = counts[e.protocol.id] ?? 0;
    return sum + n * e.protocol.points;
  }, 0);

  // unique protocols logged
  const loggedUnique = Object.keys(counts).filter((id) => (counts[id] ?? 0) > 0)
    .length;
  const totalUnique = new Set(entries.map((e) => e.protocol.id)).size;
  const logEvents = Object.values(counts).reduce((a, b) => a + b, 0);

  function log(protocol: Protocol, timeOfDay: TimeOfDay) {
    startTransition(async () => {
      if (protocol.allowsMultiple) {
        setCounts({ protocolId: protocol.id, delta: 1 });
        await logCompletionAction(protocol.id, timeOfDay);
      } else {
        const has = (counts[protocol.id] ?? 0) > 0;
        setCounts({ protocolId: protocol.id, delta: has ? -1 : 1 });
        await logCompletionAction(protocol.id, timeOfDay);
      }
    });
  }

  function unlog(protocol: Protocol) {
    startTransition(async () => {
      setCounts({ protocolId: protocol.id, delta: -1 });
      await removeOneCompletionAction(protocol.id);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Today's points" value={formatPoints(points)} hint={`base ${formatPoints(dayPoints)}`} />
        <Stat
          label="Activities logged"
          value={`${loggedUnique}/${totalUnique}`}
          hint={`${logEvents} log event${logEvents === 1 ? "" : "s"}`}
        />
        <Stat
          label="Schedule"
          value={`${entries.length}`}
          hint={
            <Link href="/schedule" className="text-accent underline-offset-2 hover:underline">
              Edit time-of-day setup
            </Link>
          }
        />
      </div>

      {entries.length === 0 ? (
        <div className="glass rounded-3xl px-6 py-12 text-center">
          <p className="text-sm text-muted">
            Your day is empty. Add activities to each time of day.
          </p>
          <Link
            href="/schedule"
            className="btn-primary mt-4 inline-flex h-11 items-center rounded-2xl px-5 text-sm font-semibold"
          >
            Set up schedule
          </Link>
        </div>
      ) : (
        TIME_OF_DAY_ORDER.map((tod) => {
          const items = byTime.get(tod) ?? [];
          if (items.length === 0) return null;
          const meta = TIME_OF_DAY_META[tod];
          const Icon = ICONS[meta.icon as keyof typeof ICONS] ?? Sparkles;
          return (
            <section
              key={tod}
              className={cn(
                "glass overflow-hidden rounded-3xl border bg-gradient-to-br p-4 sm:p-5",
                meta.accent,
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-foreground/5 p-2">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      {meta.label}
                    </h2>
                    <p className="text-sm text-muted">{meta.blurb}</p>
                  </div>
                </div>
                <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-muted">
                  {items.length}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((entry) => (
                  <ActivityCard
                    key={entry.scheduleId}
                    protocol={entry.protocol}
                    timeOfDay={entry.timeOfDay}
                    count={counts[entry.protocol.id] ?? 0}
                    onLog={() => log(entry.protocol, entry.timeOfDay)}
                    onUnlog={() => unlog(entry.protocol)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-1 text-xs text-muted">{hint}</div>
    </div>
  );
}

function ActivityCard({
  protocol,
  timeOfDay,
  count,
  onLog,
  onUnlog,
}: {
  protocol: Protocol;
  timeOfDay: TimeOfDay;
  count: number;
  onLog: () => void;
  onUnlog: () => void;
}) {
  const done = count > 0;
  const multi = protocol.allowsMultiple;
  const locked = protocol.lockedTimeOfDay;

  return (
    <div
      className={cn(
        "protocol-card rounded-2xl border border-border bg-foreground/[0.04] p-3",
        done && "completed",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4
              className={cn(
                "text-sm font-medium leading-snug",
                done && "text-accent",
              )}
            >
              {protocol.name}
            </h4>
            {locked && (
              <span
                className="inline-flex items-center gap-0.5 rounded-full bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted"
                title={`Locked to ${locked}`}
              >
                <Lock className="h-2.5 w-2.5" />
                {locked}
              </span>
            )}
            {multi && (
              <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                multi
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {protocol.description}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent-2/15 px-2 py-0.5 text-xs font-semibold text-accent-2">
          +{protocol.points}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {multi ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onUnlog}
              disabled={count === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-foreground/5 disabled:opacity-30"
              aria-label="Remove one log"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2ch] text-center text-sm font-semibold tabular-nums">
              {count}
            </span>
            <button
              type="button"
              onClick={onLog}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-[#041016] transition hover:brightness-110"
              aria-label="Log once"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted">logs today</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLog}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition",
              done
                ? "border-accent/50 bg-accent/15 text-accent"
                : "border-border text-foreground hover:bg-foreground/5",
            )}
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
                done
                  ? "border-accent bg-accent text-[#041016]"
                  : "border-border text-transparent",
              )}
            >
              <Check className="h-3 w-3" />
            </span>
            {done ? "Done" : "Mark done"}
          </button>
        )}
        <span className="text-[10px] uppercase tracking-wider text-muted">
          {timeOfDay}
        </span>
      </div>
    </div>
  );
}
