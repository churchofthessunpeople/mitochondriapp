"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  KRUSE_PILLAR_LABEL,
  KRUSEIVERSITY_ENTRIES,
  type KruseEntry,
  type KrusePillar,
} from "@/lib/kruseiversity";
import { cn } from "@/lib/utils";

const PILLAR_FILTERS: { id: KrusePillar | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "light", label: "Light" },
  { id: "water", label: "Water" },
  { id: "magnetism", label: "Magnetism" },
  { id: "support", label: "Support" },
];

/**
 * In-app “university”: why each habit matters in Kruse-style teaching.
 * Expand entries over time in src/lib/kruseiversity.ts.
 */
export function KruseiversityHome({
  initialEntryId,
}: {
  initialEntryId?: string | null;
}) {
  const [pillar, setPillar] = useState<KrusePillar | "all">("all");
  const [openId, setOpenId] = useState<string | null>(
    initialEntryId && getExists(initialEntryId) ? initialEntryId : null,
  );

  const entries = useMemo(() => {
    if (pillar === "all") return [...KRUSEIVERSITY_ENTRIES];
    return KRUSEIVERSITY_ENTRIES.filter((e) => e.pillar === pillar);
  }, [pillar]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">
          Learn
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Kruseiversity
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Why each action matters for mitochondrial function in Dr. Jack
          Kruse–style teaching. Short, expandable lessons—more entries coming.
        </p>
      </div>

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
          No lessons in this category yet. Check back as Kruseiversity grows.
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <EntryCard
                entry={entry}
                open={openId === entry.id}
                onToggle={() =>
                  setOpenId((cur) => (cur === entry.id ? null : entry.id))
                }
              />
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-[11px] leading-relaxed text-muted">
        Educational lifestyle framework only — not medical advice. Interpret
        teachings as public ideas about light, water, and magnetism, not as
        clinical instruction.
      </p>
    </div>
  );
}

function getExists(id: string) {
  return KRUSEIVERSITY_ENTRIES.some((e) => e.id === id);
}

function EntryCard({
  entry,
  open,
  onToggle,
}: {
  entry: KruseEntry;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "glass overflow-hidden rounded-3xl border transition",
        open ? "border-accent/35" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
            {KRUSE_PILLAR_LABEL[entry.pillar]}
          </p>
          <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
            {entry.title}
          </p>
          {!open && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {entry.summary}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <p className="text-sm leading-relaxed text-muted">{entry.summary}</p>
          {entry.sections.map((s) => (
            <section key={s.heading} className="space-y-1.5">
              <h3 className="text-sm font-semibold text-foreground">
                {s.heading}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{s.body}</p>
            </section>
          ))}
          {entry.relatedProtocolIds && entry.relatedProtocolIds.length > 0 && (
            <p className="text-[11px] text-muted">
              Related checklist habits:{" "}
              <span className="text-foreground/90">
                {entry.relatedProtocolIds.join(" · ")}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
