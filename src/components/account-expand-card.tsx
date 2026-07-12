"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Collapsible glass card used on the Account home (same pattern as Place / catalog).
 */
export function AccountExpandCard({
  id,
  title,
  subtitle,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="glass overflow-hidden rounded-3xl" id={`account-${id}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-4 border-t border-border px-4 pb-4 pt-4 sm:px-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
