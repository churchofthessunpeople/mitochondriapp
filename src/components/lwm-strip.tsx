"use client";

import type { Protocol } from "@/db/schema";
import type { OpenAppSheet } from "@/lib/app-sheets";
import { computeLwmProgress, LWM_PILLARS } from "@/lib/lwm";
import { cn } from "@/lib/utils";

type Props = {
  completionCounts: Record<string, number>;
  protocols: Protocol[];
  sunriseMultiplier: number;
  onOpenSheet?: OpenAppSheet;
};

const CORE = ["light", "water", "magnetism"] as const;

/**
 * Daily Light · Water · Magnetism progress strip.
 */
export function LwmStrip({
  completionCounts,
  protocols,
  sunriseMultiplier,
  onOpenSheet,
}: Props) {
  const progress = computeLwmProgress(completionCounts, protocols, {
    sunriseMultiplier,
  });

  const state: Record<"light" | "water" | "magnetism", boolean> = {
    light: progress.light,
    water: progress.water,
    magnetism: progress.magnetism,
  };

  const labels: Record<"light" | "water" | "magnetism", string> = {
    light: progress.lightLabel,
    water: progress.waterLabel,
    magnetism: progress.magnetismLabel,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Mitochondrial day · L · W · M
        </p>
        <p className="text-xs tabular-nums text-muted">
          {progress.doneCount}/3 pillars
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CORE.map((id) => {
          const meta = LWM_PILLARS.find((p) => p.id === id)!;
          const done = state[id];
          return (
            <button
              key={id}
              type="button"
              disabled={!onOpenSheet || !meta.sheetId}
              onClick={() => {
                if (meta.sheetId && onOpenSheet) {
                  onOpenSheet({ id: meta.sheetId });
                }
              }}
              className={cn(
                "rounded-2xl border px-2.5 py-2.5 text-left transition",
                done
                  ? "border-accent/40 bg-accent/10"
                  : "border-border bg-foreground/[0.02] hover:border-accent/25",
                onOpenSheet && meta.sheetId && "cursor-pointer",
              )}
              title={labels[id]}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wide",
                    done ? "text-accent" : "text-muted",
                  )}
                >
                  {meta.shortLabel}
                </span>
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold",
                    done
                      ? "bg-accent text-on-accent"
                      : "border border-border text-muted",
                  )}
                  aria-hidden
                >
                  {done ? "✓" : ""}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-xs font-medium leading-snug",
                  done ? "text-foreground" : "text-muted",
                )}
              >
                {meta.label}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted">
                {done ? labels[id] : meta.blurb}
              </p>
            </button>
          );
        })}
      </div>

      {progress.allThree ? (
        <p className="text-center text-xs font-medium text-accent">
          Full L · W · M day — environment stack logged
        </p>
      ) : (
        <p className="text-center text-[11px] text-muted">
          Tap a pillar to learn why · log keystones on the checklist
        </p>
      )}
    </div>
  );
}
