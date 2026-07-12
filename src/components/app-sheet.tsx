"use client";

/**
 * In-page card frame for secondary content (scoring, regions, day detail, admin).
 * Stays inside /app — never navigates away from Today/Account shell.
 */
export function AppSheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-accent hover:underline"
        >
          ← Back
        </button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
