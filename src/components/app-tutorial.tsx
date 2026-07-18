"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useTransition,
} from "react";
import { markTutorialCompleteAction } from "@/lib/actions/auth";
import { getAppTourSteps, type TourStep } from "@/lib/app-tour";
import { cn } from "@/lib/utils";

type Placement =
  | "right"
  | "left"
  | "above-left"
  | "above-right"
  | "below-left"
  | "below-right";

type BubblePos = {
  top: number;
  left: number;
  width: number;
  placement: Placement;
};

type HighlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function findTourTarget(target: string): HTMLElement | null {
  const nodes = document.querySelectorAll(`[data-tour="${target}"]`);
  for (const el of nodes) {
    if (!(el instanceof HTMLElement)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return el;
  }
  return null;
}

function measureTarget(target: string): DOMRect | null {
  const el = findTourTarget(target);
  return el ? el.getBoundingClientRect() : null;
}

function overlaps(
  a: { top: number; left: number; width: number; height: number },
  b: DOMRect,
): boolean {
  return !(
    a.left + a.width < b.left ||
    a.left > b.right ||
    a.top + a.height < b.top ||
    a.top > b.bottom
  );
}

/**
 * Prefer side / corner placements so the bubble does not sit on top of the field.
 */
function computeBubble(rect: DOMRect): BubblePos {
  const width = Math.min(300, window.innerWidth - 24);
  const height = 176;
  const gap = 14;
  const margin = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(v, max));

  const candidates: { placement: Placement; top: number; left: number }[] = [
    {
      placement: "right",
      top: clamp(rect.top, margin, vh - height - margin),
      left: rect.right + gap,
    },
    {
      placement: "left",
      top: clamp(rect.top, margin, vh - height - margin),
      left: rect.left - gap - width,
    },
    {
      placement: "above-left",
      top: rect.top - gap - height,
      left: clamp(rect.left - width * 0.35, margin, vw - width - margin),
    },
    {
      placement: "above-right",
      top: rect.top - gap - height,
      left: clamp(rect.right - width * 0.65, margin, vw - width - margin),
    },
    {
      placement: "below-left",
      top: rect.bottom + gap,
      left: clamp(rect.left - width * 0.35, margin, vw - width - margin),
    },
    {
      placement: "below-right",
      top: rect.bottom + gap,
      left: clamp(rect.right - width * 0.65, margin, vw - width - margin),
    },
  ];

  let best = candidates[0]!;
  let bestScore = -Infinity;

  for (const c of candidates) {
    const box = { top: c.top, left: c.left, width, height };
    let score = 0;

    // Fully in viewport
    if (c.left >= margin && c.left + width <= vw - margin) score += 40;
    else score -= 80;
    if (c.top >= margin && c.top + height <= vh - margin) score += 40;
    else score -= 80;

    // Prefer not covering the target
    if (!overlaps(box, rect)) score += 60;
    else score -= 100;

    // Prefer side placements on wider screens
    if (c.placement === "right" || c.placement === "left") {
      score += vw >= 640 ? 25 : 8;
    }
    // Slight preference for left/above-left (reading direction, less thumb conflict)
    if (c.placement === "left" || c.placement === "above-left") score += 5;

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return {
    top: clamp(best.top, margin, Math.max(margin, vh - height - margin)),
    left: clamp(best.left, margin, Math.max(margin, vw - width - margin)),
    width,
    placement: best.placement,
  };
}

function Tail({ placement }: { placement: Placement }) {
  const base =
    "absolute h-3 w-3 rotate-45 border-accent/35 bg-[var(--header-bg)]";
  switch (placement) {
    case "right":
      return (
        <div
          className={cn(base, "-left-1.5 top-6 border-b border-l")}
          aria-hidden
        />
      );
    case "left":
      return (
        <div
          className={cn(base, "-right-1.5 top-6 border-r border-t")}
          aria-hidden
        />
      );
    case "above-left":
    case "above-right":
      return (
        <div
          className={cn(
            base,
            "-bottom-1.5 border-b border-r",
            placement === "above-left" ? "left-8" : "right-8",
          )}
          aria-hidden
        />
      );
    case "below-left":
    case "below-right":
    default:
      return (
        <div
          className={cn(
            base,
            "-top-1.5 border-l border-t",
            placement === "below-right" ? "right-8" : "left-8",
          )}
          aria-hidden
        />
      );
  }
}

export function AppTutorial({
  isGuest,
  onDone,
  onPrepareStep,
}: {
  isGuest: boolean;
  onDone: () => void;
  onPrepareStep: (step: TourStep) => void;
}) {
  const steps = getAppTourSteps(isGuest);
  const [index, setIndex] = useState(0);
  const [pending, start] = useTransition();
  const [bubble, setBubble] = useState<BubblePos | null>(null);
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);
  const step = steps[index]!;
  const isLast = index >= steps.length - 1;

  const layout = useCallback(() => {
    const rect = measureTarget(step.target);
    if (!rect) {
      setBubble({
        top: 72,
        left: 12,
        width: Math.min(300, window.innerWidth - 24),
        placement: "below-left",
      });
      setHighlight(null);
      return;
    }
    findTourTarget(step.target)?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    });
    // Remeasure after scroll settles slightly
    const afterScroll = () => {
      const r = measureTarget(step.target) ?? rect;
      const pad = 6;
      setHighlight({
        top: r.top - pad,
        left: r.left - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      });
      setBubble(computeBubble(r));
    };
    window.setTimeout(afterScroll, 120);
    afterScroll();
  }, [step]);

  useLayoutEffect(() => {
    onPrepareStep(step);
    const t = window.setTimeout(layout, 100);
    return () => window.clearTimeout(t);
  }, [step, onPrepareStep, layout]);

  useEffect(() => {
    window.addEventListener("resize", layout);
    window.addEventListener("scroll", layout, true);
    return () => {
      window.removeEventListener("resize", layout);
      window.removeEventListener("scroll", layout, true);
    };
  }, [layout]);

  function finish() {
    start(async () => {
      try {
        await markTutorialCompleteAction();
      } catch {
        /* still dismiss */
      }
      onDone();
    });
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]" aria-live="polite">
      {highlight && (
        <div
          className="pointer-events-none absolute rounded-2xl ring-2 ring-accent transition-all duration-200"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      )}
      {!highlight && (
        <div className="pointer-events-none absolute inset-0 bg-black/45" />
      )}

      {bubble && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-tour-title"
          className="pointer-events-auto absolute z-[81]"
          style={{
            top: bubble.top,
            left: bubble.left,
            width: bubble.width,
          }}
        >
          <div className="relative rounded-2xl border border-accent/35 bg-[var(--header-bg)] p-4 shadow-xl">
            <Tail placement={bubble.placement} />

            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
              Tour · {index + 1} / {steps.length}
            </p>
            <h2
              id="app-tour-title"
              className="mt-1 text-base font-semibold tracking-tight text-foreground"
            >
              {step.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {step.body}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={finish}
                disabled={pending}
                className="text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setIndex((i) => i - 1)}
                    className="btn-secondary h-9 rounded-xl px-3 text-xs font-semibold"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (isLast) finish();
                    else setIndex((i) => i + 1);
                  }}
                  className="btn-primary h-9 rounded-xl px-4 text-xs font-semibold disabled:opacity-60"
                >
                  {pending ? "…" : isLast ? "Done" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
