import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/today");
  }

  return (
    <div className="welcome-screen flex min-h-dvh flex-col bg-white text-zinc-900">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))]">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 scale-110 rounded-[2rem] bg-zinc-100/80 blur-2xl" />
            <Image
              src="/icons/app-icon.jpg"
              alt="Mitochondriapp"
              width={128}
              height={128}
              priority
              className="relative h-28 w-28 rounded-[1.75rem] object-cover shadow-[0_12px_40px_rgba(15,23,42,0.12)] ring-1 ring-zinc-200/80 sm:h-32 sm:w-32"
            />
          </div>

          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-400">
            Black swan protocols
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Mitochondriapp
          </h1>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-zinc-500">
            Track light, grounding, and lifestyle protocols — one day at a time.
          </p>
        </div>

        <div className="mt-auto space-y-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-900 text-[15px] font-semibold text-white transition active:scale-[0.98] hover:bg-zinc-800"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white text-[15px] font-semibold text-zinc-900 transition active:scale-[0.98] hover:bg-zinc-50"
          >
            Sign in
          </Link>
          <p className="pt-2 text-center text-xs text-zinc-400">
            Daily logs · points · leaderboard
          </p>
        </div>
      </main>
    </div>
  );
}
