"use client";

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import {
  createAdminMitoAction,
  createAdminProtocolAction,
  deleteAdminMitoAction,
  deleteAdminProtocolAction,
  getAdminCopyEditorsAction,
  getAdminMitoEditorAction,
  getAdminProtocolEditorAction,
  listAdminCategoryEditorsAction,
  listAdminMitoEditorsAction,
  listAdminProtocolEditorsAction,
  resetAdminCategoryAction,
  resetAdminMitoOverrideAction,
  resetAdminProtocolOverridesAction,
  restoreAdminMitoAction,
  restoreAdminProtocolAction,
  saveAdminCategoryAction,
  saveAdminCopyAction,
  saveAdminMitoAction,
  saveAdminProtocolAction,
  type AdminMitoEditorData,
  type AdminProtocolEditorData,
} from "@/lib/actions/content-admin";
import { CATEGORY_ORDER } from "@/lib/categories";
import { TIME_OF_DAY_ORDER } from "@/lib/time-of-day";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";
import type { ProtocolCategory } from "@/db/schema";

type ContentTab = "activities" | "articles" | "categories" | "labels";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1 text-left">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "field-input w-full rounded-xl px-3 py-2 text-sm";

function matchesAdminSearch(
  query: string,
  ...parts: (string | number | boolean | null | undefined)[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = parts
    .filter((part) => part != null && part !== "")
    .map((part) => String(part))
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function AdminListSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input w-full rounded-2xl py-2.5 pl-10 pr-10 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  action: () => Promise<void>;
};

function ContentConfirmDialog({
  confirm,
  pending,
  onCancel,
  onConfirm,
}: {
  confirm: ConfirmRequest | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!confirm) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="glass w-full max-w-sm rounded-3xl p-5" role="dialog" aria-modal="true">
        <h2
          className={cn(
            "text-lg font-semibold",
            confirm.danger ? "text-red-400" : "text-foreground",
          )}
        >
          {confirm.title}
        </h2>
        <p className="mt-2 text-sm text-muted">{confirm.message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary h-11 flex-1 rounded-2xl text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={cn(
              "h-11 flex-1 rounded-2xl text-sm font-semibold disabled:opacity-50",
              confirm.danger
                ? "border border-red-500/40 text-red-400 hover:bg-red-500/10"
                : "btn-primary",
            )}
          >
            {pending ? "Working…" : confirm.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminContentTab({
  initialFocus,
}: {
  initialFocus?: string | null;
}) {
  const { push } = useToast();
  const [section, setSection] = useState<ContentTab>("activities");
  const [, start] = useTransition();
  const [pending, setPending] = useState(false);
  // Lifted so switching Content sub-tabs doesn't remount with a stale deep-link id.
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(
    null,
  );
  const [selectedMitoId, setSelectedMitoId] = useState<string | null>(null);
  const [focusApplied, setFocusApplied] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  function runConfirm() {
    if (!confirm) return;
    const action = confirm.action;
    setConfirm(null);
    setPending(true);
    start(async () => {
      try {
        await action();
      } finally {
        setPending(false);
      }
    });
  }

  function run(fn: () => Promise<void>) {
    setPending(true);
    start(async () => {
      try {
        await fn();
      } finally {
        setPending(false);
      }
    });
  }

  useEffect(() => {
    if (!initialFocus || focusApplied) return;
    if (initialFocus.startsWith("mito:")) {
      setSection("articles");
      setSelectedMitoId(initialFocus.slice(5));
    } else if (initialFocus.startsWith("protocol:")) {
      setSection("activities");
      setSelectedProtocolId(initialFocus.slice(9));
    } else if (initialFocus.startsWith("copy:")) {
      setSection("labels");
    }
    setFocusApplied(true);
  }, [initialFocus, focusApplied]);

  useEffect(() => {
    setSearchQuery("");
  }, [section]);

  const searchPlaceholder =
    section === "activities"
      ? "Search activities by name, id, or category…"
      : section === "articles"
        ? "Search articles by title, id, or pillar…"
        : section === "categories"
          ? "Search categories by id or label…"
          : "";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Edit, add, or delete activities and Mitoversity articles, plus category
        labels and copy. Deleted built-in entries can be restored from Show
        deleted. Changes apply immediately for all users.
      </p>
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-foreground/[0.03] p-1">
        {(
          [
            ["activities", "Activities"],
            ["articles", "Articles"],
            ["categories", "Categories"],
            ["labels", "Labels"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={cn(
              "shrink-0 rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm",
              section === id
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {searchPlaceholder && (
        <AdminListSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder}
        />
      )}
      {section === "activities" && (
        <ActivitiesSection
          pending={pending}
          run={run}
          push={push}
          selected={selectedProtocolId}
          onSelect={setSelectedProtocolId}
          requestConfirm={setConfirm}
          searchQuery={searchQuery}
        />
      )}
      {section === "articles" && (
        <ArticlesSection
          pending={pending}
          run={run}
          push={push}
          selected={selectedMitoId}
          onSelect={setSelectedMitoId}
          requestConfirm={setConfirm}
          searchQuery={searchQuery}
        />
      )}
      {section === "categories" && (
        <CategoriesSection
          pending={pending}
          run={run}
          push={push}
          searchQuery={searchQuery}
        />
      )}
      {section === "labels" && (
        <LabelsSection pending={pending} run={run} push={push} />
      )}
      <ContentConfirmDialog
        confirm={confirm}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  );
}

function ActivitiesSection({
  pending,
  run,
  push,
  selected,
  onSelect,
  requestConfirm,
  searchQuery,
}: {
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
  push: (m: string, t?: "err") => void;
  selected: string | null;
  onSelect: (id: string | null) => void;
  requestConfirm: (req: ConfirmRequest) => void;
  searchQuery: string;
}) {
  const [list, setList] = useState<
    | {
        id: string;
        name: string;
        category: string;
        points: number;
        deleted: boolean;
        isCustom: boolean;
      }[]
    | null
  >(null);
  const [editor, setEditor] = useState<AdminProtocolEditorData | null>(null);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  async function refreshList() {
    setList(await listAdminProtocolEditorsAction(showDeleted));
  }

  useEffect(() => {
    refreshList();
  }, [showDeleted]);

  useEffect(() => {
    if (creating || !selected) {
      setEditor(null);
      setLoadingEditor(false);
      return;
    }
    let cancelled = false;
    setLoadingEditor(true);
    setEditor(null);
    getAdminProtocolEditorAction(selected)
      .then((data) => {
        if (!cancelled) setEditor(data);
      })
      .catch((e) => {
        if (!cancelled) {
          push(e instanceof Error ? e.message : "Could not load activity", "err");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingEditor(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected, creating, push]);

  const filteredList = useMemo(() => {
    if (!list) return null;
    return list.filter((p) =>
      matchesAdminSearch(
        searchQuery,
        p.name,
        p.id,
        p.category,
        p.points,
        p.isCustom && "custom",
        p.deleted && "deleted",
      ),
    );
  }, [list, searchQuery]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            onSelect(null);
          }}
          className="btn-secondary h-10 w-full rounded-2xl text-sm font-semibold"
        >
          + Add activity
        </button>
        <label className="flex items-center gap-2 px-1 text-xs text-muted">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          />
          Show deleted
        </label>
        <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
          {filteredList?.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  onSelect(p.id);
                }}
                className={cn(
                  "glass w-full rounded-2xl p-3 text-left text-sm",
                  selected === p.id && !creating && "ring-2 ring-accent/50",
                )}
              >
                <span className="font-medium">{p.name}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {p.id} · +{p.points}
                  {p.isCustom ? " · custom" : ""}
                  {p.deleted ? " · deleted" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {list && filteredList && filteredList.length === 0 && (
          <p className="px-1 text-sm text-muted">No activities match your search.</p>
        )}
      </div>
      {creating ? (
        <CreateProtocolForm
          pending={pending}
          run={run}
          push={push}
          onCreated={async (id) => {
            await refreshList();
            setCreating(false);
            onSelect(id);
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <>
          {loadingEditor && (
            <p className="text-sm text-muted">Loading activity…</p>
          )}
          {editor && editor.id === selected && (
            <ProtocolForm
              key={editor.id}
              editor={editor}
              pending={pending}
              run={run}
              push={push}
              requestConfirm={requestConfirm}
              onSaved={async () => {
                await refreshList();
                const next = await getAdminProtocolEditorAction(editor.id);
                setEditor(next);
              }}
              onDeleted={async () => {
                await refreshList();
                onSelect(null);
                setEditor(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function ProtocolForm({
  editor,
  pending,
  run,
  push,
  requestConfirm,
  onSaved,
  onDeleted,
}: {
  editor: AdminProtocolEditorData;
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
  push: (m: string, t?: "err") => void;
  requestConfirm: (req: ConfirmRequest) => void;
  onSaved: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  return (
    <form
      className="glass space-y-3 rounded-3xl p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
        run(async () => {
          try {
            await saveAdminProtocolAction(editor.id, raw);
            push("Activity saved");
            await onSaved();
          } catch (err) {
            push(err instanceof Error ? err.message : "Save failed", "err");
          }
        });
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">
          {editor.isCustom ? "Edit custom activity" : "Edit activity"}
        </h2>
        <div className="flex gap-2">
          {editor.deleted && !editor.isCustom && (
            <button
              type="button"
              className="text-xs text-accent"
              onClick={() =>
                run(async () => {
                  await restoreAdminProtocolAction(editor.id);
                  push("Activity restored");
                  await onSaved();
                })
              }
            >
              Restore
            </button>
          )}
          {!editor.deleted && (
            <>
              {!editor.isCustom &&
                (editor.hasProtocolOverride || editor.hasMetaOverride) && (
                  <button
                    type="button"
                    className="text-xs text-muted"
                    onClick={() =>
                      run(async () => {
                        await resetAdminProtocolOverridesAction(editor.id);
                        push("Reset");
                        await onSaved();
                      })
                    }
                  >
                    Reset
                  </button>
                )}
              <button
                type="button"
                className="text-xs text-red-400"
                onClick={() =>
                  requestConfirm({
                    title: "Delete activity?",
                    message: editor.isCustom
                      ? "This permanently removes the custom activity from the catalog. Existing logs that reference it are kept."
                      : "This removes the activity from the catalog and this list. You can restore built-in activities from Show deleted.",
                    confirmLabel: "Delete",
                    danger: true,
                    action: async () => {
                      await deleteAdminProtocolAction(editor.id);
                      push("Activity deleted");
                      await onDeleted();
                    },
                  })
                }
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <Field label="Name">
        <input name="name" defaultValue={editor.merged.name} className={inputClass} />
      </Field>
      <Field label="How-to">
        <textarea
          name="how"
          rows={6}
          defaultValue={editor.meta.how ?? ""}
          className={inputClass}
        />
      </Field>
      <p className="text-xs text-muted">
        List cards show the first paragraph of how-to as a short preview.
      </p>
      <Field label="Mitoversity article id">
        <input
          name="articleId"
          defaultValue={editor.meta.articleId ?? ""}
          placeholder="e.g. solar-noon-vitamin-d"
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Points">
          <input
            name="points"
            type="number"
            defaultValue={editor.merged.points}
            className={inputClass}
          />
        </Field>
        <Field label="Sort">
          <input
            name="sortOrder"
            type="number"
            defaultValue={editor.merged.sortOrder}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Category">
        <select name="category" defaultValue={editor.merged.category} className={inputClass}>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Time of day">
        <select name="timeOfDay" defaultValue={editor.merged.timeOfDay} className={inputClass}>
          {TIME_OF_DAY_ORDER.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Equipment">
        <select name="equipment" defaultValue={editor.meta.equipment} className={inputClass}>
          <option value="none">No gear</option>
          <option value="optional">Optional</option>
          <option value="required">Required</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="allowsMultiple" defaultChecked={editor.merged.allowsMultiple} />
        Multi-log
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="durationEnabled" defaultChecked={editor.merged.durationEnabled} />
        Duration
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="permanent" defaultChecked={editor.merged.permanent} />
        Permanent
      </label>
      <button
        type="submit"
        disabled={pending || editor.deleted}
        className="btn-primary h-11 w-full rounded-2xl font-semibold"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function CreateProtocolForm({
  pending,
  run,
  push,
  onCreated,
  onCancel,
}: {
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
  push: (m: string, t?: "err") => void;
  onCreated: (id: string) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <form
      className="glass space-y-3 rounded-3xl p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
        run(async () => {
          try {
            const id = await createAdminProtocolAction(raw);
            push("Activity created");
            await onCreated(id);
          } catch (err) {
            push(err instanceof Error ? err.message : "Create failed", "err");
          }
        });
      }}
    >
      <div className="flex justify-between">
        <h2 className="font-semibold">New activity</h2>
        <button type="button" className="text-xs text-muted" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <Field label="Id (slug)">
        <input
          name="id"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          placeholder="my-new-activity"
          className={inputClass}
        />
      </Field>
      <Field label="Name">
        <input name="name" defaultValue="New activity" className={inputClass} />
      </Field>
      <Field label="How-to">
        <textarea
          name="how"
          rows={6}
          defaultValue="Describe what to do, step by step."
          className={inputClass}
        />
      </Field>
      <Field label="Mitoversity article id">
        <input
          name="articleId"
          placeholder="same-as-activity-id or existing article"
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Points">
          <input name="points" type="number" defaultValue={5} className={inputClass} />
        </Field>
        <Field label="Sort">
          <input name="sortOrder" type="number" defaultValue={500} className={inputClass} />
        </Field>
      </div>
      <Field label="Category">
        <select name="category" defaultValue="other" className={inputClass}>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Time of day">
        <select name="timeOfDay" defaultValue="anytime" className={inputClass}>
          {TIME_OF_DAY_ORDER.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Equipment">
        <select name="equipment" defaultValue="none" className={inputClass}>
          <option value="none">No gear</option>
          <option value="optional">Optional</option>
          <option value="required">Required</option>
        </select>
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="btn-primary h-11 w-full rounded-2xl font-semibold"
      >
        {pending ? "Creating…" : "Create activity"}
      </button>
    </form>
  );
}

function ArticlesSection({
  pending,
  run,
  push,
  selected,
  onSelect,
  requestConfirm,
  searchQuery,
}: {
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
  push: (m: string, t?: "err") => void;
  selected: string | null;
  onSelect: (id: string | null) => void;
  requestConfirm: (req: ConfirmRequest) => void;
  searchQuery: string;
}) {
  const [list, setList] = useState<
    | {
        id: string;
        title: string;
        pillar: string;
        deleted: boolean;
        isCustom: boolean;
      }[]
    | null
  >(null);
  const [editor, setEditor] = useState<AdminMitoEditorData | null>(null);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  async function refreshList() {
    setList(await listAdminMitoEditorsAction(showDeleted));
  }

  useEffect(() => {
    refreshList();
  }, [showDeleted]);

  useEffect(() => {
    if (creating || !selected) {
      setEditor(null);
      setLoadingEditor(false);
      return;
    }
    let cancelled = false;
    setLoadingEditor(true);
    setEditor(null);
    getAdminMitoEditorAction(selected)
      .then((data) => {
        if (!cancelled) setEditor(data);
      })
      .catch((e) => {
        if (!cancelled) {
          push(e instanceof Error ? e.message : "Could not load article", "err");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingEditor(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected, creating, push]);

  const filteredList = useMemo(() => {
    if (!list) return null;
    return list.filter((e) =>
      matchesAdminSearch(
        searchQuery,
        e.title,
        e.id,
        e.pillar,
        e.isCustom && "custom",
        e.deleted && "deleted",
      ),
    );
  }, [list, searchQuery]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            onSelect(null);
          }}
          className="btn-secondary h-10 w-full rounded-2xl text-sm font-semibold"
        >
          + Add article
        </button>
        <label className="flex items-center gap-2 px-1 text-xs text-muted">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
          />
          Show deleted
        </label>
        <ul className="max-h-[28rem] space-y-2 overflow-y-auto">
          {filteredList?.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  onSelect(e.id);
                }}
                className={cn(
                  "glass w-full rounded-2xl p-3 text-left text-sm",
                  selected === e.id && !creating && "ring-2 ring-accent/50",
                )}
              >
                <span className="font-medium">{e.title}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {e.id}
                  {e.isCustom ? " · custom" : ""}
                  {e.deleted ? " · deleted" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {list && filteredList && filteredList.length === 0 && (
          <p className="px-1 text-sm text-muted">No articles match your search.</p>
        )}
      </div>
      {creating ? (
        <CreateMitoForm
          pending={pending}
          run={run}
          push={push}
          onCreated={async (id) => {
            await refreshList();
            setCreating(false);
            onSelect(id);
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <>
          {loadingEditor && (
            <p className="text-sm text-muted">Loading article…</p>
          )}
          {editor && editor.entry.id === selected && (
            <MitoForm
              key={editor.entry.id}
              editor={editor}
              pending={pending}
              run={run}
              push={push}
              requestConfirm={requestConfirm}
              onSaved={async () => {
                await refreshList();
                setEditor(await getAdminMitoEditorAction(editor.entry.id));
              }}
              onDeleted={async () => {
                await refreshList();
                onSelect(null);
                setEditor(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function MitoForm({
  editor,
  pending,
  run,
  push,
  requestConfirm,
  onSaved,
  onDeleted,
}: {
  editor: AdminMitoEditorData;
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
  push: (m: string, t?: "err") => void;
  requestConfirm: (req: ConfirmRequest) => void;
  onSaved: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  return (
    <form
      className="glass space-y-3 rounded-3xl p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
        run(async () => {
          try {
            await saveAdminMitoAction(editor.entry.id, raw);
            push("Article saved");
            await onSaved();
          } catch (err) {
            push(err instanceof Error ? err.message : "Save failed", "err");
          }
        });
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">
          {editor.isCustom ? "Edit custom article" : "Edit article"}
        </h2>
        <div className="flex gap-2">
          {editor.deleted && !editor.isCustom && (
            <button
              type="button"
              className="text-xs text-accent"
              onClick={() =>
                run(async () => {
                  await restoreAdminMitoAction(editor.entry.id);
                  push("Article restored");
                  await onSaved();
                })
              }
            >
              Restore
            </button>
          )}
          {!editor.deleted && (
            <>
              {!editor.isCustom && editor.hasOverride && (
                <button
                  type="button"
                  className="text-xs text-muted"
                  onClick={() =>
                    run(async () => {
                      await resetAdminMitoOverrideAction(editor.entry.id);
                      push("Reset");
                      await onSaved();
                    })
                  }
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                className="text-xs text-red-400"
                onClick={() =>
                  requestConfirm({
                    title: "Delete article?",
                    message: editor.isCustom
                      ? "This permanently removes the custom article from Mitoversity."
                      : "This removes the article from Mitoversity and this list. You can restore built-in articles from Show deleted.",
                    confirmLabel: "Delete",
                    danger: true,
                    action: async () => {
                      await deleteAdminMitoAction(editor.entry.id);
                      push("Article deleted");
                      await onDeleted();
                    },
                  })
                }
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      <Field label="Title">
        <input name="title" defaultValue={editor.entry.title} className={inputClass} />
      </Field>
      <Field label="Summary">
        <textarea
          name="summary"
          rows={2}
          defaultValue={editor.entry.summary}
          className={inputClass}
        />
      </Field>
      <Field label="Pillar">
        <select name="pillar" defaultValue={editor.entry.pillar} className={inputClass}>
          <option value="light">light</option>
          <option value="water">water</option>
          <option value="magnetism">magnetism</option>
          <option value="support">support</option>
        </select>
      </Field>
      <Field label="Related activity ids (comma-separated)">
        <input
          name="relatedProtocolIds"
          defaultValue={editor.entry.relatedProtocolIds?.join(", ") ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Sections JSON">
        <textarea
          name="sectionsJson"
          rows={10}
          defaultValue={JSON.stringify(editor.entry.sections, null, 2)}
          className={cn(inputClass, "font-mono text-xs")}
        />
      </Field>
      <button
        type="submit"
        disabled={pending || editor.deleted}
        className="btn-primary h-11 w-full rounded-2xl font-semibold"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function CreateMitoForm({
  pending,
  run,
  push,
  onCreated,
  onCancel,
}: {
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
  push: (m: string, t?: "err") => void;
  onCreated: (id: string) => Promise<void>;
  onCancel: () => void;
}) {
  const defaultSections = JSON.stringify(
    [{ heading: "Overview", body: "Add article content here." }],
    null,
    2,
  );

  return (
    <form
      className="glass space-y-3 rounded-3xl p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
        run(async () => {
          try {
            const id = await createAdminMitoAction(raw);
            push("Article created");
            await onCreated(id);
          } catch (err) {
            push(err instanceof Error ? err.message : "Create failed", "err");
          }
        });
      }}
    >
      <div className="flex justify-between">
        <h2 className="font-semibold">New article</h2>
        <button type="button" className="text-xs text-muted" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <Field label="Id (slug)">
        <input
          name="id"
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          placeholder="my-new-article"
          className={inputClass}
        />
      </Field>
      <Field label="Title">
        <input name="title" defaultValue="New article" className={inputClass} />
      </Field>
      <Field label="Summary">
        <textarea name="summary" rows={2} defaultValue="Summary" className={inputClass} />
      </Field>
      <Field label="Pillar">
        <select name="pillar" defaultValue="support" className={inputClass}>
          <option value="light">light</option>
          <option value="water">water</option>
          <option value="magnetism">magnetism</option>
          <option value="support">support</option>
        </select>
      </Field>
      <Field label="Sections JSON">
        <textarea
          name="sectionsJson"
          rows={8}
          defaultValue={defaultSections}
          className={cn(inputClass, "font-mono text-xs")}
        />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="btn-primary h-11 w-full rounded-2xl font-semibold"
      >
        {pending ? "Creating…" : "Create article"}
      </button>
    </form>
  );
}

function CategoriesSection({
  pending,
  run,
  push,
  searchQuery,
}: {
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
  push: (m: string, t?: "err") => void;
  searchQuery: string;
}) {
  const [rows, setRows] = useState<
    | { id: ProtocolCategory; label: string; blurb: string; hasOverride: boolean }[]
    | null
  >(null);
  useEffect(() => {
    listAdminCategoryEditorsAction().then(setRows);
  }, []);

  const filteredRows = useMemo(() => {
    if (!rows) return null;
    return rows.filter((row) =>
      matchesAdminSearch(searchQuery, row.id, row.label, row.blurb),
    );
  }, [rows, searchQuery]);

  return (
    <div className="space-y-3">
      {filteredRows?.map((row) => (
        <form
          key={row.id}
          className="glass space-y-2 rounded-2xl p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(async () => {
              await saveAdminCategoryAction(row.id, String(fd.get("label")), String(fd.get("blurb")));
              push("Saved");
              setRows(await listAdminCategoryEditorsAction());
            });
          }}
        >
          <p className="text-xs text-muted">{row.id}</p>
          <input name="label" defaultValue={row.label} className={inputClass} />
          <textarea name="blurb" rows={2} defaultValue={row.blurb} className={inputClass} />
          <button type="submit" disabled={pending} className="btn-primary h-9 rounded-xl px-4 text-xs">
            Save
          </button>
          {row.hasOverride && (
            <button
              type="button"
              className="btn-secondary ml-2 h-9 rounded-xl px-4 text-xs"
              onClick={() =>
                run(async () => {
                  await resetAdminCategoryAction(row.id);
                  setRows(await listAdminCategoryEditorsAction());
                })
              }
            >
              Reset
            </button>
          )}
        </form>
      ))}
      {rows && filteredRows && filteredRows.length === 0 && (
        <p className="text-sm text-muted">No categories match your search.</p>
      )}
    </div>
  );
}

function LabelsSection({
  pending,
  run,
  push,
}: {
  pending: boolean;
  run: (fn: () => Promise<void>) => void;
  push: (m: string, t?: "err") => void;
}) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminCopyEditorsAction>> | null>(null);
  useEffect(() => {
    getAdminCopyEditorsAction().then(setData);
  }, []);
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <form
      className="glass space-y-2 rounded-2xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const intro = new FormData(e.currentTarget).get("mitoIntro");
        run(async () => {
          await saveAdminCopyAction("mitoversity-intro", String(intro));
          push("Saved");
          setData(await getAdminCopyEditorsAction());
        });
      }}
    >
      <h3 className="text-sm font-semibold">Mitoversity intro</h3>
      <textarea name="mitoIntro" rows={3} defaultValue={data.mitoIntro} className={inputClass} />
      <button type="submit" disabled={pending} className="btn-primary h-9 rounded-xl px-4 text-xs">
        Save
      </button>
    </form>
  );
}
