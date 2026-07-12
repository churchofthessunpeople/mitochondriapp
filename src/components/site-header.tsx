import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

/**
 * Legacy header for pages not yet fully folded into /app.
 * Nav only points at the SPA shell — never old multi-page routes.
 */
const nav = [
  { href: "/app", label: "Today", key: "today" },
  { href: "/app?t=account", label: "Account", key: "account" },
] as const;

export async function SiteHeader({
  active,
}: {
  active?: string;
}) {
  const session = await auth();
  const activeKey =
    active === "schedule" ||
    active === "place" ||
    active === "activities" ||
    active === "today" ||
    active === "home"
      ? "today"
      : active === "history" ||
          active === "leaderboard" ||
          active === "account"
        ? "account"
        : active;

  return (
    <header
      className="sticky top-0 z-40 border-b border-border backdrop-blur-xl"
      style={{ background: "var(--header-bg)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link
          href={session ? "/app" : "/"}
          className="flex min-w-0 items-center gap-2"
        >
          <Image
            src="/icons/app-icon.jpg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
          />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold tracking-wide text-foreground">
              Mitochondriapp
            </div>
            <div className="hidden text-[11px] text-muted sm:block">
              Light · Place · Protocol
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {session ? (
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-sm transition",
                    activeKey === item.key
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted hover:bg-foreground/5 hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="ml-0.5 shrink-0 rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:border-foreground/30 hover:text-foreground"
                >
                  Log out
                </button>
              </form>
            </nav>
          ) : (
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-on-accent transition hover:brightness-110"
              >
                Get started
              </Link>
            </nav>
          )}
          <ThemeToggle size="sm" className="ml-1 shrink-0" />
        </div>
      </div>
    </header>
  );
}
