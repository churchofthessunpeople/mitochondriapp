"use client";

import { Check, ChevronDown, Flame, Minus, Plus, Sun, Timer, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
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
import { setMagneticoGaussAction } from "@/lib/actions/magnetico";
import { setSleepRoomTempAction } from "@/lib/actions/sleep-room-temp";
import { orderProtocolsForNow } from "@/lib/checklist-order";
import {
  isMagnetismKeystoneId,
  isWaterKeystoneId,
} from "@/lib/lwm";
import { SunriseKeystoneDialog } from "@/components/sunrise-keystone-dialog";
import {
  coldThermoSkinTempBasePoints,
  COLD_THERMO_SKIN_TEMP_OPTIONS,
  formatColdThermoSkinTemp,
  isColdThermoProtocolId,
  OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  type ColdThermoSkinTempF,
} from "@/lib/cold-thermo-skin-temp";
import {
  formatMagneticoGauss,
  formatMagneticoGaussMultiplier,
  isMagneticoProtocolId,
  MAGNETICO_GAUSS_OPTIONS,
  parseMagneticoGauss,
  pointsForMagneticoGauss,
  type MagneticoGauss,
} from "@/lib/magnetico";
import {
  formatSleepRoomTemp,
  isSleepRoomTempProtocolId,
  parseSleepRoomTempF,
  pointsForSleepRoomTemp,
  SLEEP_ROOM_TEMP_OPTIONS,
  type SleepRoomTempF,
} from "@/lib/sleep-room-temp";
import { isPermanentProtocolId } from "@/lib/permanent-activities";
import {
  DURATION_BLOCK_MINUTES,
  formatSunriseMultiplier,
  isSunriseKeystoneProtocol,
  pointsForLog,
  SUNRISE_TIERS,
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
  todayIso?: string;
  onStatsChange?: (s: {
    dayPoints: number;
    streak: { current: number; best: number };
    sunriseMultiplier?: number;
    sunriseTierLabel?: string | null;
  }) => void;
  /** Live checklist counts for L·W·M strip */
  onCompletionCountsChange?: (counts: Record<string, number>) => void;
  onCompletionDurationsChange?: (durations: Record<string, number>) => void;
  magneticoGauss?: number;
  sleepRoomTempF?: number;
};

const MORNING_LIGHT_BUSY_ID = "morning-light";

type ChecklistSectionId =
  | "morningLight"
  | "suggested"
  | "available"
  | "performed"
  | "permanent";

const DEFAULT_SECTIONS_OPEN: Record<ChecklistSectionId, boolean> = {
  morningLight: true,
  suggested: true,
  available: true,
  performed: true,
  permanent: false,
};

function CollapsibleChecklistSection({
  title,
  count,
  subtitle,
  accent = false,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  subtitle?: string;
  accent?: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-2 rounded-xl py-0.5 text-left transition hover:opacity-90"
      >
        <span className="min-w-0">
          <span
            className={cn(
              "text-xs font-medium uppercase tracking-[0.16em]",
              accent ? "text-accent" : "text-muted",
            )}
          >
            {title}
            {count > 0 ? (
              <span className="ml-1.5 tabular-nums text-foreground/70">
                ({count})
              </span>
            ) : null}
          </span>
          {subtitle ? (
            <span className="mt-0.5 block text-[11px] normal-case leading-relaxed tracking-normal text-muted">
              {subtitle}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? children : null}
    </section>
  );
}

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
  todayIso,
  onStatsChange,
  onCompletionCountsChange,
  onCompletionDurationsChange,
  magneticoGauss: initialMagneticoGauss = 10,
  sleepRoomTempF: initialSleepRoomTempF = 65,
}: Props) {
  const { push } = useToast();
  const [, start] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dayPoints, setDayPoints] = useState(initialPoints);
  const [streak, setStreak] = useState(initialStreak);
  const [sunriseMult, setSunriseMult] = useState(initialMult);
  const [sunriseTierLabel, setSunriseTierLabel] = useState(initialTierLabel);
  const [coldThermoSkinTempF, setColdThermoSkinTempF] =
    useState<ColdThermoSkinTempF>(OPTIMAL_COLD_THERMO_SKIN_TEMP_F);
  const [durationFor, setDurationFor] = useState<Protocol | null>(null);
  const [howToFor, setHowToFor] = useState<Protocol | null>(null);
  const [durationMins, setDurationMins] = useState(15);
  const [sunriseDialog, setSunriseDialog] = useState<{
    open: boolean;
    initialProtocol: Protocol | null;
  }>({ open: false, initialProtocol: null });
  const [magneticoGauss, setMagneticoGauss] = useState<MagneticoGauss>(() =>
    parseMagneticoGauss(initialMagneticoGauss),
  );
  const [sleepRoomTempF, setSleepRoomTempF] = useState<SleepRoomTempF>(() =>
    parseSleepRoomTempF(initialSleepRoomTempF),
  );

  useEffect(() => {
    setMagneticoGauss(parseMagneticoGauss(initialMagneticoGauss));
  }, [initialMagneticoGauss]);

  useEffect(() => {
    setSleepRoomTempF(parseSleepRoomTempF(initialSleepRoomTempF));
  }, [initialSleepRoomTempF]);

  const [sectionsOpen, setSectionsOpen] = useState(DEFAULT_SECTIONS_OPEN);

  function toggleSection(id: ChecklistSectionId) {
    setSectionsOpen((s) => ({ ...s, [id]: !s[id] }));
  }

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

  const manualProtocols = useMemo(
    () => protocols.filter((p) => !isPermanentProtocolId(p.id)),
    [protocols],
  );

  const performed = useMemo(
    () => manualProtocols.filter((p) => (counts[p.id] ?? 0) > 0),
    [manualProtocols, counts],
  );

  const { suggested, available } = useMemo(() => {
    const pending = manualProtocols.filter((p) => (counts[p.id] ?? 0) === 0);
    const { suggested: sug, rest } = orderProtocolsForNow(pending, {
      phase,
      localHour,
      completionCounts: counts,
    });
    return { suggested: sug, available: rest };
  }, [manualProtocols, phase, localHour, counts]);

  const permanentProtocols = useMemo(
    () => protocols.filter((p) => isPermanentProtocolId(p.id)),
    [protocols],
  );

  const sunriseCatalog = allProtocols ?? protocols;

  const sunriseTierOptions = useMemo(
    () =>
      SUNRISE_TIERS.map((tier) => ({
        tier,
        protocol: sunriseCatalog.find((p) => p.id === tier.protocolId) ?? null,
      })).filter((x) => x.protocol != null) as {
        tier: SunriseTier;
        protocol: Protocol;
      }[],
    [sunriseCatalog],
  );

  const loggedSunriseTier = useMemo(
    () => SUNRISE_TIERS.find((t) => (counts[t.protocolId] ?? 0) > 0) ?? null,
    [counts],
  );

  const morningLightLogged = sunriseMult > 1 || loggedSunriseTier != null;

  function openSunriseDialog(initialProtocol: Protocol | null = null) {
    setSunriseDialog({ open: true, initialProtocol });
  }

  function closeSunriseDialog() {
    setSunriseDialog({ open: false, initialProtocol: null });
  }

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

  function coldThermoLogBase(protocol: Protocol): number {
    return coldThermoSkinTempBasePoints(coldThermoSkinTempF, protocol.points);
  }

  function protocolHint(p: Protocol): string {
    if (isMagneticoProtocolId(p.id)) {
      const pts = pointsForMagneticoGauss(magneticoGauss, p.points);
      const parts = [
        `${formatMagneticoGauss(magneticoGauss)} · ${formatMagneticoGaussMultiplier(magneticoGauss)} · ${pts} pts`,
      ];
      if (isPermanentProtocolId(p.id)) parts.push("automatic daily");
      return parts.join(" · ");
    }
    if (isSleepRoomTempProtocolId(p.id)) {
      const parts = [
        `${formatSleepRoomTemp(sleepRoomTempF)} · ${pointsForSleepRoomTemp(sleepRoomTempF)} pts`,
      ];
      if (isPermanentProtocolId(p.id)) parts.push("automatic daily");
      return parts.join(" · ");
    }
    if (isColdThermoProtocolId(p.id)) {
      const base = coldThermoLogBase(p);
      return `${formatColdThermoSkinTemp(coldThermoSkinTempF)} · ${base} pts / 15 min`;
    }
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

  function setGauss(next: MagneticoGauss) {
    const prev = magneticoGauss;
    if (next === prev) return;
    setMagneticoGauss(next);
    start(async () => {
      try {
        const res = await setMagneticoGaussAction(next);
        setMagneticoGauss(res.gauss);
        setDayPoints(res.dayPoints);
        onStatsChange?.({ dayPoints: res.dayPoints, streak });
        push(`Magnetico set to ${formatMagneticoGauss(res.gauss)}`);
      } catch (e) {
        setMagneticoGauss(prev);
        push(e instanceof Error ? e.message : "Could not update gauss", "err");
      }
    });
  }

  function setSleepTemp(next: SleepRoomTempF) {
    const prev = sleepRoomTempF;
    if (next === prev) return;
    setSleepRoomTempF(next);
    start(async () => {
      try {
        const res = await setSleepRoomTempAction(next);
        setSleepRoomTempF(res.tempF);
        setDayPoints(res.dayPoints);
        onStatsChange?.({ dayPoints: res.dayPoints, streak });
        push(`Sleep temp set to ${formatSleepRoomTemp(res.tempF)}`);
      } catch (e) {
        setSleepRoomTempF(prev);
        push(e instanceof Error ? e.message : "Could not update temp", "err");
      }
    });
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
      openSunriseDialog(protocol);
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
    viewedAtStartIso: string,
    viewedAtEndIso: string,
  ) {
    runLog(MORNING_LIGHT_BUSY_ID, async () => {
      try {
        for (const t of SUNRISE_TIERS) {
          if ((countsRef.current[t.protocolId] ?? 0) > 0) {
            await removeOneCompletionAction(t.protocolId);
            bumpCounts({ protocolId: t.protocolId, delta: 0, absolute: 0 });
          }
        }
        bumpCounts({ protocolId: protocol.id, delta: 1 });
        const res = await logCompletionAction(protocol.id, {
          sunriseModifiers: modifiers,
          viewedAtStart: viewedAtStartIso,
          viewedAtEnd: viewedAtEndIso,
        });
        applySnap({ ...res, protocolId: protocol.id });
        closeSunriseDialog();
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

  function renderSunriseSection() {
    if (sunriseTierOptions.length === 0) return null;
    const rowBusy = busyId === MORNING_LIGHT_BUSY_ID;

    return (
      <CollapsibleChecklistSection
        title="Morning light"
        count={morningLightLogged ? 1 : 0}
        accent
        open={sectionsOpen.morningLight}
        onToggle={() => toggleSection("morningLight")}
      >
        <div className="space-y-1.5">
          <div className="flex items-stretch gap-1.5">
            <button
              type="button"
              disabled={rowBusy}
              onClick={() => openSunriseDialog(null)}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition disabled:opacity-60",
                morningLightLogged
                  ? "border-accent/40 bg-accent/10"
                  : "border-border bg-card hover:border-accent/30",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                  morningLightLogged
                    ? "border-accent/50 bg-accent text-on-accent"
                    : "border-border text-muted",
                )}
              >
                <Sun className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block font-medium leading-snug",
                    morningLightLogged && "text-accent",
                  )}
                >
                  {loggedSunriseTier?.shortLabel ?? "Morning light check-in"}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {morningLightLogged
                    ? [
                        sunriseTierLabel ?? loggedSunriseTier?.shortLabel,
                        sunriseMult > 1
                          ? `${formatSunriseMultiplier(sunriseMult)} day boost`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Tap a tier below or open to set skin, eyes, and timing"}
                </span>
              </span>
            </button>
          </div>
          <div
            className="flex flex-wrap items-center gap-1.5 pl-1"
            role="group"
            aria-label="Morning light tier"
          >
            <span className="mr-1 text-[10px] uppercase tracking-wider text-muted">
              Tier
            </span>
            {sunriseTierOptions.map(({ tier, protocol }) => {
              const active = loggedSunriseTier?.id === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  disabled={rowBusy}
                  onClick={() => openSunriseDialog(protocol)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                    active
                      ? "bg-accent text-on-accent"
                      : "border border-border text-muted hover:border-accent/40 hover:text-foreground",
                    tier.id === "horizon" && !active && "border-accent/30",
                  )}
                >
                  {tier.shortLabel} · {formatSunriseMultiplier(tier.multiplier)}
                </button>
              );
            })}
          </div>
        </div>
      </CollapsibleChecklistSection>
    );
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
          skinTempF: isColdThermoProtocolId(protocol.id)
            ? coldThermoSkinTempF
            : undefined,
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
        <li key={p.id} className="space-y-1.5">
          <div
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
          </div>
          {isColdThermoProtocolId(p.id) && (
            <div
              className="flex flex-wrap items-center gap-1.5 pl-1"
              role="group"
              aria-label="Skin surface temperature"
            >
              <span className="mr-1 text-[10px] uppercase tracking-wider text-muted">
                Skin
              </span>
              {COLD_THERMO_SKIN_TEMP_OPTIONS.map((t) => {
                const active = coldThermoSkinTempF === t;
                const base = coldThermoSkinTempBasePoints(t, p.points);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={rowBusy}
                    onClick={() => setColdThermoSkinTempF(t)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                      active
                        ? "bg-accent text-on-accent"
                        : "border border-border text-muted hover:border-accent/40 hover:text-foreground",
                      t === 50 && !active && "border-accent/30",
                    )}
                  >
                    {t}°F · {base} base
                  </button>
                );
              })}
            </div>
          )}
        </li>
      );
    }

    return (
      <li key={p.id} className="space-y-1.5">
        <div className="flex items-stretch gap-1.5">
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
        </div>
        {isMagneticoProtocolId(p.id) && (
          <div
            className="flex flex-wrap items-center gap-1.5 pl-1"
            role="group"
            aria-label="Magnetico gauss rating"
          >
            <span className="mr-1 text-[10px] uppercase tracking-wider text-muted">
              Gauss
            </span>
            {MAGNETICO_GAUSS_OPTIONS.map((g) => {
              const active = magneticoGauss === g;
              const pts = pointsForMagneticoGauss(g, p.points);
              const mult = formatMagneticoGaussMultiplier(g);
              return (
                <button
                  key={g}
                  type="button"
                  disabled={rowBusy}
                  onClick={() => setGauss(g)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                    active
                      ? "bg-accent text-on-accent"
                      : "border border-border text-muted hover:border-accent/40 hover:text-foreground",
                  )}
                >
                  {g} G · {mult} · {pts} pts
                </button>
              );
            })}
          </div>
        )}
        {isSleepRoomTempProtocolId(p.id) && (
          <div
            className="flex flex-wrap items-center gap-1.5 pl-1"
            role="group"
            aria-label="Bedroom sleep temperature"
          >
            <span className="mr-1 text-[10px] uppercase tracking-wider text-muted">
              Temp
            </span>
            {SLEEP_ROOM_TEMP_OPTIONS.map((t) => {
              const active = sleepRoomTempF === t;
              const pts = pointsForSleepRoomTemp(t);
              return (
                <button
                  key={t}
                  type="button"
                  disabled={rowBusy}
                  onClick={() => setSleepTemp(t)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                    active
                      ? "bg-accent text-on-accent"
                      : "border border-border text-muted hover:border-accent/40 hover:text-foreground",
                    t === 65 && !active && "border-accent/30",
                  )}
                >
                  {t}°F · {pts} pts
                </button>
              );
            })}
          </div>
        )}
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
            sunriseMult <= 1 && (
              <p className="rounded-2xl border border-border px-3.5 py-2.5 text-xs leading-relaxed text-muted">
                <span className="font-medium text-foreground">Tip · </span>
                Morning light boosts the rest of today: horizon 2× · open sky
                1.5× · outside 1.25× — logged from the daily sunrise check-in.
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
        <div className="space-y-5">
          {renderSunriseSection()}
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
        </div>
      ) : (
        <div className="space-y-5">
          {renderSunriseSection()}
          {suggested.length > 0 && (
            <CollapsibleChecklistSection
              title="Suggested"
              count={suggested.length}
              accent
              open={sectionsOpen.suggested}
              onToggle={() => toggleSection("suggested")}
            >
              <ul className="space-y-2">{suggested.map(renderRow)}</ul>
            </CollapsibleChecklistSection>
          )}
          {available.length > 0 && (
            <CollapsibleChecklistSection
              title="Available"
              count={available.length}
              open={sectionsOpen.available}
              onToggle={() => toggleSection("available")}
            >
              <ul className="space-y-2">{available.map(renderRow)}</ul>
            </CollapsibleChecklistSection>
          )}
          {performed.length > 0 && (
            <CollapsibleChecklistSection
              title="Performed"
              count={performed.length}
              open={sectionsOpen.performed}
              onToggle={() => toggleSection("performed")}
            >
              <ul className="space-y-2">{performed.map(renderRow)}</ul>
            </CollapsibleChecklistSection>
          )}
          {permanentProtocols.length > 0 && (
            <CollapsibleChecklistSection
              title="Permanent"
              count={permanentProtocols.length}
              subtitle="On your available list — logged each day. Tap to skip tonight if needed."
              open={sectionsOpen.permanent}
              onToggle={() => toggleSection("permanent")}
            >
              <ul className="space-y-2">{permanentProtocols.map(renderRow)}</ul>
            </CollapsibleChecklistSection>
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
            {isColdThermoProtocolId(durationFor.id) && (
              <div
                className="mt-4 flex flex-wrap items-center gap-1.5"
                role="group"
                aria-label="Skin surface temperature"
              >
                <span className="mr-1 w-full text-[10px] uppercase tracking-wider text-muted">
                  Skin temp
                </span>
                {COLD_THERMO_SKIN_TEMP_OPTIONS.map((t) => {
                  const active = coldThermoSkinTempF === t;
                  const base = coldThermoSkinTempBasePoints(t, durationFor.points);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setColdThermoSkinTempF(t)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold transition",
                        active
                          ? "bg-accent text-on-accent"
                          : "border border-border text-muted",
                        t === 50 && !active && "border-accent/30",
                      )}
                    >
                      {t}°F · {base}
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-xs text-accent">
              ≈{" "}
              {pointsForLog(durationFor, durationMins, {
                sunriseMultiplier: isSunriseKeystoneProtocol(durationFor)
                  ? 1
                  : sunriseMult,
                basePoints: coldThermoLogBase(durationFor),
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
      {sunriseDialog.open ? (
        <SunriseKeystoneDialog
          todayIso={todayIso}
          allProtocols={sunriseCatalog}
          sun={sun}
          timeZone={timeZone}
          pending={busyId === MORNING_LIGHT_BUSY_ID}
          initialProtocol={sunriseDialog.initialProtocol}
          onLog={logSunriseKeystone}
          onCancel={closeSunriseDialog}
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
