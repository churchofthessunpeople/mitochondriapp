"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Protocol, ProtocolCategory } from "@/db/schema";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  LWM_PILLARS,
  PILLAR_ORDER,
  pillarForCategory,
  type LwmPillarId,
} from "@/lib/lwm";
import {
  equipmentLabel,
  getProtocolMeta,
} from "@/lib/protocol-meta";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

type Props = {
  protocols: Protocol[];
  availableIds: string[];
  onAvailableIdsChange?: (ids: string[]) => void;
  /** Controlled expand (legacy collapsible chrome) */
  expanded?: boolean;
  onExpandedChange?: (open: boolean) => void;
  defaultExpanded?: boolean;
  /** Always show body — used under Today tab row */
  embedded?: boolean;
};

/**
 * Activity catalog picker. Collapsible chrome optional; `embedded` shows body only.
 */
export function ActivityCatalogExpand({
  protocols,
  availableIds: initialIds,
  onAvailableIdsChange,
  expanded: controlledExpanded,
  onExpandedChange,
  defaultExpanded = false,
  embedded = false,
}: Props) {
  const { push } = useToast();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = embedded || (controlledExpanded ?? internalExpanded);

  function setExpanded(open: boolean) {
    if (controlledExpanded === undefined) setInternalExpanded(open);
    onExpandedChange?.(open);
  }

  const [query, setQuery] = useState("");
  const [pillar, setPillar] = useState<LwmPillarId | "all">("all");
  /** Default: show items not yet on the checklist (add more) */
  const [listFilter, setListFilter] = useState<"not_on" | "on" | "all">(
    "not_on",
  );
  const [, start] = useTransition();
  const [available, setAvailable] = useState(() => new Set(initialIds));

  useEffect(() => {
    setAvailable(new Set(initialIds));
  }, [initialIds]);

  const remaining = protocols.length - available.size;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return protocols.filter((p) => {
      if (listFilter === "not_on" && available.has(p.id)) return false;
      if (listFilter === "on" && !available.has(p.id)) return false;
      if (pillar !== "all" && pillarForCategory(p.category) !== pillar) {
        return false;
      }
      if (q) {
        const hay = `${p.name} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [protocols, query, pillar, listFilter, available]);

  const grouped = useMemo(() => {
    const map = new Map<LwmPillarId, Protocol[]>();
    for (const id of PILLAR_ORDER) map.set(id, []);
    for (const p of filtered) {
      map.get(pillarForCategory(p.category))?.push(p);
    }
    // Within pillar, keep seed category order
    for (const id of PILLAR_ORDER) {
      const list = map.get(id) ?? [];
      list.sort(
        (a, b) =>
          CATEGORY_ORDER.indexOf(a.category) -
            CATEGORY_ORDER.indexOf(b.category) ||
          a.sortOrder - b.sortOrder,
      );
    }
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
        push(wasOn ? `Removed “${name}”` : `Added to checklist: ${name}`);
      } catch (e) {
        setAvailable(new Set(available));
        onAvailableIdsChange?.([...available]);
        push(e instanceof Error ? e.message : "Could not update", "err");
      }
    });
  }

  const body = (
        <div className={cn("space-y-4", !embedded && "mt-4 border-t border-border pt-4")}>
          <p className="text-xs text-muted">
            {available.size === 0
              ? `Pick what you can do (${protocols.length} in catalog).`
              : `${available.size} on your checklist · ${remaining} more available.`}{" "}
            Toggle only what you can actually do (equipment, access).
          </p>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search catalog…"
              className="field-input w-full rounded-2xl py-2.5 pl-10 pr-10 text-sm"
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
              active={listFilter === "not_on"}
              onClick={() => setListFilter("not_on")}
              label="Not on list"
            />
            <Chip
              active={listFilter === "on"}
              onClick={() => setListFilter("on")}
              label="On list"
            />
            <Chip
              active={listFilter === "all"}
              onClick={() => setListFilter("all")}
              label="All"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Chip
              active={pillar === "all"}
              onClick={() => setPillar("all")}
              label="All pillars"
            />
            {LWM_PILLARS.map((p) => (
              <Chip
                key={p.id}
                active={pillar === p.id}
                onClick={() => setPillar(p.id)}
                label={p.label}
              />
            ))}
          </div>

          <div className="max-h-[min(28rem,50vh)] space-y-4 overflow-y-auto pr-0.5">
            {PILLAR_ORDER.map((pid) => {
              const list = grouped.get(pid) ?? [];
              if (list.length === 0) return null;
              const pillarMeta = LWM_PILLARS.find((x) => x.id === pid)!;
              return (
                <section key={pid}>
                  <h3 className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
                    {pillarMeta.label}
                  </h3>
                  <p className="mb-2 text-[11px] text-muted">{pillarMeta.blurb}</p>
                  <ul className="space-y-2">
                    {list.map((p) => {
                      const on = available.has(p.id);
                      const meta = getProtocolMeta(p.id);
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => toggle(p.id, p.name)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl border px-3 py-2.5 text-left transition",
                              on
                                ? "border-accent/40 bg-accent/10"
                                : "border-border bg-foreground/[0.02] hover:border-accent/25",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                                on
                                  ? "border-accent/50 bg-accent text-on-accent"
                                  : "border-border text-muted",
                              )}
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="text-sm font-medium leading-snug">
                                {p.name}
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                                {p.description}
                              </span>
                              {meta.how && (
                                <span className="mt-0.5 block text-[11px] leading-relaxed text-foreground/80">
                                  How: {meta.how}
                                </span>
                              )}
                              <span className="mt-1 block text-[10px] text-muted">
                                {p.points} pts · {CATEGORY_META[p.category].label}{" "}
                                · {equipmentLabel(meta.equipment)}
                                {on ? " · on checklist" : ""}
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
              <p className="py-6 text-center text-sm text-muted">
                No activities match.
              </p>
            )}
          </div>
        </div>
  );

  if (embedded) {
    return <div className="space-y-4">{body}</div>;
  }

  return (
    <div className="glass rounded-3xl p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={expanded}
      >
        <div>
          <p className="font-semibold">Browse all activities</p>
          <p className="mt-0.5 text-xs text-muted">
            {available.size === 0
              ? `Pick what you can do (${protocols.length} in catalog)`
              : `${available.size} on your list · ${remaining} more in catalog`}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && body}
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
        "shrink-0 rounded-full px-3 py-1.5 text-xs transition",
        active
          ? "bg-accent font-medium text-on-accent"
          : "border border-border text-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
