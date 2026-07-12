"use client";

import { History, LayoutList, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/today", label: "Today", icon: LayoutList },
  { href: "/history", label: "History", icon: History },
  { href: "/leaderboard", label: "Board", icon: Trophy },
  { href: "/account", label: "Account", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  const hide =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email");

  if (hide) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--header-bg)] pb-[max(0.35rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
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
