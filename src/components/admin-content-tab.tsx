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
  getContentWriteStatusAction,
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

type MitoSectionDraft = { heading: string; body: string };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1 text-left">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "field-input w-full rounded-xl px-3 py-2 text-sm";

/** FormData → raw object; multi-value keys (checkboxes) become string[]. */
function formDataToRaw(fd: FormData): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    const all = fd.getAll(key).map(String);
    raw[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return raw;
}

function SectionsEditor({
  initial,
}: {
  initial: MitoSectionDraft[];
}) {
  const [sections, setSections] = useState<MitoSectionDraft[]>(
    initial.length > 0 ? initial : [{ heading: "Overview", body: "" }],
  );
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">Sections</span>
        <button
          type="button"
          className="text-xs text-accent"
          onClick={() =>
            setSections((prev) => [...prev, { heading: "", body: "" }])
          }
        >
          + Add section
        </button>
      </div>
      {sections.map((section, index) => (
        <div
          key={index}
          className="space-y-2 rounded-2xl border border-border p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">Section {index + 1}</span>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs text-muted disabled:opacity-30"
                disabled={index === 0}
                onClick={() =>
                  setSections((prev) => {
                    const next = [...prev];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    return next;
                  })
                }
              >
                Up
              </button>
              <button
                type="button"
                className="text-xs text-muted disabled:opacity-30"
                disabled={index >= sections.length - 1}
                onClick={() =>
                  setSections((prev) => {
                    const next = [...prev];
                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                    return next;
                  })
                }
              >
                Down
              </button>
              <button
                type="button"
                className="text-xs text-red-400 disabled:opacity-30"
                disabled={sections.length <= 1}
                onClick={() =>
                  setSections((prev) => prev.filter((_, i) => i !== index))
                }
              >
                Remove
              </button>
            </div>
          </div>
          <input
            name={showJson ? undefined : `sectionHeading_${index}`}
            value={section.heading}
            onChange={(e) =>
              setSections((prev) =>
                prev.map((s, i) =>
                  i === index ? { ...s, heading: e.target.value } : s,
                ),
              )
            }
            placeholder="Heading"
            className={inputClass}
            disabled={showJson}
          />
          <textarea
            name={showJson ? undefined : `sectionBody_${index}`}
            rows={4}
            value={section.body}
            onChange={(e) =>
              setSections((prev) =>
                prev.map((s, i) =>
                  i === index ? { ...s, body: e.target.value } : s,
                ),
              )
            }
            placeholder="Body"
            className={inputClass}
            disabled={showJson}
          />
        </div>
      ))}
      <button
        type="button"
        className="text-xs text-muted underline"
        onClick={() => setShowJson((v) => !v)}
      >
        {showJson ? "Hide advanced JSON" : "Advanced: raw JSON"}
      </button>
      {showJson ? (
        <textarea
          name="sectionsJson"
          rows={8}
          defaultValue={JSON.stringify(sections, null, 2)}
          className={cn(inputClass, "font-mono text-xs")}
        />
      ) : null}
    </div>
  );
}

function RelatedProtocolPicker({
  selected,
}: {
  selected: string[];
}) {
  const [options, setOptions] = useState<
    { id: string; name: string }[] | null
  >(null);
  const [filter, setFilter] = useState("");
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    void listAdminProtocolEditorsAction(false).then((rows) =>
      setOptions(rows.map((r) => ({ id: r.id, name: r.name }))),
    );
  }, []);

  const visible = useMemo(() => {
    if (!options) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q),
    );
  }, [options, filter]);

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted">Related activities</span>
      <input
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter activities…"
        className={inputClass}
      />
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-2xl border border-border p-2">
        {!options ? (
          <p className="px-1 py-2 text-xs text-muted">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="px-1 py-2 text-xs text-muted">No matches</p>
        ) : (
          visible.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm hover:bg-card"
            >
              <input
                type="checkbox"
                name="relatedProtocolIds"
                value={o.id}
                defaultChecked={selectedSet.has(o.id)}
              />
              <span className="min-w-0 truncate">
                {o.name}{" "}
                <span className="text-xs text-muted">({o.id})</span>
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

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
  const [writeStatus, setWriteStatus] = useState<{
    canWrite: boolean;
    message: string | null;
  } | null>(null);

  useEffect(() => {
    void getContentWriteStatusAction().then(setWriteStatus);
  }, []);

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
        Edit activities, articles, categories, and labels. Saves write to{" "}
        <code className="text-xs">content/</code> files in the repo (not the
        database). Commit and deploy for production. Deleted built-ins can be
        restored from Show deleted.
      </p>
      {writeStatus && !writeStatus.canWrite ? (
        <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          {writeStatus.message}
        </p>
      ) : writeStatus?.canWrite ? (
        <p className="rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-muted">
          File writes enabled — Save updates{" "}
          <code className="text-[11px]">content/*.json</code> on disk.
        </p>
      ) : null}
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
            push("Activity saved to content/activities.json");
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
            push("Activity created in content/activities.json");
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
        const raw = formDataToRaw(new FormData(e.currentTarget));
        // Prefer structured section fields over stale advanced JSON.
        if (
          Object.keys(raw).some((k) => k.startsWith("sectionHeading_")) &&
          typeof raw.sectionsJson === "string"
        ) {
          delete raw.sectionsJson;
        }
        run(async () => {
          try {
            await saveAdminMitoAction(editor.entry.id, raw);
            push("Article saved to content/articles/");
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
      <RelatedProtocolPicker
        selected={editor.entry.relatedProtocolIds ?? []}
      />
      <SectionsEditor initial={editor.entry.sections} />
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
  return (
    <form
      className="glass space-y-3 rounded-3xl p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = formDataToRaw(new FormData(e.currentTarget));
        if (
          Object.keys(raw).some((k) => k.startsWith("sectionHeading_")) &&
          typeof raw.sectionsJson === "string"
        ) {
          delete raw.sectionsJson;
        }
        run(async () => {
          try {
            const id = await createAdminMitoAction(raw);
            push("Article created in content/articles/");
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
      <RelatedProtocolPicker selected={[]} />
      <SectionsEditor
        initial={[{ heading: "Overview", body: "Add article content here." }]}
      />
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
