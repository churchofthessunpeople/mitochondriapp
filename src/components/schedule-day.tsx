"use client";

import { Check, Flame, Minus, Plus, Timer, X } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import type { Protocol } from "@/db/schema";
import {
  ProtocolHowToButton,
  ProtocolHowToDialog,
} from "@/components/protocol-how-to-dialog";
import {
  logCompletionAction,
  logPermanentTonightAction,
  removeOneCompletionAction,
} from "@/lib/actions/completions";
import { orderProtocolsForNow } from "@/lib/checklist-order";
import {
  isMagnetismKeystoneId,
  isWaterKeystoneId,
} from "@/lib/lwm";
import { SunriseKeystoneDialog } from "@/components/sunrise-keystone-dialog";
import { isPermanentProtocolId } from "@/lib/permanent-activities";
import {
  DURATION_BLOCK_MINUTES,
  formatSunriseMultiplier,
  isSunriseKeystoneProtocol,
  pointsForLog,
  type SunriseModifiers,
  type SunriseTier,
} from "@/lib/scoring";
import type { WeeklySummary } from "@/lib/weekly";
import type { SunTimes } from "@/lib/sun";
import { useToast } from "@/components/toast";
import { cn, formatPoints } from "@/lib/utils";

type Phase = "night" | "sunrise" | "day" | "sunset";

type Props = {
  protocols: Protocol[];
  completionCounts: Record<string, number>;
  completionDurations?: Record<string, number>;
  dayPoints: number;
  streak: { current: number; best: number };
  dateLabel: string;
  /** Hide stats, tips, and weekly summary — activity list only */
  compact?: boolean;
  onExpandCatalog?: () => void;
  /** Hide duplicate date title when parent already shows it */
  hideTitle?: boolean;
  phase?: Phase;
  localHour?: number;
  seasonLine?: string | null;
  weekly?: WeeklySummary | null;
  /** Best morning-light multiplier for the day (1 = none) */
  sunriseMultiplier?: number;
  sunriseTierLabel?: string | null;
  sun?: SunTimes | null;
  timeZone?: string;
  allProtocols?: Protocol[];
  onStatsChange?: (s: {
    dayPoints: number;
    streak: { current: number; best: number };
    sunriseMultiplier?: number;
    sunriseTierLabel?: string | null;
  }) => void;
  /** Live checklist counts for L·W·M strip */
  onCompletionCountsChange?: (counts: Record<string, number>) => void;
  onCompletionDurationsChange?: (durations: Record<string, number>) => void;
};

export function ScheduleDay({
  protocols,
  completionCounts,
  completionDurations = {},
  dayPoints: initialPoints,
  streak: initialStreak,
  dateLabel,
  hideTitle = false,
  onExpandCatalog,
  compact = false,
  phase = "day",
  localHour = 12,
  seasonLine,
  weekly,
  sunriseMultiplier: initialMult = 1,
  sunriseTierLabel: initialTierLabel = null,
  sun = null,
  timeZone = "UTC",
  allProtocols,
  onStatsChange,
  onCompletionCountsChange,
  onCompletionDurationsChange,
}: Props) {
  const { push } = useToast();
  const [, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dayPoints, setDayPoints] = useState(initialPoints);
  const [streak, setStreak] = useState(initialStreak);
  const [sunriseMult, setSunriseMult] = useState(initialMult);
  const [sunriseTierLabel, setSunriseTierLabel] = useState(initialTierLabel);
  const [durationFor, setDurationFor] = useState<Protocol | null>(null);
  const [howToFor, setHowToFor] = useState<Protocol | null>(null);
  const [durationMins, setDurationMins] = useState(15);
  const [sunriseKeystoneFor, setSunriseKeystoneFor] = useState<Protocol | null>(
    null,
  );

  // Local state (not useOptimistic) so UI doesn't snap back when the
  // transition ends before any RSC refresh.
  const [counts, setCounts] = useState(completionCounts);
  const [durations, setDurations] = useState(completionDurations);
  const countsRef = useRef(counts);
  const durationsRef = useRef(durations);
  countsRef.current = counts;
  durationsRef.current = durations;

  function bumpDurations(update: {
    protocolId: string;
    delta: number;
    absolute?: number;
  }) {
    const next = applyCountUpdate(durationsRef.current, update);
    durationsRef.current = next;
    setDurations(next);
    onCompletionDurationsChange?.(next);
  }

  /** Update counts and notify parent (never inside a setState updater). */
  function bumpCounts(update: {
    protocolId: string;
    delta: number;
    absolute?: number;
  }) {
    const next = applyCountUpdate(countsRef.current, update);
    countsRef.current = next;
    setCounts(next);
    onCompletionCountsChange?.(next);
  }

  function runLog(protocolId: string, fn: () => Promise<void>) {
    setBusyId(protocolId);
    start(async () => {
      try {
        await fn();
      } finally {
        setBusyId(null);
      }
    });
  }

  const { suggested, rest } = useMemo(() => {
    const manual = protocols.filter((p) => !isPermanentProtocolId(p.id));
    return orderProtocolsForNow(manual, {
      phase,
      localHour,
      completionCounts: counts,
    });
  }, [protocols, phase, localHour, counts]);

  const permanentProtocols = useMemo(
    () => protocols.filter((p) => isPermanentProtocolId(p.id)),
    [protocols],
  );

  function applySnap(snap: {
    dayPoints: number;
    streak: { current: number; best: number };
    count?: number;
    durationMinutesTotal?: number;
    protocolId?: string;
    sunriseMultiplier?: number;
    sunriseTierLabel?: string | null;
  }) {
    setDayPoints(snap.dayPoints);
    setStreak(snap.streak);
    if (snap.sunriseMultiplier != null) setSunriseMult(snap.sunriseMultiplier);
    if (snap.sunriseTierLabel !== undefined) {
      setSunriseTierLabel(snap.sunriseTierLabel);
    }
    onStatsChange?.({
      dayPoints: snap.dayPoints,
      streak: snap.streak,
      sunriseMultiplier: snap.sunriseMultiplier,
      sunriseTierLabel: snap.sunriseTierLabel,
    });
    if (snap.protocolId != null && snap.count != null) {
      bumpCounts({
        protocolId: snap.protocolId,
        delta: 0,
        absolute: snap.count,
      });
    }
    if (snap.protocolId != null && snap.durationMinutesTotal != null) {
      bumpDurations({
        protocolId: snap.protocolId,
        delta: 0,
        absolute: snap.durationMinutesTotal,
      });
    }
  }

  function protocolHint(p: Protocol): string {
    const parts: string[] = [`${p.points} pts`];
    if (isSunriseKeystoneProtocol(p)) parts.push("Light keystone");
    else if (isWaterKeystoneId(p.id)) parts.push("Water keystone");
    else if (isMagnetismKeystoneId(p.id)) parts.push("Magnetism keystone");
    if (isPermanentProtocolId(p.id)) parts.push("automatic daily");
    if (p.durationEnabled) {
      parts.push(`${p.points} pts / 15 min`);
    }
    return parts.join(" · ");
  }

  function openDurationDialog(protocol: Protocol) {
    setDurationFor(protocol);
    setDurationMins(DURATION_BLOCK_MINUTES);
  }

  function toggleSingle(protocol: Protocol) {
    if (protocol.durationEnabled && (counts[protocol.id] ?? 0) === 0) {
      openDurationDialog(protocol);
      return;
    }
    const count = counts[protocol.id] ?? 0;
    if (isPermanentProtocolId(protocol.id)) {
      runLog(protocol.id, async () => {
        try {
          if (count > 0) {
            bumpCounts({ protocolId: protocol.id, delta: -1 });
            const res = await removeOneCompletionAction(protocol.id);
            applySnap({ ...res, protocolId: protocol.id, count: 0 });
            push(`Skipped tonight — ${protocol.name}`);
          } else {
            bumpCounts({ protocolId: protocol.id, delta: 1 });
            const res = await logPermanentTonightAction(protocol.id);
            applySnap({ ...res, protocolId: protocol.id });
            push(`Logged tonight · +${res.points} pts`);
          }
        } catch (e) {
          bumpCounts({ protocolId: protocol.id, delta: 0, absolute: count });
          push(e instanceof Error ? e.message : "Could not update", "err");
        }
      });
      return;
    }
    if (count === 0 && isSunriseKeystoneProtocol(protocol)) {
      setSunriseKeystoneFor(protocol);
      return;
    }
    runLog(protocol.id, async () => {
      try {
        bumpCounts({ protocolId: protocol.id, delta: count > 0 ? -1 : 1 });
        const res = await logCompletionAction(protocol.id);
        applySnap({ ...res, protocolId: protocol.id });
        if (res.action === "added") {
          const extra =
            res.streakBonus && res.streakBonus > 0
              ? ` · +${res.streakBonus} streak`
              : "";
          const buff =
            isSunriseKeystoneProtocol(protocol) && res.sunriseMultiplier > 1
              ? ` · ${formatSunriseMultiplier(res.sunriseMultiplier)} day boost`
              : "";
          push(`Done · +${res.points} pts${extra}${buff}`);
        } else {
          push("Unchecked");
        }
      } catch (e) {
        bumpCounts({ protocolId: protocol.id, delta: 0, absolute: count });
        push(e instanceof Error ? e.message : "Could not update", "err");
      }
    });
  }

  function logSunriseKeystone(
    protocol: Protocol,
    tier: SunriseTier,
    modifiers: SunriseModifiers,
  ) {
    runLog(protocol.id, async () => {
      try {
        bumpCounts({ protocolId: protocol.id, delta: 1 });
        const res = await logCompletionAction(protocol.id, {
          sunriseModifiers: modifiers,
        });
        applySnap({ ...res, protocolId: protocol.id });
        setSunriseKeystoneFor(null);
        const boost =
          res.sunriseMultiplier > 1
            ? ` · ${formatSunriseMultiplier(res.sunriseMultiplier)} day boost`
            : "";
        push(`${tier.shortLabel} · +${res.points} pts${boost}`);
      } catch (e) {
        bumpCounts({ protocolId: protocol.id, delta: -1 });
        push(e instanceof Error ? e.message : "Could not log", "err");
      }
    });
  }

  function addOne(protocol: Protocol, durationMinutes?: number) {
    const count = counts[protocol.id] ?? 0;
    const prevMins = durations[protocol.id] ?? 0;
    const mins =
      protocol.durationEnabled && durationMinutes == null
        ? DURATION_BLOCK_MINUTES
        : durationMinutes;
    bumpCounts({ protocolId: protocol.id, delta: 1 });
    if (mins) {
      bumpDurations({ protocolId: protocol.id, delta: mins });
    }
    setDurationFor(null);
    runLog(protocol.id, async () => {
      try {
        const res = await logCompletionAction(protocol.id, {
          durationMinutes: mins,
        });
        applySnap({ ...res, protocolId: protocol.id });
        if (res.action === "added") {
          const extra =
            res.streakBonus && res.streakBonus > 0
              ? ` · +${res.streakBonus} streak`
              : "";
          const time =
            mins && protocol.durationEnabled ? `+${mins} min · ` : "+1 · ";
          push(`${time}+${res.points} pts${extra}`);
        }
      } catch (e) {
        bumpCounts({ protocolId: protocol.id, delta: 0, absolute: count });
        bumpDurations({
          protocolId: protocol.id,
          delta: 0,
          absolute: prevMins,
        });
        push(e instanceof Error ? e.message : "Could not log", "err");
      }
    });
  }

  function removeOne(protocol: Protocol) {
    const count = counts[protocol.id] ?? 0;
    if (count <= 0) return;
    bumpCounts({ protocolId: protocol.id, delta: -1 });
    runLog(protocol.id, async () => {
      try {
        const res = await removeOneCompletionAction(protocol.id);
        applySnap({ ...res, protocolId: protocol.id });
        push("Removed last log");
      } catch (e) {
        bumpCounts({ protocolId: protocol.id, delta: 0, absolute: count });
        push(e instanceof Error ? e.message : "Could not remove", "err");
      }
    });
  }

  function renderRow(p: Protocol) {
    const count = counts[p.id] ?? 0;
    const totalMins = durations[p.id] ?? 0;
    const isDone = count > 0;
    const multi = p.allowsMultiple;
    const rowBusy = busyId === p.id;

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
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
              isDone
                ? "border-accent/50 bg-accent text-on-accent"
                : "border-border text-muted",
            )}
          >
            {p.durationEnabled ? (
              <Timer className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            )}
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
              {p.durationEnabled && totalMins > 0
                ? ` · ${totalMins} min today`
                : isDone
                  ? " · logged"
                  : p.durationEnabled
                    ? ` · + adds ${DURATION_BLOCK_MINUTES} min`
                    : ""}
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <ProtocolHowToButton
              protocol={p}
              onClick={() => setHowToFor(p)}
            />
            <button
              type="button"
              disabled={rowBusy || count <= 0}
              onClick={() => removeOne(p)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted transition hover:border-red-400/40 hover:text-red-400 disabled:opacity-35"
              aria-label={`Remove one ${p.name}`}
            >
              <Minus className="h-4 w-4" strokeWidth={2.5} />
            </button>
            {p.durationEnabled ? (
              <button
                type="button"
                disabled={rowBusy}
                onClick={() => openDurationDialog(p)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent/40 hover:text-accent disabled:opacity-35"
                aria-label={`Set custom minutes for ${p.name}`}
              >
                <Timer className="h-4 w-4" strokeWidth={2.5} />
              </button>
            ) : null}
            <button
              type="button"
              disabled={rowBusy}
              onClick={() => addOne(p)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/15 text-accent transition hover:bg-accent/25 disabled:opacity-35"
              aria-label={
                p.durationEnabled
                  ? `Add ${DURATION_BLOCK_MINUTES} minutes ${p.name}`
                  : `Add one ${p.name}`
              }
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </li>
      );
    }

    return (
      <li key={p.id} className="flex items-stretch gap-1.5">
        <button
          type="button"
          disabled={rowBusy}
          onClick={() => toggleSingle(p)}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition disabled:opacity-60",
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
              {isDone
                ? isPermanentProtocolId(p.id)
                  ? " · logged · tap to skip tonight"
                  : p.durationEnabled && totalMins > 0
                    ? ` · ${totalMins} min`
                    : " · done"
                : isPermanentProtocolId(p.id)
                  ? " · auto-logs daily"
                  : p.durationEnabled
                    ? ` · tap to set minutes`
                    : ""}
            </span>
          </span>
        </button>
        <ProtocolHowToButton
          protocol={p}
          onClick={() => setHowToFor(p)}
          className="self-center"
        />
      </li>
    );
  }

  return (
    <div className={cn("space-y-5", compact && "space-y-3")}>
      {!compact && (
        <>
          <DayStats
            dateLabel={dateLabel}
            points={dayPoints}
            streak={streak}
            hideTitle={hideTitle}
          />

          {sunriseMult > 1 ? (
            <p className="rounded-2xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-xs leading-relaxed text-accent">
              <span className="font-semibold">
                {formatSunriseMultiplier(sunriseMult)} day boost
              </span>
              {sunriseTierLabel ? (
                <span className="text-accent/90"> · {sunriseTierLabel}</span>
              ) : null}
              <span className="text-accent/80">
                {" "}
                — other activities earn {formatSunriseMultiplier(sunriseMult)}{" "}
                today
              </span>
            </p>
          ) : (
            protocols.some(isSunriseKeystoneProtocol) && (
              <p className="rounded-2xl border border-border px-3.5 py-2.5 text-xs leading-relaxed text-muted">
                <span className="font-medium text-foreground">Tip · </span>
                Morning light boosts the rest of today: horizon 2× · open sky
                1.5× · outside 1.25×
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
        </>
      )}

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
          {permanentProtocols.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Automatic · every day
              </h2>
              <p className="text-[11px] leading-relaxed text-muted">
                On your available list — logged each day. Tap to skip tonight if
                needed.
              </p>
              <ul className="space-y-2">{permanentProtocols.map(renderRow)}</ul>
            </section>
          )}
        </div>
      )}

      <ProtocolHowToDialog
        protocol={howToFor}
        onClose={() => setHowToFor(null)}
      />

      {durationFor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="glass w-full max-w-sm rounded-3xl p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{durationFor.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {durationFor.points} pts per {DURATION_BLOCK_MINUTES} min — set
                  a custom duration
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
                DURATION_BLOCK_MINUTES,
                DURATION_BLOCK_MINUTES * 2,
                DURATION_BLOCK_MINUTES * 3,
                DURATION_BLOCK_MINUTES * 4,
                durationFor.maxDurationMinutes,
              ]
                .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
                .sort((a, b) => a - b)
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
                sunriseMultiplier: isSunriseKeystoneProtocol(durationFor)
                  ? 1
                  : sunriseMult,
              })}{" "}
              pts this log
            </p>
            <button
              type="button"
              disabled={busyId === durationFor.id}
              onClick={() => addOne(durationFor, durationMins)}
              className="btn-primary mt-4 h-11 w-full rounded-2xl text-sm font-semibold"
            >
              Log {durationMins} min
            </button>
          </div>
        </div>
      )}
      {sunriseKeystoneFor ? (
        <SunriseKeystoneDialog
          allProtocols={allProtocols ?? protocols}
          sun={sun}
          timeZone={timeZone}
          pending={busyId === sunriseKeystoneFor.id}
          initialProtocol={sunriseKeystoneFor}
          onLog={logSunriseKeystone}
          onCancel={() => setSunriseKeystoneFor(null)}
        />
      ) : null}
    </div>
  );
}

function applyCountUpdate(
  current: Record<string, number>,
  update: { protocolId: string; delta: number; absolute?: number },
): Record<string, number> {
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
}

function DayStats({
  dateLabel,
  points,
  streak,
  hideTitle,
}: {
  dateLabel: string;
  points: number;
  streak: { current: number; best: number };
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
      <div className={cn("grid grid-cols-2 gap-2", !hideTitle && "mt-4")}>
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
