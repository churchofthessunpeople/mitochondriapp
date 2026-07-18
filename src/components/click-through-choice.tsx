"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ClickThroughOption = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  highlight?: boolean;
};

type ListProps = {
  options: readonly ClickThroughOption[];
  selectedId?: string;
  onChoose: (id: string) => void;
  disabled?: boolean;
  className?: string;
  footer?: ReactNode;
};

/** Full list of options — tap one to choose (no Next/Previous). */
export function OptionListChoice({
  options,
  selectedId,
  onChoose,
  disabled = false,
  className,
  footer,
}: ListProps) {
  if (options.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChoose(option.id)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition disabled:opacity-60",
              selected
                ? "border-accent/40 bg-accent/10 hover:bg-accent/15"
                : "border-border bg-foreground/[0.02] hover:border-accent/30",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {option.title}
              </span>
              {option.badge ? (
                <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  {option.badge}
                </span>
              ) : null}
            </div>
            {option.subtitle ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {option.subtitle}
              </p>
            ) : null}
          </button>
        );
      })}
      {footer}
    </div>
  );
}

type CarouselProps = {
  options: readonly ClickThroughOption[];
  /** Prefer starting on this option id when present */
  preferredId?: string;
  onChoose: (id: string) => void;
  disabled?: boolean;
  chooseLabel?: string;
  className?: string;
  footer?: ReactNode;
};

/**
 * Multi-choice UI that shows one option at a time.
 * Browse with Next/Previous, commit with Choose.
 */
export function ClickThroughChoice({
  options,
  preferredId,
  onChoose,
  disabled = false,
  chooseLabel = "Choose this",
  className,
  footer,
}: CarouselProps) {
  const startIndex = (() => {
    if (!preferredId) return 0;
    const i = options.findIndex((o) => o.id === preferredId);
    return i >= 0 ? i : 0;
  })();

  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex, options.length]);

  if (options.length === 0) return null;

  const safeIndex = Math.min(index, options.length - 1);
  const option = options[safeIndex]!;
  const multi = options.length > 1;

  function go(delta: number) {
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return options.length - 1;
      if (next >= options.length) return 0;
      return next;
    });
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {multi ? (
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Option {safeIndex + 1} of {options.length}
        </p>
      ) : null}

      <div
        className={cn(
          "rounded-2xl border px-4 py-5 text-left transition",
          option.highlight
            ? "border-accent/40 bg-accent/10"
            : "border-border bg-foreground/[0.02]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-base font-semibold text-foreground">
            {option.title}
          </span>
          {option.badge ? (
            <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
              {option.badge}
            </span>
          ) : null}
        </div>
        {option.subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {option.subtitle}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChoose(option.id)}
        className="btn-primary h-12 rounded-2xl text-sm font-semibold disabled:opacity-60"
      >
        {chooseLabel}
      </button>

      {multi ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => go(-1)}
            className="btn-secondary inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-2xl text-sm font-medium disabled:opacity-60"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => go(1)}
            className="btn-secondary inline-flex h-11 flex-1 items-center justify-center gap-1 rounded-2xl text-sm font-medium disabled:opacity-60"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {footer}
    </div>
  );
}
