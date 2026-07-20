"use client";

import { Check, ChevronDown, Flame, Minus, Pencil, Plus, Sun, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import type { Protocol } from "@/db/schema";
import { AddActivityDialog } from "@/components/add-activity-dialog";
import { ColdThermoDialog } from "@/components/cold-thermo-dialog";
import {
  ProtocolHowToButton,
  ProtocolHowToDialog,
} from "@/components/protocol-how-to-dialog";
import {
  logCompletionAction,
  logPermanentTonightAction,
  removeOneCompletionAction,
} from "@/lib/actions/completions";
import type { PermanentAutoLogSnap } from "@/lib/actions/favorites";
import { setMagneticoGaussAction } from "@/lib/actions/magnetico";
import { setSleepRoomTempAction } from "@/lib/actions/sleep-room-temp";
import { orderProtocolsForNow } from "@/lib/checklist-order";
import {
  isMagnetismKeystoneId,
  isWaterKeystoneId,
} from "@/lib/lwm";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import { SunriseKeystoneDialog } from "@/components/sunrise-keystone-dialog";
import {
  coldThermoSkinTempBasePoints,
  formatColdThermoSkinTemp,
  isColdThermoProtocolId,
  OPTIMAL_COLD_THERMO_SKIN_TEMP_F,
  type ColdThermoSkinTempF,
} from "@/lib/cold-thermo-skin-temp";
import {
  formatMagneticoGauss,
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
import { isPermanentProtocol } from "@/lib/permanent-activities";
import {
  MOVEMENT_SETTING_OPTIONS,
  movementSettingBasePoints,
  requiresMovementSetting,
  type MovementSetting,
} from "@/lib/movement-setting";
import {
  isSunExposureProtocolId,
  SUN_EXPOSURE_SLOTS,
  sunExposureSlotClockLabel,
  sunSlotFromLocalHm,
  type SunExposureLogInput,
  type SunExposureSlot,
} from "@/lib/sun-exposure";
import { currentLocalHm } from "@/lib/sunrise-timing";
import {
  DURATION_BLOCK_MINUTES,
  formatSunriseMultiplier,
  isSunriseKeystoneProtocol,
  resolveSunriseTierOptions,
  SUNRISE_TIERS,
  type SunriseModifiers,
  type SunriseTier,
} from "@/lib/scoring";
import type { WeeklySummary } from "@/lib/weekly";
import type { SunTimes } from "@/lib/sun";
import { useToast } from "@/components/toast";
import { formatTodayMultiLogStatus } from "@/lib/format-day-activities";
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
  /** Full catalog for Add Activity (not just checklist items) */
  catalogProtocols?: Protocol[];
  availableIds?: string[];
  onAvailableIdsChange?: (ids: string[]) => void;
  onPermanentAutoLog?: (snap: PermanentAutoLogSnap) => void;
  isAdmin?: boolean;
  onAdminEditContent?: (focus: string) => void;
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
  permanent: true,
};

function CollapsibleChecklistSection({
  title,
  count,
  subtitle,
  accent = false,
  open,
  onToggle,
  children,
  tourId,
}: {
  title: string;
  count: number;
  subtitle?: string;
  accent?: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  tourId?: string;
}) {
  return (
    <section className="space-y-2" data-tour={tourId}>
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
  catalogProtocols,
  availableIds = [],
  onAvailableIdsChange,
  onPermanentAutoLog,
  isAdmin = false,
  onAdminEditContent,
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
  const [howToFor, setHowToFor] = useState<Protocol | null>(null);
  const [sunriseDialog, setSunriseDialog] = useState<{
    open: boolean;
    initialProtocol: Protocol | null;
  }>({ open: false, initialProtocol: null });
  const [coldThermoProtocol, setColdThermoProtocol] =
    useState<Protocol | null>(null);
  const [choicePicker, setChoicePicker] = useState<{
    kind: "magnetico" | "sleep" | "sunExposure" | "movement";
    protocol: Protocol;
  } | null>(null);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
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

  // Parent-owned counts/durations — optimistic updates flow up via callbacks.
  const countsRef = useRef(completionCounts);
  const durationsRef = useRef(completionDurations);
  useEffect(() => {
    countsRef.current = completionCounts;
  }, [completionCounts]);
  useEffect(() => {
    durationsRef.current = completionDurations;
  }, [completionDurations]);
  const counts = completionCounts;
  const durations = completionDurations;

  function bumpDurations(update: {
    protocolId: string;
    delta: number;
    absolute?: number;
  }) {
    const next = applyCountUpdate(durationsRef.current, update);
    durationsRef.current = next;
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
    () => protocols.filter((p) => !isPermanentProtocol(p)),
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
    () => protocols.filter((p) => isPermanentProtocol(p)),
    [protocols],
  );

  const sunriseCatalog = allProtocols ?? protocols;

  const suggestedSunSlot = useMemo(
    () =>
      sunSlotFromLocalHm(currentLocalHm(timeZone), { sun, timeZone }),
    [sun, timeZone],
  );

  const sunriseTierOptions = useMemo(
    () => resolveSunriseTierOptions(sunriseCatalog),
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
    action?: "added" | "removed";
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
      const current = countsRef.current[snap.protocolId] ?? 0;
      const resolved =
        snap.action === "added" ? Math.max(snap.count, current) : snap.count;
      bumpCounts({
        protocolId: snap.protocolId,
        delta: 0,
        absolute: resolved,
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
        `${formatMagneticoGauss(magneticoGauss)} · ${pts} pts`,
      ];
      if (isPermanentProtocol(p)) parts.push("automatic daily");
      return parts.join(" · ");
    }
    if (isSleepRoomTempProtocolId(p.id)) {
      const parts = [
        `${formatSleepRoomTemp(sleepRoomTempF)} · ${pointsForSleepRoomTemp(sleepRoomTempF)} pts`,
      ];
      if (isPermanentProtocol(p)) parts.push("automatic daily");
      return parts.join(" · ");
    }
    if (isColdThermoProtocolId(p.id)) {
      const base = coldThermoLogBase(p);
      return `${formatColdThermoSkinTemp(coldThermoSkinTempF)} · ${base} pts / 15 min`;
    }
    if (isSunExposureProtocolId(p.id)) {
      return `${p.points} pts / 15 min · ${SUN_EXPOSURE_SLOTS.map((s) => s.label.toLowerCase()).join(" · ")}`;
    }
    const parts: string[] = [`${p.points} pts`];
    if (isSunriseKeystoneProtocol(p)) parts.push("Light keystone");
    else if (isWaterKeystoneId(p.id)) parts.push("Water keystone");
    else if (isMagnetismKeystoneId(p.id)) parts.push("Magnetism keystone");
    if (isPermanentProtocol(p)) parts.push("automatic daily");
    if (p.durationEnabled) {
      parts.push(`${p.points} pts / 15 min`);
    }
    return parts.join(" · ");
  }

  function skipPermanentTonight(protocol: Protocol) {
    const count = counts[protocol.id] ?? 0;
    if (count <= 0) return;
    runLog(protocol.id, async () => {
      try {
        bumpCounts({ protocolId: protocol.id, delta: -1 });
        const res = await removeOneCompletionAction(protocol.id);
        applySnap({ ...res, protocolId: protocol.id, count: 0 });
        push(`Skipped tonight — ${protocol.name}`);
      } catch (e) {
        bumpCounts({ protocolId: protocol.id, delta: 0, absolute: count });
        push(e instanceof Error ? e.message : "Could not update", "err");
      }
    });
  }

  function chooseMagneticoGauss(protocol: Protocol, next: MagneticoGauss) {
    const prev = magneticoGauss;
    const wasLogged = (countsRef.current[protocol.id] ?? 0) > 0;
    setMagneticoGauss(next);
    setChoicePicker(null);
    setBusyId(protocol.id);
    start(async () => {
      try {
        const res = await setMagneticoGaussAction(next);
        setMagneticoGauss(res.gauss);
        if (!wasLogged) {
          bumpCounts({ protocolId: protocol.id, delta: 1 });
          const logged = await logPermanentTonightAction(protocol.id);
          applySnap({ ...logged, protocolId: protocol.id });
          push(
            `${formatMagneticoGauss(res.gauss)} · logged · +${logged.points} pts`,
          );
        } else {
          setDayPoints(res.dayPoints);
          onStatsChange?.({ dayPoints: res.dayPoints, streak });
          push(`Magnetico set to ${formatMagneticoGauss(res.gauss)}`);
        }
      } catch (e) {
        setMagneticoGauss(prev);
        if (!wasLogged) {
          bumpCounts({ protocolId: protocol.id, delta: 0, absolute: 0 });
        }
        push(e instanceof Error ? e.message : "Could not update gauss", "err");
      } finally {
        setBusyId(null);
      }
    });
  }

  function chooseSleepTemp(protocol: Protocol, next: SleepRoomTempF) {
    const prev = sleepRoomTempF;
    const wasLogged = (countsRef.current[protocol.id] ?? 0) > 0;
    setSleepRoomTempF(next);
    setChoicePicker(null);
    setBusyId(protocol.id);
    start(async () => {
      try {
        const res = await setSleepRoomTempAction(next);
        setSleepRoomTempF(res.tempF);
        if (!wasLogged) {
          bumpCounts({ protocolId: protocol.id, delta: 1 });
          const logged = await logPermanentTonightAction(protocol.id);
          applySnap({ ...logged, protocolId: protocol.id });
          push(
            `${formatSleepRoomTemp(res.tempF)} · logged · +${logged.points} pts`,
          );
        } else {
          setDayPoints(res.dayPoints);
          onStatsChange?.({ dayPoints: res.dayPoints, streak });
          push(`Sleep temp set to ${formatSleepRoomTemp(res.tempF)}`);
        }
      } catch (e) {
        setSleepRoomTempF(prev);
        if (!wasLogged) {
          bumpCounts({ protocolId: protocol.id, delta: 0, absolute: 0 });
        }
        push(e instanceof Error ? e.message : "Could not update temp", "err");
      } finally {
        setBusyId(null);
      }
    });
  }

  function toggleSingle(protocol: Protocol) {
    if (protocol.durationEnabled && (counts[protocol.id] ?? 0) === 0) {
      if (isColdThermoProtocolId(protocol.id)) {
        setColdThermoProtocol(protocol);
        return;
      }
      if (requiresMovementSetting(protocol)) {
        setChoicePicker({ kind: "movement", protocol });
        return;
      }
      addOne(protocol);
      return;
    }
    const count = counts[protocol.id] ?? 0;

    // Magnetico / cool bedroom: pick setting by opening the activity (no row bars).
    if (isMagneticoProtocolId(protocol.id)) {
      setChoicePicker({ kind: "magnetico", protocol });
      return;
    }
    if (isSleepRoomTempProtocolId(protocol.id)) {
      setChoicePicker({ kind: "sleep", protocol });
      return;
    }

    if (isPermanentProtocol(protocol)) {
      if (count > 0) {
        return;
      }
      runLog(protocol.id, async () => {
        try {
          bumpCounts({ protocolId: protocol.id, delta: 1 });
          const res = await logPermanentTonightAction(protocol.id);
          applySnap({ ...res, protocolId: protocol.id });
          push(`Logged tonight · +${res.points} pts`);
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
    const howToProtocol =
      sunriseTierOptions.find(
        (opt) =>
          opt.protocol.id ===
          (loggedSunriseTier?.protocolId ?? "sunrise-horizon"),
      )?.protocol ?? sunriseTierOptions[0]!.protocol;

    return (
      <CollapsibleChecklistSection
        title="Morning light"
        count={morningLightLogged ? 1 : 0}
        accent
        open={sectionsOpen.morningLight}
        onToggle={() => toggleSection("morningLight")}
        tourId="morning-light"
      >
        <div className="space-y-1.5">
          <div
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-3.5 py-3",
              morningLightLogged
                ? "border-accent/40 bg-accent/10"
                : "border-border bg-card",
            )}
          >
            <button
              type="button"
              disabled={rowBusy}
              onClick={() => openSunriseDialog(null)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left transition disabled:opacity-60"
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
                    : "Tap to choose tier, skin, eyes, and timing"}
                </span>
              </span>
            </button>
            <ProtocolHowToButton
              protocol={howToProtocol}
              onClick={() => setHowToFor(howToProtocol)}
              size="sm"
            />
          </div>
        </div>
      </CollapsibleChecklistSection>
    );
  }

  function renderAddActivityButton() {
    if (!catalogProtocols?.length || !onAvailableIdsChange) return null;
    return (
      <button
        type="button"
        data-tour="edit-activities"
        onClick={() => setAddActivityOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-accent/40 bg-accent/5 px-3.5 py-2.5 text-sm font-semibold text-accent transition hover:border-accent/60 hover:bg-accent/10"
      >
        <Pencil className="h-4 w-4" strokeWidth={2.5} />
        Edit activities
      </button>
    );
  }

  function renderEmptyHint(copy: string) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-3.5 py-3 text-xs leading-relaxed text-muted">
        {copy}
      </p>
    );
  }

  function sunExposureInputForSlot(slot: SunExposureSlot): SunExposureLogInput {
    return {
      slot,
      startHm: currentLocalHm(timeZone),
    };
  }

  function chooseSunExposureSlot(protocol: Protocol, slot: SunExposureSlot) {
    setChoicePicker(null);
    addOne(protocol, { sunExposure: sunExposureInputForSlot(slot) });
  }

  function chooseMovementSetting(
    protocol: Protocol,
    setting: MovementSetting,
  ) {
    setChoicePicker(null);
    addOne(protocol, { movementSetting: setting });
  }

  function chooseColdThermo(
    protocol: Protocol,
    skinTempF: ColdThermoSkinTempF,
    durationMinutes: number,
  ) {
    setColdThermoSkinTempF(skinTempF);
    setColdThermoProtocol(null);
    addOne(protocol, { skinTempF, durationMinutes });
  }

  function addOne(
    protocol: Protocol,
    opts?: {
      sunExposure?: SunExposureLogInput;
      movementSetting?: MovementSetting;
      skinTempF?: ColdThermoSkinTempF;
      durationMinutes?: number;
    },
  ) {
    const count = counts[protocol.id] ?? 0;
    const prevMins = durations[protocol.id] ?? 0;
    const mins = protocol.durationEnabled
      ? (opts?.durationMinutes ?? DURATION_BLOCK_MINUTES)
      : undefined;
    bumpCounts({ protocolId: protocol.id, delta: 1 });
    if (mins) {
      bumpDurations({ protocolId: protocol.id, delta: mins });
    }
    runLog(protocol.id, async () => {
      try {
        const res = await logCompletionAction(protocol.id, {
          durationMinutes: mins,
          skinTempF: isColdThermoProtocolId(protocol.id)
            ? (opts?.skinTempF ?? coldThermoSkinTempF)
            : undefined,
          sunExposure: isSunExposureProtocolId(protocol.id)
            ? (opts?.sunExposure ??
              sunExposureInputForSlot(
                sunSlotFromLocalHm(currentLocalHm(timeZone), { sun, timeZone }),
              ))
            : undefined,
          movementSetting: requiresMovementSetting(protocol)
            ? (opts?.movementSetting ?? "outside")
            : undefined,
        });
        applySnap({ ...res, protocolId: protocol.id });
        if (res.action === "added") {
          const extra =
            res.streakBonus && res.streakBonus > 0
              ? ` · +${res.streakBonus} streak`
              : "";
          const time =
            mins && protocol.durationEnabled
              ? isColdThermoProtocolId(protocol.id) && opts?.skinTempF != null
                ? `${formatColdThermoSkinTemp(opts.skinTempF)} · ${mins} min · `
                : `+${mins} min · `
              : "+1 · ";
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

  function showsMultiLogCount(p: Protocol): boolean {
    return p.allowsMultiple && !p.durationEnabled;
  }

  /** First log / another +15 for multi & timed activities (sun exposure opens slot picker). */
  function addMultiOrTimed(protocol: Protocol) {
    if (isSunExposureProtocolId(protocol.id)) {
      setChoicePicker({ kind: "sunExposure", protocol });
      return;
    }
    if (isColdThermoProtocolId(protocol.id)) {
      setColdThermoProtocol(protocol);
      return;
    }
    if (requiresMovementSetting(protocol)) {
      setChoicePicker({ kind: "movement", protocol });
      return;
    }
    addOne(protocol);
  }

  function renderRow(p: Protocol) {
    const count = counts[p.id] ?? 0;
    const totalMins = durations[p.id] ?? 0;
    const isDone = count > 0;
    const multi = p.allowsMultiple;
    const rowBusy = busyId === p.id;

    if (multi) {
      const multiBody = (
        <>
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
              isDone
                ? "border-accent/50 bg-accent text-on-accent"
                : "border-border text-muted",
            )}
          >
            {p.durationEnabled && totalMins > 0 ? (
              <span className="text-sm font-bold tabular-nums">{totalMins}</span>
            ) : showsMultiLogCount(p) && count > 0 ? (
              <span className="text-sm font-bold tabular-nums">{count}</span>
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
              {showsMultiLogCount(p) && count > 0 ? (
                <span className="ml-1.5 tabular-nums text-accent/90">
                  ×{count}
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              {showsMultiLogCount(p) && count > 0
                ? formatTodayMultiLogStatus(p.points, count)
                : (
                  <>
                    {protocolHint(p)}
                    {p.durationEnabled && totalMins > 0
                      ? ` · ${totalMins} min today`
                      : isColdThermoProtocolId(p.id)
                        ? " · tap to set temp & duration"
                        : p.durationEnabled
                          ? ` · tap to add ${DURATION_BLOCK_MINUTES} min`
                          : " · tap to log"}
                  </>
                )}
            </span>
          </span>
        </>
      );

      return (
        <li key={p.id} className="space-y-1.5">
          <div
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-3.5 py-3",
              isDone ? "border-accent/40 bg-accent/10" : "border-border bg-card",
            )}
          >
            {/* First log: whole row body; after that only + adds more. */}
            {isDone ? (
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {multiBody}
              </div>
            ) : (
              <button
                type="button"
                disabled={rowBusy}
                onClick={() => addMultiOrTimed(p)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left transition disabled:opacity-60"
                aria-label={
                  isSunExposureProtocolId(p.id)
                    ? `Log sun exposure — choose morning, noon, or afternoon`
                    : isColdThermoProtocolId(p.id)
                      ? `Log ${p.name} — choose skin temperature and duration`
                      : requiresMovementSetting(p)
                        ? `Log ${p.name} — choose full sunlight, outside, or indoors`
                        : p.durationEnabled
                          ? `Add ${DURATION_BLOCK_MINUTES} minutes ${p.name}`
                          : `Log ${p.name}`
                }
              >
                {multiBody}
              </button>
            )}
            <div className="flex shrink-0 items-center gap-1">
              <ProtocolHowToButton
                protocol={p}
                onClick={() => setHowToFor(p)}
                size="sm"
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
              <button
                type="button"
                disabled={rowBusy}
                onClick={() => addMultiOrTimed(p)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/15 text-accent transition hover:bg-accent/25 disabled:opacity-35"
                aria-label={
                  isSunExposureProtocolId(p.id)
                    ? `Log sun exposure — choose morning, noon, or afternoon`
                    : isColdThermoProtocolId(p.id)
                      ? `Log ${p.name} — choose skin temperature and duration`
                      : requiresMovementSetting(p)
                        ? `Log ${p.name} — choose full sunlight, outside, or indoors`
                        : p.durationEnabled
                          ? `Add ${DURATION_BLOCK_MINUTES} minutes ${p.name}`
                          : `Add one ${p.name}`
                }
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li key={p.id} className="space-y-1.5">
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border px-3.5 py-3",
            isDone
              ? "border-accent/40 bg-accent/10"
              : "border-border bg-card",
          )}
        >
          <button
            type="button"
            disabled={rowBusy}
            onClick={() => toggleSingle(p)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left transition disabled:opacity-60"
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
                  ? isPermanentProtocol(p)
                    ? " · logged tonight"
                    : p.durationEnabled && totalMins > 0
                      ? ` · ${totalMins} min`
                      : " · done"
                  : isPermanentProtocol(p)
                    ? " · auto-logs daily · tap to log"
                    : p.durationEnabled
                      ? ` · tap to add ${DURATION_BLOCK_MINUTES} min`
                      : ""}
              </span>
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            {isPermanentProtocol(p) && isDone ? (
              <button
                type="button"
                disabled={rowBusy}
                onClick={() => skipPermanentTonight(p)}
                className="inline-flex h-8 items-center justify-center rounded-xl border border-border/80 px-2 text-[10px] font-semibold text-muted transition hover:border-red-400/40 hover:text-red-400 disabled:opacity-50 sm:h-9 sm:px-2.5 sm:text-[11px]"
              >
                Skip
              </button>
            ) : null}
            <ProtocolHowToButton
              protocol={p}
              onClick={() => setHowToFor(p)}
              size="sm"
            />
          </div>
        </div>
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

      <div className="space-y-5">
        {renderSunriseSection()}
        {renderAddActivityButton()}

        <CollapsibleChecklistSection
          title="Suggested"
          count={suggested.length}
          accent
          open={sectionsOpen.suggested}
          onToggle={() => toggleSection("suggested")}
          tourId="section-suggested"
        >
          {suggested.length > 0 ? (
            <ul className="space-y-2">{suggested.map(renderRow)}</ul>
          ) : (
            renderEmptyHint(
              protocols.length === 0
                ? "Add activities to see phase-timed suggestions here."
                : "Nothing fits this sun phase right now — check Available below.",
            )
          )}
        </CollapsibleChecklistSection>

        <CollapsibleChecklistSection
          title="Available"
          count={available.length}
          open={sectionsOpen.available}
          onToggle={() => toggleSection("available")}
          tourId="section-available"
        >
          {available.length > 0 ? (
            <ul className="space-y-2">{available.map(renderRow)}</ul>
          ) : (
            renderEmptyHint(
              protocols.length === 0
                ? "Tap Edit activities to build your list."
                : "All remaining activities are suggested above, or already performed.",
            )
          )}
        </CollapsibleChecklistSection>

        <CollapsibleChecklistSection
          title="Performed"
          count={performed.length}
          open={sectionsOpen.performed}
          onToggle={() => toggleSection("performed")}
          tourId="section-performed"
        >
          {performed.length > 0 ? (
            <ul className="space-y-2">{performed.map(renderRow)}</ul>
          ) : (
            renderEmptyHint(
              "Logged activities for today show up here once you check them off.",
            )
          )}
        </CollapsibleChecklistSection>

        <CollapsibleChecklistSection
          title="Permanent"
          count={permanentProtocols.length}
          subtitle="On your available list — logged each day. Tap to skip tonight if needed."
          open={sectionsOpen.permanent}
          onToggle={() => toggleSection("permanent")}
          tourId="section-permanent"
        >
          {permanentProtocols.length > 0 ? (
            <ul className="space-y-2">{permanentProtocols.map(renderRow)}</ul>
          ) : (
            renderEmptyHint(
              "Add a permanent habit (like cool bedroom sleep) via Edit activities — it auto-logs each day.",
            )
          )}
        </CollapsibleChecklistSection>
      </div>

      <ProtocolHowToDialog
        protocol={howToFor}
        onClose={() => setHowToFor(null)}
      />

      {choicePicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="glass w-full max-w-sm rounded-3xl p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{choicePicker.protocol.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {choicePicker.kind === "magnetico"
                    ? "Tap your gauss rating"
                    : choicePicker.kind === "sleep"
                      ? "Tap your bedroom temperature"
                      : choicePicker.kind === "movement"
                        ? "Where did you do this session?"
                        : "Which sun window was this?"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChoicePicker(null)}
                className="rounded-lg p-1 text-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              {choicePicker.kind === "magnetico" ? (
                <OptionListChoice
                  options={MAGNETICO_GAUSS_OPTIONS.map(
                    (g): ClickThroughOption => ({
                      id: String(g),
                      title: formatMagneticoGauss(g),
                      subtitle: `${pointsForMagneticoGauss(g)} pts`,
                      highlight: g === magneticoGauss,
                    }),
                  )}
                  selectedId={String(magneticoGauss)}
                  onChoose={(id) => {
                    chooseMagneticoGauss(
                      choicePicker.protocol,
                      Number(id) as MagneticoGauss,
                    );
                  }}
                />
              ) : choicePicker.kind === "sleep" ? (
                <OptionListChoice
                  options={SLEEP_ROOM_TEMP_OPTIONS.map(
                    (t): ClickThroughOption => ({
                      id: String(t),
                      title: formatSleepRoomTemp(t),
                      subtitle: `${pointsForSleepRoomTemp(t)} pts`,
                      highlight: t === 65,
                    }),
                  )}
                  selectedId={String(sleepRoomTempF)}
                  onChoose={(id) => {
                    chooseSleepTemp(
                      choicePicker.protocol,
                      Number(id) as SleepRoomTempF,
                    );
                  }}
                />
              ) : choicePicker.kind === "movement" ? (
                <OptionListChoice
                  options={MOVEMENT_SETTING_OPTIONS.map(
                    (opt): ClickThroughOption => ({
                      id: opt.id,
                      title: opt.label,
                      subtitle: `${opt.detail} · ${movementSettingBasePoints(opt.id, choicePicker.protocol.points)} pts / ${DURATION_BLOCK_MINUTES} min`,
                      highlight: opt.id === "full_sunlight",
                    }),
                  )}
                  selectedId="full_sunlight"
                  disabled={busyId === choicePicker.protocol.id}
                  onChoose={(id) => {
                    chooseMovementSetting(
                      choicePicker.protocol,
                      id as MovementSetting,
                    );
                  }}
                />
              ) : (
                <OptionListChoice
                  options={SUN_EXPOSURE_SLOTS.map(
                    (s): ClickThroughOption => ({
                      id: s.id,
                      title: s.label,
                      subtitle: sunExposureSlotClockLabel(s.id, sun, timeZone),
                      highlight: s.id === suggestedSunSlot,
                    }),
                  )}
                  selectedId={suggestedSunSlot}
                  disabled={busyId === choicePicker.protocol.id}
                  onChoose={(id) => {
                    chooseSunExposureSlot(
                      choicePicker.protocol,
                      id as SunExposureSlot,
                    );
                  }}
                />
              )}
            </div>
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
      {coldThermoProtocol ? (
        <ColdThermoDialog
          protocol={coldThermoProtocol}
          pending={busyId === coldThermoProtocol.id}
          sunriseMultiplier={sunriseMult}
          initialTempF={coldThermoSkinTempF}
          onLog={(tempF, mins) =>
            chooseColdThermo(coldThermoProtocol, tempF, mins)
          }
          onCancel={() => setColdThermoProtocol(null)}
        />
      ) : null}
      {catalogProtocols?.length && onAvailableIdsChange ? (
        <AddActivityDialog
          open={addActivityOpen}
          onClose={() => setAddActivityOpen(false)}
          protocols={catalogProtocols}
          availableIds={availableIds}
          onAvailableIdsChange={onAvailableIdsChange}
          onPermanentAutoLog={onPermanentAutoLog}
          isAdmin={isAdmin}
          onAdminEditContent={onAdminEditContent}
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
