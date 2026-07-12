"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Region } from "@/db/schema";
import { setUserRegionAction } from "@/lib/actions/region";
import { ratingLabel } from "@/lib/regions";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

export function RegionPicker({
  regions,
  currentId,
  defaultExpanded = false,
}: {
  regions: Region[];
  currentId: string | null;
  defaultExpanded?: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [expanded, setExpanded] = useState(defaultExpanded);

  function select(id: string) {
    start(async () => {
      try {
        await setUserRegionAction(id);
        push("Region updated · timezone synced");
        setExpanded(false);
        router.refresh();
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not save", "err");
      }
    });
  }

  return (
    <div className="glass rounded-3xl p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={expanded}
      >
        <div>
          <p className="font-semibold">Browse all rated regions</p>
          <p className="mt-0.5 text-xs text-muted">
            Optional — override nearest match ({regions.length} places)
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <ul className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {regions.map((r) => {
            const active = r.id === currentId;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => select(r.id)}
                  className={cn(
                    "w-full rounded-2xl border p-3.5 text-left transition sm:p-4",
                    active
                      ? "border-accent/50 bg-accent/10"
                      : "border-border bg-foreground/[0.02] hover:border-accent/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-muted">
                        {r.country}
                        {r.locality ? ` · ${r.locality}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold tabular-nums text-accent">
                        {r.healthRating}
                        <span className="text-sm text-muted">/5</span>
                      </p>
                      <p className="text-[11px] text-accent-2">
                        {ratingLabel(r.healthRating)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted">
                    {r.summary}
                  </p>
                  <div className="mt-2 flex gap-3 text-[11px] text-muted">
                    <span>Sun {r.sunScore}</span>
                    <span>Magnetism {r.magnetismScore}</span>
                    <span>Policy {r.policyScore}</span>
                  </div>
                  {active && (
                    <p className="mt-2 text-xs font-medium text-accent">
                      Currently assigned
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
