import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { PROTOCOL_SEEDS } from "@/db/seed-data";
import { formatPoints } from "@/lib/utils";

export default function HomePage() {
  const sample = PROTOCOL_SEEDS.slice(0, 4);
  const maxPoints = PROTOCOL_SEEDS.reduce((s, p) => s + p.points, 0);

  return (
    <div className="min-h-screen">
      <SiteHeader active="home" />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-accent">
              Lifestyle protocols · daily score
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Combat environmental stress with{" "}
              <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
                light-timed rituals
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Mitochondriapp helps you log Dr. Jack Kruse-inspired protocols —
              sunrise grounding, circadian light, cold, water, and nnEMF hygiene —
              organized by time of day. Earn points. See your history. Climb the
              leaderboard with other mitochondriacs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[#041016] transition hover:brightness-110"
              >
                Start tracking free
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-border px-5 py-2.5 text-sm text-muted transition hover:border-white/30 hover:text-white"
              >
                I already have an account
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div>
                <dt className="text-xs text-muted">Seed protocols</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {PROTOCOL_SEEDS.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Max day score</dt>
                <dd className="mt-1 text-2xl font-semibold">
                  {formatPoints(maxPoints)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Time blocks</dt>
                <dd className="mt-1 text-2xl font-semibold">7</dd>
              </div>
            </dl>
          </div>

          <div className="glass rounded-3xl p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Example sunrise block
            </p>
            <h2 className="mt-2 text-xl font-semibold">Click or drag to log</h2>
            <p className="mt-1 text-sm text-muted">
              Each protocol has a point value. Complete it once per day.
            </p>
            <ul className="mt-5 space-y-3">
              {sample.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl border border-border bg-black/20 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {p.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent-2/15 px-2 py-0.5 text-xs font-semibold text-accent-2">
                      +{p.points}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Time-of-day board",
              body: "Sunrise, morning, afternoon, evening, sunset, night, and anytime — protocols where they belong in the solar day.",
            },
            {
              title: "Points & leaderboard",
              body: "Bank points for each completed action. Compete on all-time and weekly boards without turning health into junk gamification.",
            },
            {
              title: "Built for Vercel",
              body: "Next.js App Router, Auth.js credentials, Neon Postgres, and Drizzle — ready for a free-tier deploy.",
            },
          ].map((card) => (
            <div key={card.title} className="glass rounded-3xl p-5">
              <h3 className="font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {card.body}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
