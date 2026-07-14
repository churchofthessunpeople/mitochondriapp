"use client";

import { X } from "lucide-react";
import type { MitoEntry } from "@/lib/mitoversity";
import { AdminEditButton } from "@/components/admin-edit-button";

export function MitoArticleModal({
  entry,
  pillarLabel,
  onClose,
  isAdmin,
  onAdminEdit,
}: {
  entry: MitoEntry;
  pillarLabel: string;
  onClose: () => void;
  isAdmin?: boolean;
  onAdminEdit?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mito-article-title"
      onClick={onClose}
    >
      <div
        className="glass flex max-h-[min(92dvh,900px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-accent/25 shadow-xl sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
              {pillarLabel}
            </p>
            <h2
              id="mito-article-title"
              className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl"
            >
              {entry.title}
            </h2>
            {isAdmin && onAdminEdit && (
              <div className="mt-2">
                <AdminEditButton label={entry.title} onClick={onAdminEdit} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted transition hover:bg-foreground/5 hover:text-foreground"
            aria-label="Close article"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-sm leading-relaxed text-muted">{entry.summary}</p>
          <div className="mt-5 space-y-5">
            {entry.sections.map((s) => (
              <section key={s.heading} className="space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground">
                  {s.heading}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{s.body}</p>
              </section>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-border px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary h-11 w-full rounded-2xl text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
