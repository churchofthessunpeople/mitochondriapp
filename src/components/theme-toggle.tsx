"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const compact = size === "sm";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Dark mode on — switch to day" : "Light mode on — switch to night"}
      title={
        isDark
          ? "Day — warm parchment (low blue)"
          : "Night — firelight (low blue)"
      }
      onClick={toggleTheme}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card transition hover:border-accent/40 active:scale-[0.98]",
        compact ? "px-1.5 py-1" : "gap-2 px-2 py-1.5",
        className,
      )}
    >
      <Sun
        className={cn(
          "shrink-0 transition",
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
          !isDark ? "text-accent" : "text-muted/50",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "relative inline-flex shrink-0 rounded-full transition-colors",
          compact ? "h-5 w-9" : "h-6 w-11",
          isDark ? "bg-accent/35" : "bg-foreground/12",
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute top-0.5 rounded-full bg-foreground shadow-sm ring-1 ring-border/60 transition-transform",
            compact ? "h-4 w-4" : "h-5 w-5",
            isDark
              ? compact
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0.5",
          )}
        />
      </span>
      <Moon
        className={cn(
          "shrink-0 transition",
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
          isDark ? "text-accent" : "text-muted/50",
        )}
        aria-hidden
      />
    </button>
  );
}
