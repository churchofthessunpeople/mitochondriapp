"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  CloudSun,
  GripVertical,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Check,
} from "lucide-react";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { Protocol, TimeOfDay } from "@/db/schema";
import { toggleCompletionAction } from "@/lib/actions/completions";
import { TIME_OF_DAY_META, TIME_OF_DAY_ORDER } from "@/lib/time-of-day";
import { cn, formatPoints } from "@/lib/utils";

const ICONS = {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Sparkles,
} as const;

type BoardProps = {
  protocols: Protocol[];
  completedIds: string[];
  date: string;
  dayPoints: number;
};

export function ProtocolBoard({
  protocols,
  completedIds,
  date,
  dayPoints,
}: BoardProps) {
  const [optimisticCompleted, setOptimistic] = useOptimistic(
    new Set(completedIds),
    (current: Set<string>, protocolId: string) => {
      const next = new Set(current);
      if (next.has(protocolId)) next.delete(protocolId);
      else next.add(protocolId);
      return next;
    },
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const byTime = useMemo(() => {
    const map = new Map<TimeOfDay, Protocol[]>();
    for (const tod of TIME_OF_DAY_ORDER) map.set(tod, []);
    for (const p of protocols) {
      map.get(p.timeOfDay)?.push(p);
    }
    return map;
  }, [protocols]);

  const protocolMap = useMemo(
    () => new Map(protocols.map((p) => [p.id, p])),
    [protocols],
  );

  const optimisticPoints = useMemo(() => {
    return protocols
      .filter((p) => optimisticCompleted.has(p.id))
      .reduce((sum, p) => sum + p.points, 0);
  }, [protocols, optimisticCompleted]);

  const completedCount = optimisticCompleted.size;
  const totalCount = protocols.length;

  function toggle(protocolId: string) {
    startTransition(async () => {
      setOptimistic(protocolId);
      // Date is determined server-side (today only) — never trust the client
      await toggleCompletionAction(protocolId);
    });
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const protocolId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    setActiveId(null);

    if (!overId) return;

    // Dropping onto "done-today" completes; onto "available" uncompletes.
    if (overId === "zone-done" && !optimisticCompleted.has(protocolId)) {
      toggle(protocolId);
    }
    if (overId === "zone-available" && optimisticCompleted.has(protocolId)) {
      toggle(protocolId);
    }
    // Dropping on matching time section also toggles toward completed
    if (overId.startsWith("section-") && !optimisticCompleted.has(protocolId)) {
      toggle(protocolId);
    }
  }

  const activeProtocol = activeId ? protocolMap.get(activeId) : null;
  const available = protocols.filter((p) => !optimisticCompleted.has(p.id));
  const done = protocols.filter((p) => optimisticCompleted.has(p.id));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Today's points" value={formatPoints(optimisticPoints)} hint={`baseline ${formatPoints(dayPoints)}`} />
        <StatCard
          label="Protocols logged"
          value={`${completedCount}/${totalCount}`}
          hint="Click a card or drag into Done"
        />
        <StatCard
          label="Completion"
          value={`${totalCount ? Math.round((completedCount / totalCount) * 100) : 0}%`}
          hint="One point bank per protocol per day"
        />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-4">
            {TIME_OF_DAY_ORDER.map((tod) => {
              const items = byTime.get(tod) ?? [];
              if (items.length === 0) return null;
              return (
                <TimeSection
                  key={tod}
                  timeOfDay={tod}
                  protocols={items}
                  completed={optimisticCompleted}
                  onToggle={toggle}
                />
              );
            })}
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <DropZone
              id="zone-done"
              title="Done today"
              empty="Drag completed protocols here"
              count={done.length}
              accent
            >
              {done.map((p) => (
                <ProtocolCard
                  key={p.id}
                  protocol={p}
                  completed
                  onToggle={() => toggle(p.id)}
                />
              ))}
            </DropZone>

            <DropZone
              id="zone-available"
              title="Still available"
              empty="Everything logged — strong day"
              count={available.length}
            >
              {available.slice(0, 6).map((p) => (
                <ProtocolCard
                  key={p.id}
                  protocol={p}
                  completed={false}
                  onToggle={() => toggle(p.id)}
                  compact
                />
              ))}
              {available.length > 6 && (
                <p className="px-1 text-xs text-muted">
                  +{available.length - 6} more in the sections
                </p>
              )}
            </DropZone>
          </div>
        </div>

        <DragOverlay>
          {activeProtocol ? (
            <ProtocolCard
              protocol={activeProtocol}
              completed={optimisticCompleted.has(activeProtocol.id)}
              onToggle={() => undefined}
              overlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function TimeSection({
  timeOfDay,
  protocols,
  completed,
  onToggle,
}: {
  timeOfDay: TimeOfDay;
  protocols: Protocol[];
  completed: Set<string>;
  onToggle: (id: string) => void;
}) {
  const meta = TIME_OF_DAY_META[timeOfDay];
  const Icon = ICONS[meta.icon as keyof typeof ICONS] ?? Sparkles;
  const { setNodeRef, isOver } = useDroppable({ id: `section-${timeOfDay}` });
  const doneCount = protocols.filter((p) => completed.has(p.id)).length;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "glass overflow-hidden rounded-3xl border bg-gradient-to-br p-4 sm:p-5",
        meta.accent,
        isOver && "drop-highlight",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-foreground/5 p-2">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{meta.label}</h2>
            <p className="text-sm text-muted">{meta.blurb}</p>
          </div>
        </div>
        <div className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-muted">
          {doneCount}/{protocols.length}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {protocols.map((protocol) => (
          <ProtocolCard
            key={protocol.id}
            protocol={protocol}
            completed={completed.has(protocol.id)}
            onToggle={() => onToggle(protocol.id)}
          />
        ))}
      </div>
    </section>
  );
}

function DropZone({
  id,
  title,
  empty,
  count,
  children,
  accent,
}: {
  id: string;
  title: string;
  empty: string;
  count: number;
  children: React.ReactNode;
  accent?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "glass min-h-[180px] rounded-3xl p-4",
        accent && "border-accent/30",
        isOver && "drop-highlight",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
        <span className="text-xs text-muted">{count}</span>
      </div>
      <div className="space-y-2">
        {count === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-3 py-8 text-center text-sm text-muted">
            {empty}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function ProtocolCard({
  protocol,
  completed,
  onToggle,
  compact,
  overlay,
}: {
  protocol: Protocol;
  completed: boolean;
  onToggle: () => void;
  compact?: boolean;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: protocol.id,
      disabled: overlay,
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        "protocol-card group rounded-2xl border border-border bg-foreground/[0.04] p-3",
        completed && "completed",
        isDragging && "dragging",
        overlay && "shadow-2xl shadow-black/30",
        compact && "p-2.5",
      )}
    >
      <div className="flex items-start gap-2">
        {!overlay && (
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none rounded-md p-1 text-muted opacity-70 transition hover:bg-foreground/5 hover:opacity-100 active:cursor-grabbing"
            aria-label="Drag protocol"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]",
                    completed
                      ? "border-accent bg-accent text-[#041016]"
                      : "border-border text-transparent",
                  )}
                >
                  <Check className="h-3 w-3" />
                </span>
                <h4
                  className={cn(
                    "text-sm font-medium leading-snug",
                    completed && "text-accent",
                  )}
                >
                  {protocol.name}
                </h4>
              </div>
              {!compact && (
                <p className="mt-1.5 pl-7 text-xs leading-relaxed text-muted">
                  {protocol.description}
                </p>
              )}
            </div>
            <span className="shrink-0 rounded-full bg-accent-2/15 px-2 py-0.5 text-xs font-semibold text-accent-2">
              +{protocol.points}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
