"use client";

import { ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  MITO_PILLAR_LABEL,
  MITOVERSITY_ENTRIES,
  type MitoEntry,
  type MitoPillar,
} from "@/lib/mitoversity";
import { useAppContentOptional } from "@/components/app-content-context";
import { AdminEditButton } from "@/components/admin-edit-button";
import { cn } from "@/lib/utils";

const PILLAR_FILTERS: { id: MitoPillar | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "light", label: "Light" },
  { id: "water", label: "Water" },
  { id: "magnetism", label: "Magnetism" },
  { id: "support", label: "Support" },
];

/**
 * Mitoversity: research-style lessons on mitochondrial lifestyle levers.
 * Expand entries in src/lib/mitoversity.ts.
 */
export function MitoversityHome({
  initialEntryId,
  isAdmin = false,
  onAdminEditContent,
}: {
  initialEntryId?: string | null;
  isAdmin?: boolean;
  onAdminEditContent?: (focus: string) => void;
}) {
  const content = useAppContentOptional();
  const allEntries = content?.mitoEntries ?? [...MITOVERSITY_ENTRIES];
  const intro =
    content?.mitoversityIntro ??
    "Stand-alone explainers on light, water, magnetism, and support habits for mitochondrial lifestyle tracking. Where a claim is specific to Dr. Jack Kruse's public teaching, it is cited as such.";
  const pillarLabels = content?.mitoPillarLabels ?? MITO_PILLAR_LABEL;

  const [pillar, setPillar] = useState<MitoPillar | "all">("all");
  const [titleQuery, setTitleQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(
    initialEntryId && allEntries.some((e) => e.id === initialEntryId)
      ? initialEntryId
      : null,
  );

  const entries = useMemo(() => {
    const q = titleQuery.trim().toLowerCase();
    return allEntries.filter((e) => {
      if (pillar !== "all" && e.pillar !== pillar) return false;
      if (q && !e.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [pillar, titleQuery, allEntries]);

  const openEntry = openId
    ? allEntries.find((e) => e.id === openId) ?? null
    : null;

  // Escape + body scroll lock while article is open
  useEffect(() => {
    if (!openEntry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openEntry]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">
          Learn
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Mitoversity
        </h1>
        <p className="mt-1.5 text-sm text-muted">{intro}</p>
        {isAdmin && onAdminEditContent && (
          <div className="mt-2">
            <AdminEditButton
              label="Mitoversity intro"
              onClick={() => onAdminEditContent("copy:mitoversity-intro")}
            />
          </div>
        )}
      </div>

      <label className="relative block">
        <span className="sr-only">Search articles by title</span>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={titleQuery}
          onChange={(e) => setTitleQuery(e.target.value)}
          placeholder="Search by title…"
          className="h-11 w-full rounded-2xl border border-border bg-foreground/[0.03] pl-10 pr-10 text-sm text-foreground placeholder:text-muted focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        {titleQuery ? (
          <button
            type="button"
            onClick={() => setTitleQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:bg-foreground/5 hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </label>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PILLAR_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setPillar(f.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
              pillar === f.id
                ? "bg-accent text-on-accent"
                : "border border-border text-muted hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="glass rounded-3xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted">
          {titleQuery.trim()
            ? `No articles match “${titleQuery.trim()}”.`
            : "No lessons in this category yet. Check back as Mitoversity grows."}
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <EntryListCard
                entry={entry}
                pillarLabel={pillarLabels[entry.pillar]}
                onOpen={() => setOpenId(entry.id)}
                isAdmin={isAdmin}
                onAdminEdit={
                  onAdminEditContent
                    ? () => onAdminEditContent(`mito:${entry.id}`)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-[11px] leading-relaxed text-muted">
        Educational only — not medical advice. Research summaries and lifestyle
        frameworks are for personal learning, not diagnosis or treatment.
      </p>

      {openEntry && (
        <ArticleModal
          entry={openEntry}
          pillarLabel={pillarLabels[openEntry.pillar]}
          onClose={() => setOpenId(null)}
          isAdmin={isAdmin}
          onAdminEdit={
            onAdminEditContent
              ? () => onAdminEditContent(`mito:${openEntry.id}`)
              : undefined
          }
        />
      )}
    </div>
  );
}

function EntryListCard({
  entry,
  pillarLabel,
  onOpen,
  isAdmin,
  onAdminEdit,
}: {
  entry: MitoEntry;
  pillarLabel: string;
  onOpen: () => void;
  isAdmin?: boolean;
  onAdminEdit?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="glass flex w-full items-start gap-3 rounded-3xl border border-border px-4 py-4 text-left transition hover:border-accent/35 sm:px-5"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
          {pillarLabel}
        </p>
        <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
          {entry.title}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          {entry.summary}
        </p>
      </div>
      <ChevronRight
        className="mt-1 h-5 w-5 shrink-0 text-muted"
        aria-hidden
      />
    </button>
  );
}

function ArticleModal({
  entry,
  pillarLabel,
  onClose,
  isAdmin,
  onAdminEdit,
}: {
  entry: MitoEntry;
  pillarLabel: string;
  onClose: () => void;
  isAdmin?: boolean;
  onAdminEdit?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mito-article-title"
      onClick={onClose}
    >
      <div
        className="glass flex max-h-[min(92dvh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-accent/25 shadow-xl sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
              {pillarLabel}
            </p>
            <h2
              id="mito-article-title"
              className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl"
            >
              {entry.title}
            </h2>
            {isAdmin && onAdminEdit && (
              <div className="mt-2">
                <AdminEditButton label={entry.title} onClick={onAdminEdit} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted transition hover:bg-foreground/5 hover:text-foreground"
            aria-label="Close article"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body — stays in view without page scroll hunting */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-sm leading-relaxed text-muted">{entry.summary}</p>
          <div className="mt-5 space-y-5">
            {entry.sections.map((s) => (
              <section key={s.heading} className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">
                  {s.heading}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{s.body}</p>
              </section>
            ))}
          </div>
          {entry.relatedProtocolIds && entry.relatedProtocolIds.length > 0 && (
            <p className="mt-6 text-[11px] text-muted">
              Related checklist habits:{" "}
              <span className="text-foreground/90">
                {entry.relatedProtocolIds.join(" · ")}
              </span>
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-border px-4 py-3 sm:px-5">
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
  );
}
