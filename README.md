# Mitochondriapp

Track Dr. Jack Kruse–inspired lifestyle protocols — light, magnetism, water, cold, circadian timing — personalized to **what you can do** and **where you are**.

> What light-and-life actions matter for you, today, where you are — and a warm low-blue checklist to log them.

## Product

Full product intent and behavior (for editing / conforming the app): **[DESIGN.md](./DESIGN.md)**.

| Surface | Role |
|---------|------|
| **Today** (`/app`) | SPA shell: Checklist · Place · Catalog |
| **Account** | History · boards · friends · reminders · profile (in-page tabs + sheets) |

- **Available / via list** — only show protocols you can actually do (e.g. rebounding if you have a rebounder)
- **Low-blue UI** — firelight night / parchment day (amber, not cyan)
- **Onboarding** — ZIP → starter activities → first log win
- Points, streaks, weekly light leaderboard, CSV export

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Auth.js** (NextAuth v5) username/password
- **Neon** Postgres + **Drizzle ORM**
- Deploy: **Vercel**

## Setup

```bash
npm install
```

Create `.env` / `.env.local`:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon Postgres |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | **Local only:** `http://localhost:3000`. On Vercel leave unset (or set your real prod URL) — never point prod at localhost |
| `RESEND_API_KEY` | Optional email |
| `EMAIL_FROM` | Optional from address |

```bash
npm run db:setup   # schema migrations (safe to re-run)
npm run db:seed    # protocols + regions
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run test` | Unit tests (sun times, scoring) |
| `npm run db:setup` | Apply SQL migrations |
| `npm run db:seed` | Seed catalog |

## Health

`GET /api/health` — DB ping for deploys/canaries.

## Customizing protocols

Edit `src/db/seed-data.ts`, then `npm run db:seed`.

Optional UX metadata (equipment / how-to) lives in `src/lib/protocol-meta.ts`.

## Deploy

1. Push to GitHub → import on Vercel  
2. Set `DATABASE_URL`, `AUTH_SECRET`. Optionally set `AUTH_URL` to the **production** URL (not localhost). Auth uses `trustHost` so the request host is preferred.  
3. Run `npm run db:setup` and `npm run db:seed` against prod DB  

## License

Private / project use.
