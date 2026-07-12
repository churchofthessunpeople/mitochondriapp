"use client";

import {
  Check,
  Lock,
  Minus,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { Protocol, TimeOfDay } from "@/db/schema";
import {
  logCompletionAction,
  removeOneCompletionAction,
} from "@/lib/actions/completions";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import {
  idealTimeLabel,
  isSuggestedNow,
} from "@/lib/suggested-now";
import { TIME_OF_DAY_META } from "@/lib/time-of-day";
import { cn, formatPoints } from "@/lib/utils";

type FilterKey = "all" | "favorites" | "notdone" | "multi" | "suggested";

type Props = {
  protocols: Protocol[];
  favoriteIds: string[];
  completionCounts: Record<string, number>;
  dayPoints: number;
  localHour: number;
};

export function ActivityLog({
  protocols,
  favoriteIds: initialFavorites,
  completionCounts,
  dayPoints,
  localHour,
}: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
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
    return Object.entries(counts).reduce((sum, [id, n]) => {
      const p = protocolMap.get(id);
      return sum + (p ? p.points * n : 0);
    }, 0);
  }, [counts, protocolMap]);

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
    .slice(0, 8);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return protocols.filter((p) => {
      if (q) {
        const hay = `${p.name} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const count = counts[p.id] ?? 0;
      if (filter === "favorites" && !favorites.has(p.id)) return false;
      if (filter === "notdone" && count > 0) return false;
      if (filter === "multi" && !p.allowsMultiple) return false;
      if (filter === "suggested" && !isSuggestedNow(p, localHour)) return false;
      return true;
    });
  }, [protocols, query, filter, favorites, counts, localHour]);

  function log(protocol: Protocol) {
    startTransition(async () => {
      if (protocol.allowsMultiple) {
        setCounts({ protocolId: protocol.id, delta: 1 });
        await logCompletionAction(protocol.id);
      } else {
        const has = (counts[protocol.id] ?? 0) > 0;
        setCounts({ protocolId: protocol.id, delta: has ? -1 : 1 });
        await logCompletionAction(protocol.id);
      }
    });
  }

  function unlog(protocol: Protocol) {
    startTransition(async () => {
      setCounts({ protocolId: protocol.id, delta: -1 });
      await removeOneCompletionAction(protocol.id);
    });
  }

  function toggleStar(protocolId: string) {
    startTransition(async () => {
      setFavorites(protocolId);
      await toggleFavoriteAction(protocolId);
    });
  }

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "favorites", label: "Favorites" },
    { key: "suggested", label: "Suggested now" },
    { key: "notdone", label: "Not done" },
    { key: "multi", label: "Multi" },
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Points" value={formatPoints(points)} />
        <Stat
          label="Logged"
          value={`${loggedList.length}`}
          sub={`${Object.values(counts).reduce((a, b) => a + b, 0)} events`}
        />
        <Stat label="Catalog" value={`${protocols.length}`} />
      </div>

      {/* Search */}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm transition",
              filter === f.key
                ? "bg-accent text-[#041016] font-medium"
                : "border border-border text-muted hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Favorites strip */}
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
                  onClick={() => log(p)}
                  className={cn(
                    "shrink-0 rounded-2xl border px-3 py-2 text-left text-sm transition",
                    count > 0
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-border bg-card hover:border-accent/30",
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

      {/* Suggested now */}
      {!query && filter === "all" && suggested.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Suggested now
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggested.slice(0, 4).map((p) => (
              <ActivityRow
                key={`sug-${p.id}`}
                protocol={p}
                count={counts[p.id] ?? 0}
                favorited={favorites.has(p.id)}
                onLog={() => log(p)}
                onUnlog={() => unlog(p)}
                onStar={() => toggleStar(p.id)}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* Full catalog */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            {filter === "all" && !query ? "All activities" : "Results"}
          </h2>
          <span className="text-xs text-muted">{filtered.length}</span>
        </div>
        {filtered.length === 0 ? (
          <p className="glass rounded-2xl px-4 py-8 text-center text-sm text-muted">
            No activities match. Try another search or filter.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <ActivityRow
                key={p.id}
                protocol={p}
                count={counts[p.id] ?? 0}
                favorited={favorites.has(p.id)}
                onLog={() => log(p)}
                onUnlog={() => unlog(p)}
                onStar={() => toggleStar(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Sticky logged today */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-[var(--header-bg)] backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Logged today
                </p>
                <p className="text-sm font-semibold">
                  {loggedList.length === 0
                    ? "Nothing yet — tap an activity"
                    : `${loggedList.length} activities · ${formatPoints(points)} pts`}
                </p>
              </div>
              <span className="text-xs text-accent group-open:hidden">Show</span>
              <span className="hidden text-xs text-accent group-open:inline">
                Hide
              </span>
            </summary>
            {loggedList.length > 0 && (
              <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto pb-1">
                {loggedList.map(({ protocol, count }) => (
                  <li
                    key={protocol.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm"
                  >
                    <span className="truncate font-medium">{protocol.name}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {count > 1 ? `×${count} · ` : ""}
                      +{protocol.points * count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-muted">
              Baseline server score {formatPoints(dayPoints)} ·{" "}
              <Link href="/schedule" className="text-accent hover:underline">
                Optional time-of-day pins
              </Link>
            </p>
          </details>
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
  sub?: string;
}) {
  return (
    <div className="glass rounded-2xl p-3 sm:p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted sm:text-xs">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-muted sm:text-xs">{sub}</p>}
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
  const idealLabel = TIME_OF_DAY_META[ideal]?.label ?? String(ideal);

  return (
    <div
      className={cn(
        "protocol-card rounded-2xl border border-border bg-foreground/[0.03] p-3",
        done && "completed",
        compact && "p-2.5",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onStar}
          className={cn(
            "mt-0.5 rounded-lg p-1.5 transition",
            favorited
              ? "text-accent-2"
              : "text-muted hover:text-accent-2",
          )}
          aria-label={favorited ? "Remove favorite" : "Add favorite"}
        >
          <Star
            className={cn("h-4 w-4", favorited && "fill-current")}
          />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3
              className={cn(
                "text-sm font-medium leading-snug",
                done && "text-accent",
              )}
            >
              {protocol.name}
            </h3>
            <span className="rounded-full bg-foreground/5 px-1.5 py-0.5 text-[10px] capitalize text-muted">
              {idealLabel}
            </span>
            {protocol.lockedTimeOfDay && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted">
                <Lock className="h-2.5 w-2.5" />
                locked
              </span>
            )}
            {multi && (
              <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                multi
              </span>
            )}
          </div>
          {!compact && (
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {protocol.description}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {multi ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onUnlog}
                  disabled={count === 0}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted hover:bg-foreground/5 disabled:opacity-30"
                  aria-label="Remove one"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
                  {count}
                </span>
                <button
                  type="button"
                  onClick={onLog}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-[#041016] hover:brightness-110"
                  aria-label="Log once"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLog}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition",
                  done
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-border hover:bg-foreground/5",
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
              {multi && count > 1 ? ` ×${count}` : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
