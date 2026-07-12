"use client";

import {
  Check,
  Flame,
  Lock,
  Minus,
  Plus,
  Search,
  Star,
  Timer,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { Protocol, ProtocolCategory, TimeOfDay } from "@/db/schema";
import {
  logCompletionAction,
  removeOneCompletionAction,
} from "@/lib/actions/completions";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { maxLogsPerDay, pointsForLog } from "@/lib/scoring";
import { idealTimeLabel, isSuggestedNow } from "@/lib/suggested-now";
import { TIME_OF_DAY_META } from "@/lib/time-of-day";
import { useToast } from "@/components/toast";
import { cn, formatPoints } from "@/lib/utils";

type FilterKey =
  | "all"
  | "favorites"
  | "notdone"
  | "multi"
  | "suggested"
  | ProtocolCategory;

type Props = {
  protocols: Protocol[];
  favoriteIds: string[];
  completionCounts: Record<string, number>;
  dayPoints: number;
  streak: { current: number; best: number };
  streakBonusToday: number;
  localHour: number;
  showOnboarding: boolean;
};

export function ActivityLog({
  protocols,
  favoriteIds: initialFavorites,
  completionCounts,
  dayPoints,
  streak,
  streakBonusToday,
  localHour,
  showOnboarding,
}: Props) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [durationFor, setDurationFor] = useState<string | null>(null);
  const [durationMins, setDurationMins] = useState(10);
  const [onboardingOpen, setOnboardingOpen] = useState(showOnboarding);

  const [favorites, setFavorites] = useOptimistic(
    new Set(initialFavorites),
    (current: Set<string>, protocolId: string) => {
      const next = new Set(current);
      if (next.has(protocolId)) next.delete(protocolId);
      else next.add(protocolId);
      return next;
    },
  );
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

  const protocolMap = useMemo(
    () => new Map(protocols.map((p) => [p.id, p])),
    [protocols],
  );

  const points = useMemo(() => {
    const activity = Object.entries(counts).reduce((sum, [id, n]) => {
      const p = protocolMap.get(id);
      return sum + (p ? p.points * n : 0);
    }, 0);
    return activity + streakBonusToday;
  }, [counts, protocolMap, streakBonusToday]);

  const loggedList = useMemo(() => {
    return Object.entries(counts)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => ({ protocol: protocolMap.get(id)!, count: n }))
      .filter((x) => x.protocol)
      .sort((a, b) => a.protocol.name.localeCompare(b.protocol.name));
  }, [counts, protocolMap]);

  const favoriteProtocols = protocols.filter((p) => favorites.has(p.id));
  const suggested = protocols
    .filter((p) => isSuggestedNow(p, localHour))
    .slice(0, 6);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return protocols.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.description} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const count = counts[p.id] ?? 0;
      if (filter === "favorites" && !favorites.has(p.id)) return false;
      if (filter === "notdone" && count > 0) return false;
      if (filter === "multi" && !p.allowsMultiple) return false;
      if (filter === "suggested" && !isSuggestedNow(p, localHour)) return false;
      if (
        filter !== "all" &&
        filter !== "favorites" &&
        filter !== "notdone" &&
        filter !== "multi" &&
        filter !== "suggested" &&
        p.category !== filter
      ) {
        return false;
      }
      return true;
    });
  }, [protocols, query, filter, favorites, counts, localHour]);

  const grouped = useMemo(() => {
    const map = new Map<ProtocolCategory, Protocol[]>();
    for (const c of CATEGORY_ORDER) map.set(c, []);
    for (const p of filtered) {
      map.get(p.category)?.push(p);
    }
    return map;
  }, [filtered]);

  function log(protocol: Protocol, durationMinutes?: number) {
    startTransition(async () => {
      try {
        if (protocol.allowsMultiple) {
          const max = maxLogsPerDay(protocol);
          if ((counts[protocol.id] ?? 0) >= max) {
            push(`Daily limit (${max}×) reached for this activity.`, "err");
            return;
          }
          setCounts({ protocolId: protocol.id, delta: 1 });
        } else {
          const has = (counts[protocol.id] ?? 0) > 0;
          setCounts({ protocolId: protocol.id, delta: has ? -1 : 1 });
        }
        const res = await logCompletionAction(protocol.id, {
          durationMinutes,
        });
        if (res.action === "added") {
          const extra =
            res.streakBonus && res.streakBonus > 0
              ? ` · +${res.streakBonus} streak`
              : "";
          push(`Logged · +${res.points} pts${extra}`);
        } else {
          push("Unlogged");
        }
        setDurationFor(null);
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not save", "err");
      }
    });
  }

  function unlog(protocol: Protocol) {
    startTransition(async () => {
      try {
        setCounts({ protocolId: protocol.id, delta: -1 });
        await removeOneCompletionAction(protocol.id);
        push("Removed one log");
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not update", "err");
      }
    });
  }

  function toggleStar(protocolId: string) {
    startTransition(async () => {
      try {
        setFavorites(protocolId);
        await toggleFavoriteAction(protocolId);
      } catch (e) {
        push(e instanceof Error ? e.message : "Favorite failed", "err");
      }
    });
  }

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "favorites", label: "Favorites" },
    { key: "suggested", label: "Now" },
    { key: "notdone", label: "Not done" },
    { key: "multi", label: "Multi" },
    ...CATEGORY_ORDER.map((c) => ({
      key: c as FilterKey,
      label: CATEGORY_META[c].label,
    })),
  ];

  return (
    <div className="space-y-6 pb-36 md:pb-28">
      {onboardingOpen && (
        <OnboardingCard
          protocols={protocols}
          favorites={favorites}
          onToggle={toggleStar}
          onDone={() => setOnboardingOpen(false)}
        />
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <Stat label="Points" value={formatPoints(points)} />
        <Stat
          label="Streak"
          value={`${streak.current}d`}
          sub={
            streak.current > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-accent-2">
                <Flame className="h-3 w-3" /> best {streak.best}d
              </span>
            ) : (
              "Log today to start"
            )
          }
        />
        <Stat label="Logged" value={`${loggedList.length}`} />
        <Stat label="Catalog" value={`${protocols.length}`} />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activities…"
          className="field-input w-full rounded-2xl py-3 pl-10 pr-10 text-[15px]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs transition sm:text-sm",
              filter === f.key
                ? "bg-accent font-medium text-[#041016]"
                : "border border-border text-muted hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!query && filter === "all" && favoriteProtocols.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Favorites
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {favoriteProtocols.map((p) => {
              const count = counts[p.id] ?? 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    p.durationEnabled
                      ? (setDurationFor(p.id),
                        setDurationMins(p.referenceMinutes))
                      : log(p)
                  }
                  className={cn(
                    "shrink-0 rounded-2xl border px-3 py-2 text-left text-sm",
                    count > 0
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border bg-card",
                  )}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="mt-0.5 block text-[11px] text-muted">
                    +{p.points}
                    {count > 0 ? ` · ×${count}` : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {!query && filter === "all" && suggested.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Suggested now
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggested.map((p) => (
              <ActivityRow
                key={`s-${p.id}`}
                protocol={p}
                count={counts[p.id] ?? 0}
                favorited={favorites.has(p.id)}
                onLog={() =>
                  p.durationEnabled
                    ? (setDurationFor(p.id), setDurationMins(p.referenceMinutes))
                    : log(p)
                }
                onUnlog={() => unlog(p)}
                onStar={() => toggleStar(p.id)}
                compact
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        {filter !== "all" &&
        filter !== "favorites" &&
        !CATEGORY_ORDER.includes(filter as ProtocolCategory) ? (
          <div className="space-y-2">
            {filtered.map((p) => (
              <ActivityRow
                key={p.id}
                protocol={p}
                count={counts[p.id] ?? 0}
                favorited={favorites.has(p.id)}
                onLog={() =>
                  p.durationEnabled
                    ? (setDurationFor(p.id), setDurationMins(p.referenceMinutes))
                    : log(p)
                }
                onUnlog={() => unlog(p)}
                onStar={() => toggleStar(p.id)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted">No matches.</p>
            )}
          </div>
        ) : (
          CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat) ?? [];
            if (items.length === 0) return null;
            if (
              filter !== "all" &&
              filter !== "favorites" &&
              filter !== "notdone" &&
              filter !== "multi" &&
              filter !== "suggested" &&
              filter !== cat
            ) {
              return null;
            }
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <div className="mb-2">
                  <h2 className="text-sm font-semibold">{meta.label}</h2>
                  <p className="text-xs text-muted">{meta.blurb}</p>
                </div>
                <div className="space-y-2">
                  {items.map((p) => (
                    <ActivityRow
                      key={p.id}
                      protocol={p}
                      count={counts[p.id] ?? 0}
                      favorited={favorites.has(p.id)}
                      onLog={() =>
                        p.durationEnabled
                          ? (setDurationFor(p.id),
                            setDurationMins(p.referenceMinutes))
                          : log(p)
                      }
                      onUnlog={() => unlog(p)}
                      onStar={() => toggleStar(p.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {durationFor && (
        <DurationModal
          protocol={protocolMap.get(durationFor)!}
          minutes={durationMins}
          onMinutes={setDurationMins}
          onCancel={() => setDurationFor(null)}
          onConfirm={() => log(protocolMap.get(durationFor)!, durationMins)}
        />
      )}

      <div className="fixed inset-x-0 bottom-[3.5rem] z-30 border-t border-border bg-[var(--header-bg)] backdrop-blur-xl md:bottom-0">
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
          <details>
            <summary className="flex cursor-pointer list-none items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Logged today
                </p>
                <p className="text-sm font-semibold">
                  {loggedList.length === 0
                    ? "Nothing yet"
                    : `${loggedList.length} · ${formatPoints(points)} pts`}
                  {streakBonusToday > 0
                    ? ` (incl. +${streakBonusToday} streak)`
                    : ""}
                </p>
              </div>
              <span className="text-xs text-accent">Details</span>
            </summary>
            {loggedList.length > 0 && (
              <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-sm">
                {loggedList.map(({ protocol, count }) => (
                  <li
                    key={protocol.id}
                    className="flex justify-between gap-2 rounded-lg border border-border/50 px-2 py-1.5"
                  >
                    <span className="truncate">{protocol.name}</span>
                    <span className="text-muted">
                      {count > 1 ? `×${count} ` : ""}+
                      {protocol.points * count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-1 text-[11px] text-muted">
              Server baseline {formatPoints(dayPoints)}
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

function OnboardingCard({
  protocols,
  favorites,
  onToggle,
  onDone,
}: {
  protocols: Protocol[];
  favorites: Set<string>;
  onToggle: (id: string) => void;
  onDone: () => void;
}) {
  const starters = protocols.slice(0, 12);

  return (
    <div className="glass rounded-3xl border border-accent/20 p-5">
      <h2 className="text-lg font-semibold">Pick your starter favorites</h2>
      <p className="mt-1 text-sm text-muted">
        Star 3–5 activities you do often for one-tap logging. You can change
        these anytime.
      </p>
      <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
        {starters.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onToggle(p.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm",
                favorites.has(p.id)
                  ? "border-accent-2/40 bg-accent-2/10"
                  : "border-border",
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4 shrink-0",
                  favorites.has(p.id) && "fill-current text-accent-2",
                )}
              />
              <span className="font-medium">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <form action="/api/onboarding/complete" className="mt-4">
        <button
          type="button"
          onClick={async () => {
            await fetch("/api/onboarding/complete", { method: "POST" });
            onDone();
          }}
          className="btn-primary flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold"
        >
          Continue to Today
        </button>
      </form>
    </div>
  );
}

function DurationModal({
  protocol,
  minutes,
  onMinutes,
  onCancel,
  onConfirm,
}: {
  protocol: Protocol;
  minutes: number;
  onMinutes: (n: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const pts = pointsForLog(protocol, minutes);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="glass w-full max-w-md rounded-3xl p-5">
        <div className="flex items-center gap-2 text-accent">
          <Timer className="h-5 w-5" />
          <h3 className="font-semibold text-foreground">{protocol.name}</h3>
        </div>
        <p className="mt-2 text-sm text-muted">
          How many minutes? Points scale from {protocol.points} pts per{" "}
          {protocol.referenceMinutes} min (max {protocol.maxDurationMinutes}{" "}
          min).
        </p>
        <input
          type="range"
          min={1}
          max={protocol.maxDurationMinutes}
          value={minutes}
          onChange={(e) => onMinutes(Number(e.target.value))}
          className="mt-4 w-full"
        />
        <p className="mt-2 text-center text-2xl font-semibold tabular-nums">
          {minutes} min · +{pts} pts
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex h-11 flex-1 items-center justify-center rounded-2xl text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary flex h-11 flex-1 items-center justify-center rounded-2xl text-sm font-semibold"
          >
            Log
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {sub && <div className="mt-0.5 text-[10px] text-muted">{sub}</div>}
    </div>
  );
}

function ActivityRow({
  protocol,
  count,
  favorited,
  onLog,
  onUnlog,
  onStar,
  compact,
}: {
  protocol: Protocol;
  count: number;
  favorited: boolean;
  onLog: () => void;
  onUnlog: () => void;
  onStar: () => void;
  compact?: boolean;
}) {
  const done = count > 0;
  const multi = protocol.allowsMultiple;
  const ideal = idealTimeLabel(protocol) as TimeOfDay;
  const idealLabel = TIME_OF_DAY_META[ideal]?.label ?? ideal;
  const max = maxLogsPerDay(protocol);

  return (
    <div
      className={cn(
        "protocol-card rounded-2xl border border-border bg-foreground/[0.03] p-3",
        done && "completed",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onStar}
          className={cn(
            "mt-0.5 rounded-lg p-1.5",
            favorited ? "text-accent-2" : "text-muted",
          )}
          aria-label="Favorite"
        >
          <Star className={cn("h-4 w-4", favorited && "fill-current")} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className={cn("text-sm font-medium", done && "text-accent")}>
              {protocol.name}
            </h3>
            <span className="rounded-full bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted">
              {idealLabel}
            </span>
            {protocol.lockedTimeOfDay && (
              <Lock className="h-3 w-3 text-muted" />
            )}
            {multi && (
              <span className="text-[10px] text-accent">
                multi · max {max}
              </span>
            )}
            {protocol.durationEnabled && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted">
                <Timer className="h-2.5 w-2.5" /> timed
              </span>
            )}
          </div>
          {!compact && (
            <p className="mt-1 text-xs text-muted">{protocol.description}</p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {multi ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onUnlog}
                  disabled={count === 0}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
                  {count}
                </span>
                <button
                  type="button"
                  onClick={onLog}
                  disabled={count >= max}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-[#041016] disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLog}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium",
                  done
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-border",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-full border",
                    done
                      ? "border-accent bg-accent text-[#041016]"
                      : "border-border text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" />
                </span>
                {done ? "Done" : "Log"}
              </button>
            )}
            <span className="ml-auto text-xs font-semibold text-accent-2">
              +{protocol.points}
              {protocol.durationEnabled ? "+" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
