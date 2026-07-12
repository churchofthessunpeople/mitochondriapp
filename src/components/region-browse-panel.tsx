"use client";

import type { Region } from "@/db/schema";
import { RegionPicker } from "@/components/region-picker";
import type { OpenAppSheet } from "@/lib/app-sheets";

export function RegionBrowsePanel({
  regions,
  currentId,
  onOpenSheet,
}: {
  regions: Region[];
  currentId: string | null;
  onOpenSheet?: OpenAppSheet;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Optional override of the nearest-match score from your ZIP.{" "}
        {onOpenSheet ? (
          <button
            type="button"
            onClick={() => onOpenSheet({ id: "scoring" })}
            className="text-accent hover:underline"
          >
            How scoring works
          </button>
        ) : null}
      </p>
      <RegionPicker regions={regions} currentId={currentId} defaultExpanded />
    </div>
  );
}
