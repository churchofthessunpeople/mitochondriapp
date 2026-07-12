"use client";

import { Check, Flame, Minus, Plus, Timer, X } from "lucide-react";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { Protocol } from "@/db/schema";
import {
  logCompletionAction,
  removeOneCompletionAction,
} from "@/lib/actions/completions";
import { orderProtocolsForNow } from "@/lib/checklist-order";
import {
  isSunriseProtocol,
  maxLogsPerDay,
  pointsForLog,
  SUNRISE_MULTIPLIER,
} from "@/lib/scoring";
import type { WeeklySummary } from "@/lib/weekly";
import { useToast } from "@/components/toast";
import { cn, formatPoints } from "@/lib/utils";

type Phase = "night" | "sunrise" | "day" | "sunset";

type Props = {
  protocols: Protocol[];
  completionCounts: Record<string, number>;
  dayPoints: number;
  streak: { current: number; best: number };
  dateLabel: string;
  onExpandCatalog?: () => void;
  phase?: Phase;
  localHour?: number;
  seasonLine?: string | null;
  weekly?: WeeklySummary | null;
  /** Server: at least one sunrise protocol logged today */
  sunriseBuffActive?: boolean;
  onStatsChange?: (s: {
    dayPoints: number;
    streak: { current: number; best: number };
  }) => void;
};

export function ScheduleDay({
  protocols,
  completionCounts,
  dayPoints: initialPoints,
  streak: initialStreak,
  dateLabel,
  onExpandCatalog,
  hideTitle = false,
  phase = "day",
  localHour = 12,
  seasonLine,
  weekly,
  sunriseBuffActive: initialSunriseBuff = false,
  onStatsChange,
}: Props) {
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [dayPoints, setDayPoints] = useState(initialPoints);
  const [streak, setStreak] = useState(initialStreak);
  const [sunriseBuff, setSunriseBuff] = useState(initialSunriseBuff);
  const [durationFor, setDurationFor] = useState<Protocol | null>(null);
  const [durationMins, setDurationMins] = useState(15);

  const [counts, setCounts] = useOptimistic(
    completionCounts,
    (
      current: Record<string, number>,
      update: { protocolId: string; delta: number; absolute?: number },
    ) => {
      const next = { ...current };
      if (update.absolute != null) {
        if (update.absolute <= 0) delete next[update.protocolId];
        else next[update.protocolId] = update.absolute;
        return next;
      }
      const v = Math.max(0, (next[update.protocolId] ?? 0) + update.delta);
      if (v === 0) delete next[update.protocolId];
      else next[update.protocolId] = v;
      return next;
    },
  );

  const { suggested, rest } = useMemo(
    () =>
      orderProtocolsForNow(protocols, {
        phase,
        localHour,
        completionCounts: counts,
      }),
    [protocols, phase, localHour, counts],
  );

  const done = protocols.filter((p) => (counts[p.id] ?? 0) > 0).length;
  const total = protocols.length;

  function applySnap(snap: {
    dayPoints: number;
    streak: { current: number; best: number };
    count?: number;
    protocolId?: string;
    sunriseBuffActive?: boolean;
  }) {
    setDayPoints(snap.dayPoints);
    setStreak(snap.streak);
    if (snap.sunriseBuffActive != null) setSunriseBuff(snap.sunriseBuffActive);
    onStatsChange?.({ dayPoints: snap.dayPoints, streak: snap.streak });
    if (snap.protocolId != null && snap.count != null) {
      setCounts({
        protocolId: snap.protocolId,
        delta: 0,
        absolute: snap.count,
      });
    }
  }

  function protocolHint(p: Protocol): string {
    const max = maxLogsPerDay(p);
    const sunrise = isSunriseProtocol(p);
    const base = sunrise
      ? p.points
      : pointsForLog(p, null, { sunriseBuffActive: sunriseBuff });
    const parts: string[] = [
      sunrise
        ? `${p.points} pts · unlocks ${SUNRISE_MULTIPLIER}× day`
        : sunriseBuff
          ? `${base} pts (${SUNRISE_MULTIPLIER}×)`
          : `${p.points} pts`,
    ];
    if (p.allowsMultiple) parts.push(`up to ${max}×`);
    if (p.durationEnabled) {
      parts.push(`scales ~${p.referenceMinutes} min`);
    }
    return parts.join(" · ");
  }

  function toggleSingle(protocol: Protocol) {
    if (protocol.durationEnabled && (counts[protocol.id] ?? 0) === 0) {
      setDurationFor(protocol);
      setDurationMins(protocol.referenceMinutes || 15);
      return;
    }
    start(async () => {
      try {
        const count = counts[protocol.id] ?? 0;
        setCounts({ protocolId: protocol.id, delta: count > 0 ? -1 : 1 });
        const res = await logCompletionAction(protocol.id);
        applySnap({ ...res, protocolId: protocol.id });
        if (res.action === "added") {
          const extra =
            res.streakBonus && res.streakBonus > 0
              ? ` · +${res.streakBonus} streak`
              : "";
          const buff =
            isSunriseProtocol(protocol) && res.sunriseBuffActive
              ? ` · ${SUNRISE_MULTIPLIER}× on other activities today`
              : "";
          push(`Done · +${res.points} pts${extra}${buff}`);
        } else {
          push("Unchecked");
        }
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not update", "err");
      }
    });
  }

  function addOne(protocol: Protocol, durationMinutes?: number) {
    start(async () => {
      try {
        const count = counts[protocol.id] ?? 0;
        const max = maxLogsPerDay(protocol);
        if (count >= max) {
          push(`Daily limit (${max}×) reached.`, "err");
          return;
        }
        if (protocol.durationEnabled && durationMinutes == null) {
          setDurationFor(protocol);
          setDurationMins(protocol.referenceMinutes || 15);
          return;
        }
        setCounts({ protocolId: protocol.id, delta: 1 });
        const res = await logCompletionAction(protocol.id, {
          durationMinutes,
        });
        applySnap({ ...res, protocolId: protocol.id });
        if (res.action === "added") {
          const extra =
            res.streakBonus && res.streakBonus > 0
              ? ` · +${res.streakBonus} streak`
              : "";
          push(`+1 · +${res.points} pts${extra}`);
        }
        setDurationFor(null);
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not log", "err");
      }
    });
  }

  function removeOne(protocol: Protocol) {
    start(async () => {
      try {
        const count = counts[protocol.id] ?? 0;
        if (count <= 0) return;
        setCounts({ protocolId: protocol.id, delta: -1 });
        const res = await removeOneCompletionAction(protocol.id);
        applySnap({ ...res, protocolId: protocol.id });
        push("−1 removed");
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not remove", "err");
      }
    });
  }

  function renderRow(p: Protocol) {
    const count = counts[p.id] ?? 0;
    const isDone = count > 0;
    const max = maxLogsPerDay(p);
    const multi = p.allowsMultiple;

    if (multi) {
      return (
        <li
          key={p.id}
          className={cn(
            "flex items-center gap-3 rounded-2xl border px-3.5 py-3",
            isDone ? "border-accent/40 bg-accent/10" : "border-border bg-card",
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border tabular-nums text-sm font-semibold",
              isDone
                ? "border-accent/50 bg-accent text-on-accent"
                : "border-border text-muted",
            )}
          >
            {count}
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
              {protocolHint(p)} · {count}/{max} today
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              disabled={pending || count <= 0}
              onClick={() => removeOne(p)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted transition hover:border-red-400/40 hover:text-red-400 disabled:opacity-35"
              aria-label={`Remove one ${p.name}`}
            >
              <Minus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              disabled={pending || count >= max}
              onClick={() => addOne(p)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/15 text-accent transition hover:bg-accent/25 disabled:opacity-35"
              aria-label={`Add one ${p.name}`}
            >
              {p.durationEnabled ? (
                <Timer className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </li>
      );
    }

    return (
      <li key={p.id}>
        <button
          type="button"
          disabled={pending}
          onClick={() => toggleSingle(p)}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition disabled:opacity-60",
            isDone
              ? "border-accent/40 bg-accent/10"
              : "border-border bg-card hover:border-accent/30",
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
              isDone
                ? "border-accent/50 bg-accent text-on-accent"
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
              {protocolHint(p)}
              {isDone ? " · done" : p.durationEnabled ? " · set minutes" : ""}
            </span>
          </span>
        </button>
      </li>
    );
  }

  return (
    <div className="space-y-5">
      <DayStats
        dateLabel={dateLabel}
        points={dayPoints}
        streak={streak}
        done={done}
        total={total}
        hideTitle={hideTitle}
      />

      {sunriseBuff ? (
        <p className="rounded-2xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-xs leading-relaxed text-accent">
          <span className="font-semibold">Sunrise buff active · </span>
          Other activities earn {SUNRISE_MULTIPLIER}× points today. Sunrise
          logs keep their base value.
        </p>
      ) : (
        protocols.some(isSunriseProtocol) && (
          <p className="rounded-2xl border border-border px-3.5 py-2.5 text-xs leading-relaxed text-muted">
            <span className="font-medium text-foreground">Tip · </span>
            Complete a sunrise activity to unlock {SUNRISE_MULTIPLIER}× on
            everything else today.
          </p>
        )
      )}

      {seasonLine && (
        <p className="rounded-2xl border border-accent/20 bg-accent/5 px-3.5 py-2.5 text-xs leading-relaxed text-muted">
          <span className="font-medium text-foreground">Season · </span>
          {seasonLine}
        </p>
      )}

      {weekly && (weekly.daysActive > 0 || weekly.lightLogs > 0) && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl border border-border px-2 py-2">
            <p className="text-[10px] uppercase text-muted">7d active</p>
            <p className="text-sm font-semibold tabular-nums">
              {weekly.daysActive}d
            </p>
          </div>
          <div className="rounded-2xl border border-border px-2 py-2">
            <p className="text-[10px] uppercase text-muted">7d pts</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatPoints(weekly.totalPoints)}
            </p>
          </div>
          <div className="rounded-2xl border border-border px-2 py-2">
            <p className="text-[10px] uppercase text-muted">Light logs</p>
            <p className="text-sm font-semibold tabular-nums text-accent">
              {weekly.lightLogs}
            </p>
          </div>
        </div>
      )}

      <p className="text-sm text-muted">
        Your activities · suggested for this sun phase first
      </p>

      {protocols.length === 0 ? (
        <div className="glass rounded-3xl border border-dashed border-border p-6 text-center">
          <p className="font-medium">No activities on your list yet</p>
          <p className="mt-2 text-sm text-muted">
            Expand the catalog below and toggle what you can actually do.
          </p>
          {onExpandCatalog && (
            <button
              type="button"
              onClick={onExpandCatalog}
              className="btn-primary mt-4 inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold"
            >
              Browse catalog
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {suggested.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
                Suggested now
              </h2>
              <ul className="space-y-2">{suggested.map(renderRow)}</ul>
            </section>
          )}
          {rest.length > 0 && (
            <section className="space-y-2">
              {suggested.length > 0 && (
                <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Rest of your list
                </h2>
              )}
              <ul className="space-y-2">{rest.map(renderRow)}</ul>
            </section>
          )}
        </div>
      )}

      {durationFor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="glass w-full max-w-sm rounded-3xl p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{durationFor.name}</p>
                <p className="mt-1 text-xs text-muted">
                  Points scale with minutes (base {durationFor.points} pts @{" "}
                  {durationFor.referenceMinutes} min)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDurationFor(null)}
                className="rounded-lg p-1 text-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                durationFor.referenceMinutes,
                Math.round(durationFor.referenceMinutes * 1.5),
                durationFor.maxDurationMinutes,
              ]
                .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
                .map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMins(m)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm",
                      durationMins === m
                        ? "bg-accent text-on-accent"
                        : "border border-border text-muted",
                    )}
                  >
                    {m} min
                  </button>
                ))}
            </div>
            <label className="mt-4 block text-xs text-muted">
              Minutes
              <input
                type="number"
                min={1}
                max={durationFor.maxDurationMinutes}
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value) || 1)}
                className="field-input mt-1 w-full rounded-xl px-3 py-2 text-sm"
              />
            </label>
            <p className="mt-2 text-xs text-accent">
              ≈{" "}
              {pointsForLog(durationFor, durationMins, {
                sunriseBuffActive:
                  sunriseBuff && !isSunriseProtocol(durationFor),
              })}{" "}
              pts this log
              {sunriseBuff && !isSunriseProtocol(durationFor)
                ? ` (${SUNRISE_MULTIPLIER}× sunrise)`
                : ""}
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={() => addOne(durationFor, durationMins)}
              className="btn-primary mt-4 h-11 w-full rounded-2xl text-sm font-semibold"
            >
              Log {durationMins} min
            </button>
          </div>
        </div>
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
  hideTitle,
}: {
  dateLabel: string;
  points: number;
  streak: { current: number; best: number };
  done: number;
  total: number;
  hideTitle?: boolean;
}) {
  return (
    <div>
      {!hideTitle && (
        <>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Daily checklist
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {dateLabel}
          </h1>
        </>
      )}
      <div className={cn("grid grid-cols-3 gap-2", !hideTitle && "mt-4")}>
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
