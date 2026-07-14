"use client";

import { CircleHelp, X } from "lucide-react";
import type { Protocol } from "@/db/schema";
import { useAppContentOptional } from "@/components/app-content-context";
import { AdminEditButton } from "@/components/admin-edit-button";
import {
  equipmentLabel,
  getProtocolHowTo,
  getProtocolMeta,
} from "@/lib/protocol-meta";
import { cn } from "@/lib/utils";

type DialogProps = {
  protocol: Protocol | null;
  onClose: () => void;
  isAdmin?: boolean;
  onAdminEdit?: () => void;
};

export function ProtocolHowToDialog({
  protocol,
  onClose,
  isAdmin,
  onAdminEdit,
}: DialogProps) {
  const content = useAppContentOptional();
  if (!protocol) return null;

  const metaMap = content?.protocolMeta;
  const meta = getProtocolMeta(protocol.id, metaMap);
  const howTo = getProtocolHowTo(protocol, metaMap);
  const paragraphs = howTo.split(/\n\n+/).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-title"
      onClick={onClose}
    >
      <div
        className="glass max-h-[min(85vh,32rem)] w-full max-w-sm overflow-y-auto rounded-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p id="how-to-title" className="font-semibold leading-snug">
              {protocol.name}
            </p>
            <p className="mt-1 text-xs text-muted">
              {protocol.points} pts · {equipmentLabel(meta.equipment)}
            </p>
            {isAdmin && onAdminEdit && (
              <div className="mt-2">
                <AdminEditButton label={protocol.name} onClick={onAdminEdit} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
          How to
        </p>
        <div className="mt-2 space-y-2.5 text-sm leading-relaxed text-foreground/90">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-primary mt-5 h-11 w-full rounded-2xl text-sm font-semibold"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

type ButtonProps = {
  protocol: Protocol;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md";
};

export function ProtocolHowToButton({
  protocol,
  onClick,
  className,
  size = "md",
}: ButtonProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent/40 hover:text-accent",
        dim,
        className,
      )}
      aria-label={`How to: ${protocol.name}`}
      title="How to"
    >
      <CircleHelp className={icon} strokeWidth={2.25} />
    </button>
  );
}
