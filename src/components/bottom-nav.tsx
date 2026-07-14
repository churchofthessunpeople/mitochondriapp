"use client";

import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/**
 * Main tabs live inside AppShell (/app) for instant client switching.
 * This global nav only shows on secondary pages (admin / region).
 */
export function BottomNav() {
  const pathname = usePathname();

  // Everything lives under /app shell; hide global bar almost everywhere
  if (
    pathname === "/" ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/place") ||
    pathname.startsWith("/activities") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/today") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/friends") ||
    pathname.startsWith("/reminders")
  ) {
    return null;
  }

  // Admin / region only
  return (
    <nav
      className="fixed inset-x-0 z-40 border-t border-border bg-[var(--header-bg)] pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
      style={{ bottom: "var(--site-disclaimer-offset)" }}
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg justify-center px-3 py-2">
        <a
          href={ROUTES.home}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-on-accent"
        >
          Back to app
        </a>
      </div>
    </nav>
  );
}
