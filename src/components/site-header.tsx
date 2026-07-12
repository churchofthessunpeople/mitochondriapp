import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/today", label: "Today" },
  { href: "/history", label: "History" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export async function SiteHeader({
  active,
}: {
  active?: "today" | "history" | "leaderboard" | "home";
}) {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-[#070b12]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link href={session ? "/today" : "/"} className="flex min-w-0 items-center gap-2">
          <Image
            src="/icons/app-icon.jpg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10"
          />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold tracking-wide">
              Mitochondriapp
            </div>
            <div className="hidden text-[11px] text-muted sm:block">
              Light · Magnetism · Protocol
            </div>
          </div>
        </Link>

        {session ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  active === item.label.toLowerCase()
                    ? "bg-white/10 text-white"
                    : "text-muted hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button
                type="submit"
                className="ml-1 rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:border-white/30 hover:text-white"
              >
                Log out
              </button>
            </form>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:text-white"
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
      </div>
    </header>
  );
}
