"use client";

import { Lock, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Protocol, TimeOfDay } from "@/db/schema";
import {
  addToScheduleAction,
  removeFromScheduleAction,
} from "@/lib/actions/schedule";
import type { ScheduleEntry } from "@/lib/schedule";
import { canAssignToSlot } from "@/lib/schedule-rules";
import { TIME_OF_DAY_META, TIME_OF_DAY_ORDER } from "@/lib/time-of-day";
import { cn } from "@/lib/utils";

type Props = {
  entries: ScheduleEntry[];
  /** Only activities marked available for this user */
  catalog: Protocol[];
  availableCount?: number;
};

export function ScheduleEditor({ entries, catalog, availableCount }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slot, setSlot] = useState<TimeOfDay>("morning");

  const byTime = new Map<TimeOfDay, ScheduleEntry[]>();
  for (const tod of TIME_OF_DAY_ORDER) byTime.set(tod, []);
  for (const e of entries) byTime.get(e.timeOfDay)?.push(e);

  const assignedKeys = new Set(
    entries.map((e) => `${e.protocol.id}:${e.timeOfDay}`),
  );

  const addable = catalog.filter((p) => {
    if (!canAssignToSlot(p, slot)) return false;
    return !assignedKeys.has(`${p.id}:${slot}`);
  });

  function add(protocolId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await addToScheduleAction(protocolId, slot);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add activity");
      }
    });
  }

  function remove(scheduleId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await removeFromScheduleAction(scheduleId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not remove");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-5">
        <h2 className="text-lg font-semibold">Add activity to a time of day</h2>
        <p className="mt-1 text-sm text-muted">
          Showing your available list
          {availableCount != null ? ` (${availableCount})` : ""}. Sunrise/sunset
          locked items only go in those slots.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TIME_OF_DAY_ORDER.map((tod) => (
            <button
              key={tod}
              type="button"
              onClick={() => setSlot(tod)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition",
                slot === tod
                  ? "bg-accent text-on-accent"
                  : "border border-border text-muted hover:text-foreground",
              )}
            >
              {TIME_OF_DAY_META[tod].label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {addable.length === 0 ? (
            <li className="text-sm text-muted">
              Nothing left to add for {TIME_OF_DAY_META[slot].label}.
            </li>
          ) : (
            addable.map((p) => (
              <li
                key={p.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-foreground/[0.03] p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium">{p.name}</span>
                    {p.lockedTimeOfDay && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted">
                        <Lock className="h-2.5 w-2.5" />
                        {p.lockedTimeOfDay}
                      </span>
                    )}
                    {p.allowsMultiple && (
                      <span className="text-[10px] text-accent">multi</span>
                    )}
                    <span className="text-[10px] text-accent-2">+{p.points}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{p.description}</p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => add(p.id)}
                  className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-accent px-3 text-sm font-semibold text-on-accent disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {TIME_OF_DAY_ORDER.map((tod) => {
        const items = byTime.get(tod) ?? [];
        const meta = TIME_OF_DAY_META[tod];
        return (
          <section key={tod} className="glass rounded-3xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{meta.label}</h3>
                <p className="text-xs text-muted">{meta.blurb}</p>
              </div>
              <span className="text-xs text-muted">{items.length}</span>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-muted">No activities in this slot yet.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((e) => (
                  <li
                    key={e.scheduleId}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {e.protocol.name}
                      </p>
                      <p className="text-xs text-muted">
                        +{e.protocol.points}
                        {e.protocol.allowsMultiple ? " · multi" : ""}
                        {e.protocol.lockedTimeOfDay ? " · locked" : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => remove(e.scheduleId)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted hover:border-red-400/40 hover:text-red-400 disabled:opacity-50"
                      aria-label="Remove from schedule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
