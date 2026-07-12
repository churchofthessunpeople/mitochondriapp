"use client";

import { Check, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Protocol, ProtocolCategory } from "@/db/schema";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

type Props = {
  protocols: Protocol[];
  availableIds: string[];
  /** When set, "Today's checklist" switches tab instead of routing */
  onOpenSchedule?: () => void;
  /** Notify parent shell so Schedule tab updates without full navigation */
  onAvailableIdsChange?: (ids: string[]) => void;
};

/**
 * Personal "via" list — which catalog activities you can actually do
 * (equipment, access, preference). Stored as user_favorites.
 */
export function AvailablePicker({
  protocols,
  availableIds: initialIds,
  onOpenSchedule,
  onAvailableIdsChange,
}: Props) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProtocolCategory | "all">("all");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [, start] = useTransition();

  const [available, setAvailable] = useState(() => new Set(initialIds));

  useEffect(() => {
    setAvailable(new Set(initialIds));
  }, [initialIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return protocols.filter((p) => {
      if (showOnlyAvailable && !available.has(p.id)) return false;
      if (category !== "all" && p.category !== category) return false;
      if (q) {
        const hay = `${p.name} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [protocols, query, category, showOnlyAvailable, available]);

  const grouped = useMemo(() => {
    const map = new Map<ProtocolCategory, Protocol[]>();
    for (const c of CATEGORY_ORDER) map.set(c, []);
    for (const p of filtered) map.get(p.category)?.push(p);
    return map;
  }, [filtered]);

  function toggle(protocolId: string, name: string) {
    start(async () => {
      try {
        const wasOn = available.has(protocolId);
        const next = new Set(available);
        if (wasOn) next.delete(protocolId);
        else next.add(protocolId);
        setAvailable(next);
        onAvailableIdsChange?.([...next]);
        await toggleFavoriteAction(protocolId);
        push(wasOn ? `Removed “${name}”` : `Available: ${name}`);
      } catch (e) {
        // Revert local state on failure
        setAvailable(new Set(available));
        onAvailableIdsChange?.([...available]);
        push(e instanceof Error ? e.message : "Could not update", "err");
      }
    });
  }

  return (
    <div className="space-y-5 pb-28">
      <div className="glass rounded-3xl p-4 text-sm text-muted">
        <p>
          Toggle what <strong className="text-foreground">you</strong> can do.
          Example: rebounding only if you have a rebounder. Your schedule is
          built only from this list.
        </p>
        <p className="mt-2">
          <span className="font-medium text-accent">{available.size}</span> of{" "}
          {protocols.length} available
          {available.size > 0 && (
            <>
              {" · "}
              {onOpenSchedule ? (
                <button
                  type="button"
                  onClick={onOpenSchedule}
                  className="text-accent hover:underline"
                >
                  Today&apos;s checklist
                </button>
              ) : (
                <Link href="/app" className="text-accent hover:underline">
                  Today&apos;s checklist
                </Link>
              )}
            </>
          )}
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search catalog…"
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
        <Chip
          active={category === "all" && !showOnlyAvailable}
          onClick={() => {
            setCategory("all");
            setShowOnlyAvailable(false);
          }}
          label="All"
        />
        <Chip
          active={showOnlyAvailable}
          onClick={() => {
            setShowOnlyAvailable(true);
            setCategory("all");
          }}
          label={`Mine (${available.size})`}
        />
        {CATEGORY_ORDER.map((c) => (
          <Chip
            key={c}
            active={category === c && !showOnlyAvailable}
            onClick={() => {
              setCategory(c);
              setShowOnlyAvailable(false);
            }}
            label={CATEGORY_META[c].label}
          />
        ))}
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const list = grouped.get(cat) ?? [];
        if (list.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
              {CATEGORY_META[cat].label}
            </h2>
            <ul className="space-y-2">
              {list.map((p) => {
                const on = available.has(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id, p.name)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition",
                        on
                          ? "border-accent/40 bg-accent/10"
                          : "border-border bg-card hover:border-accent/25",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                          on
                            ? "border-accent/50 bg-accent text-[#041016]"
                            : "border-border text-muted",
                        )}
                      >
                        <Check className="h-4 w-4" strokeWidth={2.5} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium leading-snug">{p.name}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {p.description}
                        </span>
                        <span className="mt-1 block text-[11px] text-muted">
                          {p.points} pts
                          {p.allowsMultiple ? " · multi-log" : ""}
                          {on ? " · available to you" : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">
          No activities match. Try another filter.
        </p>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs transition sm:text-sm",
        active
          ? "bg-accent font-medium text-[#041016]"
          : "border border-border text-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
