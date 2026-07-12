import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Minimal chrome for secondary routes (docs, region browse, admin, day detail).
 * Always links home to /app — never the old multi-page nav.
 */
export function AppChrome({
  children,
  backHref = "/app",
  backLabel = "← Back to app",
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="min-h-screen pb-24 md:pb-16">
      <header
        className="sticky top-0 z-40 border-b border-border backdrop-blur-xl"
        style={{ background: "var(--header-bg)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
          <Link href="/app" className="flex min-w-0 items-center gap-2">
            <Image
              src="/icons/app-icon.jpg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
            />
            <span className="truncate text-sm font-semibold tracking-wide">
              Mitochondriapp
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="hidden rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-foreground sm:inline"
            >
              Today
            </Link>
            <Link
              href="/app?t=account"
              className="hidden rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-foreground sm:inline"
            >
              Account
            </Link>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href={backHref}
          className="text-sm text-accent hover:underline"
        >
          {backLabel}
        </Link>
        <div className="mt-3">{children}</div>
      </main>
    </div>
  );
}
