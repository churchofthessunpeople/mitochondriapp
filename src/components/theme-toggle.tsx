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

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? "Switch to warm day (parchment)"
          : "Switch to warm night (firelight)"
      }
      title={
        isDark
          ? "Day — warm parchment (low blue)"
          : "Night — firelight (low blue)"
      }
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-accent/40 hover:text-accent active:scale-95",
        size === "sm" ? "h-9 w-9" : "h-10 w-10",
        className,
      )}
    >
      {isDark ? (
        <Sun className={size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} />
      ) : (
        <Moon className={size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"} />
      )}
    </button>
  );
}
