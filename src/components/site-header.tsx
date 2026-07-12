import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/today", label: "Today", key: "today" },
  { href: "/history", label: "History", key: "history" },
  { href: "/leaderboard", label: "Board", key: "leaderboard" },
  { href: "/account", label: "Account", key: "account" },
] as const;

export async function SiteHeader({
  active,
}: {
  active?:
    | "today"
    | "schedule"
    | "history"
    | "leaderboard"
    | "account"
    | "home";
}) {
  const session = await auth();

  return (
    <header
      className="sticky top-0 z-40 border-b border-border backdrop-blur-xl"
      style={{ background: "var(--header-bg)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <Link
          href={session ? "/today" : "/"}
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
              Light · Magnetism · Protocol
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
                    active === item.key
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
                className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-[#041016] transition hover:brightness-110"
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
