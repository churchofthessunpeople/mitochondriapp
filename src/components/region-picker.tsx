"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Region } from "@/db/schema";
import { setUserRegionAction } from "@/lib/actions/region";
import { ratingLabel } from "@/lib/regions";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

export function RegionPicker({
  regions,
  currentId,
}: {
  regions: Region[];
  currentId: string | null;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, start] = useTransition();

  function select(id: string) {
    start(async () => {
      try {
        await setUserRegionAction(id);
        push("Region updated · timezone synced");
        router.refresh();
      } catch (e) {
        push(e instanceof Error ? e.message : "Could not save", "err");
      }
    });
  }

  return (
    <ul className="space-y-3">
      {regions.map((r) => {
        const active = r.id === currentId;
        return (
          <li key={r.id}>
            <button
              type="button"
              disabled={pending}
              onClick={() => select(r.id)}
              className={cn(
                "w-full rounded-3xl border p-4 text-left transition",
                active
                  ? "border-accent/50 bg-accent/10"
                  : "border-border bg-card hover:border-accent/30",
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
                  <p className="text-2xl font-semibold tabular-nums text-accent">
                    {r.healthRating}
                    <span className="text-sm text-muted">/5</span>
                  </p>
                  <p className="text-[11px] text-accent-2">
                    {ratingLabel(r.healthRating)}
                  </p>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted">{r.summary}</p>
              <div className="mt-2 flex gap-3 text-[11px] text-muted">
                <span>Sun {r.sunScore}</span>
                <span>Magnetism {r.magnetismScore}</span>
                <span>Policy {r.policyScore}</span>
              </div>
              {active && (
                <p className="mt-2 text-xs font-medium text-accent">Selected</p>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
