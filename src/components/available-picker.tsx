"use client";

import { Check, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Protocol, ProtocolCategory } from "@/db/schema";
import {
  ProtocolHowToButton,
  ProtocolHowToDialog,
} from "@/components/protocol-how-to-dialog";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import type { PermanentAutoLogSnap } from "@/lib/actions/favorites";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { isPermanentProtocol } from "@/lib/permanent-activities";
import { isCatalogSelectableProtocol } from "@/lib/scoring";
import { useToast } from "@/components/toast";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Props = {
  protocols: Protocol[];
  availableIds: string[];
  /** When set, "Today's checklist" switches tab instead of routing */
  onOpenSchedule?: () => void;
  /** Notify parent shell so Schedule tab updates without full navigation */
  onAvailableIdsChange?: (ids: string[]) => void;
  /** Sync checklist when a permanent auto-logs for today */
  onPermanentAutoLog?: (snap: PermanentAutoLogSnap) => void;
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
  onPermanentAutoLog,
}: Props) {
  const { push } = useToast();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProtocolCategory | "all">("all");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [, start] = useTransition();

  const [available, setAvailable] = useState(() => new Set(initialIds));
  const [howToFor, setHowToFor] = useState<Protocol | null>(null);

  const catalogProtocols = useMemo(
    () => protocols.filter(isCatalogSelectableProtocol),
    [protocols],
  );

  useEffect(() => {
    setAvailable(new Set(initialIds));
  }, [initialIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalogProtocols.filter((p) => {
      if (showOnlyAvailable && !available.has(p.id)) return false;
      if (category !== "all" && p.category !== category) return false;
      if (q) {
        const hay = `${p.name} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [catalogProtocols, query, category, showOnlyAvailable, available]);

  const grouped = useMemo(() => {
    const map = new Map<ProtocolCategory, Protocol[]>();
    for (const c of CATEGORY_ORDER) map.set(c, []);
    for (const p of filtered) map.get(p.category)?.push(p);
    return map;
  }, [filtered]);

  function toggle(protocolId: string, name: string) {
    const wasOn = available.has(protocolId);
    const previous = new Set(available);
    const next = new Set(available);
    if (wasOn) next.delete(protocolId);
    else next.add(protocolId);
    setAvailable(next);
    onAvailableIdsChange?.([...next]);
    push(wasOn ? `Removed “${name}”` : `Available: ${name}`);

    const protocol = catalogProtocols.find((p) => p.id === protocolId);
    if (!wasOn && protocol && isPermanentProtocol(protocol)) {
      onPermanentAutoLog?.({
        protocolId,
        count: 1,
        dayPoints: 0,
        streak: { current: 0, best: 0 },
      });
    }

    start(async () => {
      try {
        const res = await toggleFavoriteAction(protocolId);
        if (res.autoLogged) {
          onPermanentAutoLog?.(res.autoLogged);
        }
      } catch (e) {
        setAvailable(previous);
        onAvailableIdsChange?.([...previous]);
        push(e instanceof Error ? e.message : "Could not update", "err");
      }
    });
  }

  return (
    <div className="space-y-5 pb-28">
      <div className="glass rounded-3xl p-4 text-sm text-muted">
        <p>
          Toggle what <strong className="text-foreground">you</strong> can do.
          Example: rebounding only if you have a rebounder.{" "}
          <strong className="text-foreground">Permanent</strong> activities
          (e.g. Magnetico sleep pad) auto-log every day while they stay on your
          list.
        </p>
        <p className="mt-2">
          <span className="font-medium text-accent">{available.size}</span> of{" "}
          {catalogProtocols.length} available
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
                <Link href={ROUTES.home} className="text-accent hover:underline">
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
                  <li key={p.id} className="flex items-stretch gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggle(p.id, p.name)}
                      className={cn(
                        "flex min-w-0 flex-1 items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition",
                        on
                          ? "border-accent/40 bg-accent/10"
                          : "border-border bg-card hover:border-accent/25",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                          on
                            ? "border-accent/50 bg-accent text-on-accent"
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
                          {isPermanentProtocol(p) ? " · permanent" : ""}
                          {on ? " · available to you" : ""}
                        </span>
                      </span>
                    </button>
                    <ProtocolHowToButton
                      protocol={p}
                      size="sm"
                      onClick={() => setHowToFor(p)}
                      className="mt-3 self-start"
                    />
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
      <ProtocolHowToDialog
        protocol={howToFor}
        onClose={() => setHowToFor(null)}
      />
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
          ? "bg-accent font-medium text-on-accent"
          : "border border-border text-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
