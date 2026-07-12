"use client";

import { CalendarCheck, ListChecks, MapPin, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

/** Schedule first — daily habit is the primary job. */
const items = [
  { href: "/schedule", label: "Schedule", icon: CalendarCheck },
  { href: "/place", label: "Place", icon: MapPin },
  { href: "/activities", label: "Activities", icon: ListChecks },
  { href: "/account", label: "Account", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  /** Optimistic highlight while the next tab's RSC loads */
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const hide =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/onboarding");

  if (hide) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--header-bg)] pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {items.map(({ href, label, icon: Icon }) => {
          const routeActive =
            pathname === href || pathname.startsWith(`${href}/`);
          const active =
            pendingHref != null
              ? pendingHref === href || pendingHref.startsWith(`${href}/`)
              : routeActive;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                onClick={(e) => {
                  if (routeActive) {
                    e.preventDefault();
                    return;
                  }
                  // Instant tab paint; navigation still soft-navigates in background
                  startTransition(() => {
                    setPendingHref(href);
                  });
                }}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium transition",
                  active ? "text-accent" : "text-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
