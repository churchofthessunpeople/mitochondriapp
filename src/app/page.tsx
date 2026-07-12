import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/schedule");
  }

  return (
    <div className="welcome-screen flex min-h-dvh flex-col">
      <div className="flex justify-end px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <ThemeToggle size="sm" />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div
              className="absolute inset-0 scale-110 rounded-[2rem] blur-2xl"
              style={{ background: "color-mix(in srgb, var(--muted) 18%, transparent)" }}
            />
            <Image
              src="/icons/app-icon.jpg"
              alt="Mitochondriapp"
              width={128}
              height={128}
              priority
              className="relative h-28 w-28 rounded-[1.75rem] object-cover ring-1 ring-border sm:h-32 sm:w-32"
              style={{ boxShadow: "var(--shadow-icon)" }}
            />
          </div>

          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
            Black swan protocols
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-tight text-foreground sm:text-4xl">
            Mitochondriapp
          </h1>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-muted">
            Track light, grounding, and lifestyle protocols — one day at a time.
            Sign up with a username (no email needed).
          </p>
        </div>

        <div className="mt-auto space-y-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <Link
            href="/register"
            className="btn-primary flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition active:scale-[0.98] hover:opacity-90"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="btn-secondary flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition active:scale-[0.98] hover:bg-foreground/5"
          >
            Sign in
          </Link>
          <p className="pt-2 text-center text-xs text-muted">
            Daily logs · points · leaderboard
          </p>
        </div>
      </main>
    </div>
  );
}
