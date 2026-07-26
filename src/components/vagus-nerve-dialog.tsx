"use client";

import { Activity, X } from "lucide-react";
import { useMemo } from "react";
import type { Protocol } from "@/db/schema";
import { useAppContentOptional } from "@/components/app-content-context";
import {
  OptionListChoice,
  type ClickThroughOption,
} from "@/components/click-through-choice";
import {
  resolveVagusOptions,
  vagusModePoints,
  type VagusMode,
} from "@/lib/vagus-nerve";

type Props = {
  protocol: Protocol;
  pending?: boolean;
  onLog: (mode: VagusMode) => void;
  onCancel: () => void;
};

/**
 * Vagus nerve stimulation — pick cold face, baking soda water, or castor navel.
 */
export function VagusNerveDialog({
  protocol,
  pending,
  onLog,
  onCancel,
}: Props) {
  const content = useAppContentOptional();
  const modeOptions = useMemo(
    () =>
      resolveVagusOptions(
        content?.protocolMeta?.[protocol.id]?.options ??
          content?.protocolMeta?.["vagus-nerve-stimulation"]?.options,
      ),
    [content?.protocolMeta, protocol.id],
  );

  const options: ClickThroughOption[] = useMemo(
    () =>
      modeOptions.map((o) => ({
        id: o.id,
        title: o.label,
        subtitle: `${o.detail} · ${vagusModePoints(o.id, modeOptions)} pts`,
        highlight: o.id === "cold_face_immersion",
      })),
    [modeOptions],
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vagus-title"
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 shrink-0 text-accent" />
              <p id="vagus-title" className="font-semibold leading-snug">
                {protocol.name}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Which vagus-stimulating practice?
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <OptionListChoice
            options={options}
            disabled={pending}
            onChoose={(id) => onLog(id as VagusMode)}
          />
        </div>
      </div>
    </div>
  );
}
