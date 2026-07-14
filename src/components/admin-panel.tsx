"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  deleteAdminUserAction,
  getAdminUserDetailAction,
  listAdminUsersAction,
  resetAdminUserPasswordAction,
  resetAllUserActivityAction,
  updateAdminUserAction,
  type AdminUserDetail,
  type AdminUserListItem,
} from "@/lib/actions/admin";
import { AdminContentTab } from "@/components/admin-content-tab";
import { useToast } from "@/components/toast";
import { cn, formatPoints } from "@/lib/utils";

type AdminTab = "users" | "content";

type AdminConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  action: () => void | Promise<void>;
};

export function AdminPanel({
  allowed,
  currentUserId,
  contentFocus,
}: {
  allowed: boolean;
  currentUserId: string;
  /** e.g. protocol:id or mito:id for inline edit deep link */
  contentFocus?: string | null;
}) {
  const [tab, setTab] = useState<AdminTab>("users");
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState<AdminConfirmRequest | null>(null);

  function requestConfirm(req: AdminConfirmRequest) {
    setConfirm(req);
  }

  function runConfirm() {
    if (!confirm) return;
    const action = confirm.action;
    setConfirm(null);
    start(async () => {
      try {
        await action();
      } catch (err) {
        push(err instanceof Error ? err.message : "Action failed", "err");
      }
    });
  }

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
    <div className="space-y-5">
      <div
        className="flex gap-1 rounded-2xl border border-border bg-foreground/[0.03] p-1"
        role="tablist"
        aria-label="Admin sections"
      >
        {(
          [
            { id: "users", label: "Users" },
            { id: "content", label: "Content" },
          ] as const
        ).map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-accent text-on-accent shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "users" ? (
        <AdminUsersTab
          currentUserId={currentUserId}
          requestConfirm={requestConfirm}
        />
      ) : (
        <AdminContentTab initialFocus={contentFocus} />
      )}

      <div className="glass space-y-3 rounded-3xl border border-red-500/20 p-5">
        <h2 className="font-semibold text-red-400">Danger zone</h2>
        <p className="text-xs leading-relaxed text-muted">
          Deletes every activity log, streak bonus row, and permanent skip for all
          users. Accounts, schedules, favorites, and protocols are kept.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            requestConfirm({
              title: "Reset all user activity?",
              message:
                "This permanently deletes every completion log, streak bonus, and permanent skip for all accounts. User profiles, schedules, and protocols are kept. This cannot be undone.",
              confirmLabel: "Reset all activity",
              danger: true,
              action: async () => {
                const res = await resetAllUserActivityAction();
                push(
                  `Cleared ${res.completionsDeleted} logs and ${res.skipsDeleted} skips`,
                );
              },
            })
          }
          className="h-11 w-full rounded-2xl border border-red-500/40 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          {pending ? "Resetting…" : "Reset all user activity"}
        </button>
      </div>

      <AdminConfirmDialog
        open={confirm != null}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmLabel={confirm?.confirmLabel ?? "Confirm"}
        danger={confirm?.danger}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  );
}

function AdminUsersTab({
  currentUserId,
  requestConfirm,
}: {
  currentUserId: string;
  requestConfirm: (req: AdminConfirmRequest) => void;
}) {
  const { push } = useToast();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<AdminUserListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );

  const reload = useCallback((q?: string) => {
    setError(null);
    listAdminUsersAction(q)
      .then(setRows)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load users"),
      );
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setGeneratedPassword(null);
      return;
    }
    setDetail(null);
    setGeneratedPassword(null);
    getAdminUserDetailAction(selectedId)
      .then(setDetail)
      .catch((e) =>
        push(e instanceof Error ? e.message : "Could not load profile", "err"),
      );
  }, [selectedId, push]);

  function search() {
    reload(query);
  }

  if (selectedId && detail) {
    return (
      <AdminUserEditor
        detail={detail}
        currentUserId={currentUserId}
        pending={pending}
        generatedPassword={generatedPassword}
        onBack={() => {
          setSelectedId(null);
          setGeneratedPassword(null);
          reload(query);
        }}
        onSave={(patch) => {
          start(async () => {
            try {
              await updateAdminUserAction({ userId: detail.id, ...patch });
              push("User updated");
              const next = await getAdminUserDetailAction(detail.id);
              setDetail(next);
              reload(query);
            } catch (err) {
              push(err instanceof Error ? err.message : "Update failed", "err");
            }
          });
        }}
        onResetPassword={() => {
          requestConfirm({
            title: "Reset password?",
            message: `Generate a new password for @${detail.username}. They will be signed out of all sessions.`,
            confirmLabel: "Reset password",
            action: async () => {
              const { password } = await resetAdminUserPasswordAction(detail.id);
              setGeneratedPassword(password);
              push("Password reset — copy it now");
            },
          });
        }}
        onDelete={() => {
          if (detail.id === currentUserId) {
            push("You cannot delete your own account", "err");
            return;
          }
          requestConfirm({
            title: "Delete user?",
            message: `Permanently delete @${detail.username}? This removes all their logs and reminders.`,
            confirmLabel: "Delete user",
            danger: true,
            action: async () => {
              await deleteAdminUserAction(detail.id);
              push("User deleted");
              setSelectedId(null);
              reload(query);
            },
          });
        }}
      />
    );
  }

  if (selectedId && !detail) {
    return <p className="text-sm text-muted">Loading profile…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Search, open a profile, edit fields, reset password, or delete.
      </p>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search username, name, or email"
          className="field-input min-w-0 flex-1 rounded-2xl px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="btn-secondary shrink-0 rounded-2xl px-4 text-sm font-semibold"
        >
          Search
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {rows === null && !error && (
        <p className="text-sm text-muted">Loading users…</p>
      )}

      {rows && rows.length === 0 && (
        <p className="text-sm text-muted">No users match.</p>
      )}

      {rows && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => setSelectedId(u.id)}
                className="glass flex w-full items-start justify-between gap-3 rounded-2xl p-3 text-left text-sm transition hover:border-accent/40"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {u.displayName || u.username}{" "}
                    <span className="text-muted">@{u.username}</span>
                    {u.isAdmin && (
                      <span className="ml-1.5 text-xs font-semibold text-accent">
                        admin
                      </span>
                    )}
                    {u.id === currentUserId && (
                      <span className="ml-1.5 text-xs text-muted">you</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatPoints(u.lifetimePoints)} pts · {u.completionCount}{" "}
                    logs
                    {u.placeLabel ? ` · ${u.placeLabel}` : ""}
                    {!u.onboardingComplete ? " · onboarding" : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-accent">View</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminUserEditor({
  detail,
  currentUserId,
  pending,
  generatedPassword,
  onBack,
  onSave,
  onResetPassword,
  onDelete,
}: {
  detail: AdminUserDetail;
  currentUserId: string;
  pending: boolean;
  generatedPassword: string | null;
  onBack: () => void;
  onSave: (patch: {
    displayName?: string;
    username?: string;
    email?: string;
    timezone?: string;
    isAdmin?: boolean;
    onboardingComplete?: boolean;
    showOnLeaderboard?: boolean;
    postalCode?: string;
    placeLabel?: string;
  }) => void;
  onResetPassword: () => void;
  onDelete: () => void;
}) {
  const [displayName, setDisplayName] = useState(detail.displayName ?? "");
  const [username, setUsername] = useState(detail.username);
  const [email, setEmail] = useState(detail.email ?? "");
  const [timezone, setTimezone] = useState(detail.timezone ?? "UTC");
  const [postalCode, setPostalCode] = useState(detail.postalCode ?? "");
  const [placeLabel, setPlaceLabel] = useState(detail.placeLabel ?? "");
  const [isAdmin, setIsAdmin] = useState(detail.isAdmin);
  const [onboardingComplete, setOnboardingComplete] = useState(
    detail.onboardingComplete,
  );
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(
    detail.showOnLeaderboard,
  );

  useEffect(() => {
    setDisplayName(detail.displayName ?? "");
    setUsername(detail.username);
    setEmail(detail.email ?? "");
    setTimezone(detail.timezone ?? "UTC");
    setPostalCode(detail.postalCode ?? "");
    setPlaceLabel(detail.placeLabel ?? "");
    setIsAdmin(detail.isAdmin);
    setOnboardingComplete(detail.onboardingComplete);
    setShowOnLeaderboard(detail.showOnLeaderboard);
  }, [detail]);

  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(detail.createdAt));

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-accent hover:underline"
      >
        ← All users
      </button>

      <div className="glass space-y-1 rounded-3xl p-4 text-sm">
        <p className="font-semibold tracking-tight">
          {detail.displayName || detail.username}
        </p>
        <p className="text-muted">
          @{detail.username} · member since {memberSince}
        </p>
        <p className="text-muted">
          {formatPoints(detail.lifetimePoints)} pts · {detail.completionCount}{" "}
          completions
          {detail.latitude != null && detail.longitude != null
            ? ` · ${detail.latitude.toFixed(2)}, ${detail.longitude.toFixed(2)}`
            : ""}
        </p>
        {detail.travelUntil && (
          <p className="text-xs text-accent">
            Travel until {detail.travelUntil}
            {detail.travelPlaceLabel ? ` · ${detail.travelPlaceLabel}` : ""}
          </p>
        )}
      </div>

      <form
        className="glass space-y-3 rounded-3xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            displayName,
            username,
            email,
            timezone,
            postalCode,
            placeLabel,
            isAdmin,
            onboardingComplete,
            showOnLeaderboard,
          });
        }}
      >
        <h2 className="font-semibold">Edit profile</h2>
        <Field label="Display name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="field-input w-full rounded-xl px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Username">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="field-input w-full rounded-xl px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Recovery email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input w-full rounded-xl px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Timezone">
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="field-input w-full rounded-xl px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Postal code">
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="field-input w-full rounded-xl px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Place label">
          <input
            value={placeLabel}
            onChange={(e) => setPlaceLabel(e.target.value)}
            className="field-input w-full rounded-xl px-3 py-2 text-sm"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAdmin}
            disabled={detail.id === currentUserId}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          Admin access
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onboardingComplete}
            onChange={(e) => setOnboardingComplete(e.target.checked)}
          />
          Onboarding complete
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showOnLeaderboard}
            onChange={(e) => setShowOnLeaderboard(e.target.checked)}
          />
          Show on public leaderboard
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn-primary h-11 w-full rounded-2xl font-semibold disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="glass space-y-3 rounded-3xl p-5">
        <h2 className="font-semibold">Password</h2>
        <p className="text-xs text-muted">
          Generates a strong password and signs the user out everywhere.
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={onResetPassword}
          className="btn-secondary h-11 w-full rounded-2xl text-sm font-semibold disabled:opacity-50"
        >
          Reset password
        </button>
        {generatedPassword && (
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-3 py-3">
            <p className="text-xs text-muted">Copy once — not shown again</p>
            <p className="mt-1 break-all font-mono text-sm text-accent">
              {generatedPassword}
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-accent hover:underline"
              onClick={() => {
                void navigator.clipboard.writeText(generatedPassword);
              }}
            >
              Copy to clipboard
            </button>
          </div>
        )}
      </div>

      {detail.id !== currentUserId && (
        <div className="glass space-y-3 rounded-3xl border border-red-500/20 p-5">
          <h2 className="font-semibold text-red-400">Danger zone</h2>
          <p className="text-xs text-muted">
            Permanently deletes this account and all related data.
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="h-11 w-full rounded-2xl border border-red-500/40 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            Delete user
          </button>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1 text-left">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className="glass w-full max-w-sm rounded-3xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
      >
        <h2
          id="admin-confirm-title"
          className={cn(
            "text-lg font-semibold",
            danger ? "text-red-400" : "text-foreground",
          )}
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="btn-secondary h-11 flex-1 rounded-2xl text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={cn(
              "h-11 flex-1 rounded-2xl text-sm font-semibold disabled:opacity-50",
              danger
                ? "border border-red-500/40 text-red-400 transition hover:bg-red-500/10"
                : "btn-primary",
            )}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
