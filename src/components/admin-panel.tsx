"use client";

import { useEffect, useState, useTransition } from "react";
import {
  deleteProtocolAction,
  listAdminProtocolsAction,
  upsertProtocolAction,
} from "@/lib/actions/admin";
import { CATEGORY_ORDER } from "@/lib/categories";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";
import { useToast } from "@/components/toast";

type CatalogRow = {
  id: string;
  name: string;
  category: string;
  points: number;
  active: boolean;
};

export function AdminPanel({ allowed }: { allowed: boolean }) {
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [catalog, setCatalog] = useState<CatalogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    listAdminProtocolsAction()
      .then(setCatalog)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load catalog"),
      );
  }

  useEffect(() => {
    if (!allowed) return;
    reload();
  }, [allowed]);

  if (!allowed) {
    return (
      <div className="glass rounded-3xl p-6 text-center">
        <h2 className="text-lg font-semibold">Admin only</h2>
        <p className="mt-2 text-sm text-muted">
          Set <code className="text-accent">is_admin</code> on your user or add
          your username to{" "}
          <code className="text-accent">ADMIN_USERNAMES</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">Create or update catalog activities.</p>

      <form
        className="glass space-y-3 rounded-3xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            try {
              await upsertProtocolAction(fd);
              push("Activity saved");
              e.currentTarget.reset();
              reload();
            } catch (err) {
              push(err instanceof Error ? err.message : "Save failed", "err");
            }
          });
        }}
      >
        <h2 className="font-semibold">Upsert activity</h2>
        <input
          name="id"
          required
          placeholder="id-slug"
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
        />
        <input
          name="name"
          required
          placeholder="Name"
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          name="description"
          required
          placeholder="Description"
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
          rows={3}
        />
        <input
          name="points"
          type="number"
          defaultValue={5}
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
        />
        <select
          name="category"
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
        >
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="timeOfDay"
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
        >
          {TIME_OF_DAY_ORDER.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="allowsMultiple" /> Multi-log
        </label>
        <input
          name="maxPerDay"
          type="number"
          defaultValue={5}
          className="field-input w-full rounded-xl px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="durationEnabled" /> Duration timer
        </label>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary h-11 w-full rounded-2xl font-semibold disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {catalog === null && !error && (
        <p className="text-sm text-muted">Loading catalog…</p>
      )}

      {catalog && (
        <ul className="space-y-2">
          {catalog.map((p) => (
            <li
              key={p.id}
              className="glass flex items-start justify-between gap-3 rounded-2xl p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {p.name}{" "}
                  {!p.active && (
                    <span className="text-xs text-red-400">inactive</span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {p.id} · {p.category} · +{p.points}
                </p>
              </div>
              {p.active && (
                <button
                  type="button"
                  disabled={pending}
                  className="text-xs text-red-400"
                  onClick={() => {
                    start(async () => {
                      try {
                        await deleteProtocolAction(p.id);
                        push("Disabled");
                        reload();
                      } catch (err) {
                        push(
                          err instanceof Error ? err.message : "Failed",
                          "err",
                        );
                      }
                    });
                  }}
                >
                  Disable
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
