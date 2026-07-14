"use client";

import { Pencil } from "lucide-react";

export function AdminEditButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent transition hover:bg-accent/15"
      title={`Admin: edit ${label}`}
    >
      <Pencil className="h-3 w-3" />
      Edit
    </button>
  );
}
