"use client";

import { Check, ChevronDown, Minus, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import type { Protocol } from "@/db/schema";
import {
  ProtocolHowToButton,
  ProtocolHowToDialog,
} from "@/components/protocol-how-to-dialog";
import { useAppContentOptional } from "@/components/app-content-context";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import type { PermanentAutoLogSnap } from "@/lib/actions/favorites";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { isPermanentProtocol } from "@/lib/permanent-activities";
import {
  equipmentLabel,
  getProtocolMeta,
} from "@/lib/protocol-meta";
import { isCatalogSelectableProtocol } from "@/lib/scoring";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  protocols: Protocol[];
  availableIds: string[];
  onAvailableIdsChange?: (ids: string[]) => void;
  onPermanentAutoLog?: (snap: PermanentAutoLogSnap) => void;
  isAdmin?: boolean;
  onAdminEditContent?: (focus: string) => void;
};

function CollapsibleList({
  title,
  count,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-foreground/[0.02]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-2 px-3.5 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="text-sm font-semibold text-foreground">
            {title}
            <span className="ml-1.5 tabular-nums text-muted">({count})</span>
          </span>
          <span className="mt-0.5 block text-xs text-muted">{subtitle}</span>
        </span>
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="border-t border-border px-2 pb-2 pt-1">{children}</div>
      ) : null}
    </section>
  );
}

/**
 * Popout to add/remove checklist activities — not-on-list and on-list
 * sections both start collapsed.
 */
export function AddActivityDialog({
  open,
  onClose,
  protocols,
  availableIds: initialIds,
  onAvailableIdsChange,
  onPermanentAutoLog,
  isAdmin = false,
  onAdminEditContent,
}: Props) {
  const { push } = useToast();
  const content = useAppContentOptional();
  const categoryMeta = content?.categoryMeta ?? CATEGORY_META;
  const protocolMetaMap = content?.protocolMeta;
  const [, start] = useTransition();
  const [query, setQuery] = useState("");
  const [available, setAvailable] = useState(() => new Set(initialIds));
  const [howToFor, setHowToFor] = useState<Protocol | null>(null);
  const [notOnOpen, setNotOnOpen] = useState(false);
  const [onListOpen, setOnListOpen] = useState(false);

  const catalogProtocols = useMemo(
    () =>
      protocols
        .filter(isCatalogSelectableProtocol)
        .sort(
          (a, b) =>
            CATEGORY_ORDER.indexOf(a.category) -
              CATEGORY_ORDER.indexOf(b.category) ||
            a.sortOrder - b.sortOrder,
        ),
    [protocols],
  );

  useEffect(() => {
    if (open) {
      setAvailable(new Set(initialIds));
    }
  }, [open, initialIds]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setNotOnOpen(false);
      setOnListOpen(false);
    }
  }, [open]);

  const q = query.trim().toLowerCase();

  const matchesQuery = (p: Protocol) => {
    if (!q) return true;
    return `${p.name} ${p.description}`.toLowerCase().includes(q);
  };

  const notOnList = useMemo(
    () =>
      catalogProtocols.filter((p) => !available.has(p.id) && matchesQuery(p)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matchesQuery uses q
    [catalogProtocols, available, q],
  );

  const onList = useMemo(
    () =>
      catalogProtocols.filter((p) => available.has(p.id) && matchesQuery(p)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- matchesQuery uses q
    [catalogProtocols, available, q],
  );

  function toggle(protocolId: string, name: string) {
    const wasOn = available.has(protocolId);
    const previous = new Set(available);
    const next = new Set(available);
    if (wasOn) next.delete(protocolId);
    else next.add(protocolId);
    setAvailable(next);
    onAvailableIdsChange?.([...next]);
    push(wasOn ? `Removed “${name}”` : `Added to checklist: ${name}`);

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

  function renderRow(p: Protocol, mode: "add" | "remove") {
    const on = mode === "remove";
    const meta = getProtocolMeta(p.id, protocolMetaMap);
    return (
      <li key={p.id} className="flex items-stretch gap-1.5">
        <button
          type="button"
          onClick={() => toggle(p.id, p.name)}
          className={cn(
            "flex min-w-0 flex-1 items-start gap-3 rounded-2xl border px-3 py-2.5 text-left transition",
            on
              ? "border-accent/40 bg-accent/10"
              : "border-border bg-card hover:border-accent/25",
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
            {on ? (
              <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-sm font-medium leading-snug">{p.name}</span>
            <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
              {p.description}
            </span>
            <span className="mt-1 block text-[10px] text-muted">
              {p.points} pts · {categoryMeta[p.category].label} ·{" "}
              {equipmentLabel(meta.equipment)}
              {on ? " · tap to remove" : " · tap to add"}
            </span>
          </span>
          {on ? (
            <Check
              className="mt-1 h-4 w-4 shrink-0 text-accent"
              strokeWidth={2.5}
              aria-hidden
            />
          ) : null}
        </button>
        <ProtocolHowToButton
          protocol={p}
          size="sm"
          onClick={() => setHowToFor(p)}
          className="mt-2 self-start"
        />
      </li>
    );
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-activities-title"
        onClick={onClose}
      >
        <div
          className="glass flex max-h-[min(90vh,40rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p
                id="edit-activities-title"
                className="font-semibold leading-snug"
              >
                Edit activities
              </p>
              <p className="mt-1 text-xs text-muted">
                Expand a section to add activities or remove them from your
                checklist.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search activities…"
                className="field-input w-full rounded-2xl py-2.5 pl-10 pr-10 text-sm"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <CollapsibleList
              title="Not on your list"
              count={notOnList.length}
              subtitle="Tap an activity to add it to today’s checklist"
              open={notOnOpen}
              onToggle={() => setNotOnOpen((v) => !v)}
            >
              {notOnList.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted">
                  {q
                    ? "No matching activities to add."
                    : "Everything available is already on your list."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {notOnList.map((p) => renderRow(p, "add"))}
                </ul>
              )}
            </CollapsibleList>

            <CollapsibleList
              title="On your list"
              count={onList.length}
              subtitle="Tap an activity to remove it from your checklist"
              open={onListOpen}
              onToggle={() => setOnListOpen((v) => !v)}
            >
              {onList.length === 0 ? (
                <p className="px-2 py-4 text-center text-sm text-muted">
                  {q
                    ? "No matching activities on your list."
                    : "Nothing on your list yet — expand Not on your list to add."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {onList.map((p) => renderRow(p, "remove"))}
                </ul>
              )}
            </CollapsibleList>
          </div>

          <div className="shrink-0 border-t border-border px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-primary h-11 w-full rounded-2xl text-sm font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <ProtocolHowToDialog
        protocol={howToFor}
        onClose={() => setHowToFor(null)}
        isAdmin={isAdmin}
        onAdminEdit={
          howToFor && onAdminEditContent
            ? () => onAdminEditContent(`protocol:${howToFor.id}`)
            : undefined
        }
      />
    </>
  );
}
