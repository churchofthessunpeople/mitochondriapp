# Mitochondriapp

Track Dr. Jack Kruse–inspired lifestyle protocols — light, magnetism, water, cold, circadian timing — personalized to **what you can do** and **where you are**.

> What light-and-life actions matter for you, today, where you are — and a warm low-blue checklist to log them.

## Product

Full product intent and behavior (for editing / conforming the app): **[DESIGN.md](./DESIGN.md)**.

**Mission:** Stay on track with mitochondrial lifestyle levers — **Light · Water · Magnetism** — via protocols where you live.

| Surface | Role |
|---------|------|
| **Today** (`/app`) | LWM strip · Checklist · Place · Catalog (pillar-grouped) |
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
| `OPENCELLID_API_KEY` | Optional. OpenCelliD token for cell density; OSM masts/plants still work without it |
| `RESEND_API_KEY` | Required in production for password-reset email |
| `EMAIL_FROM` | Optional from address |
| `ALLOW_DEV_RESET_URL` | Local only: set `true` to return reset links when Resend is unset |

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
| `npm run admin:promote -- <username>` | Grant `is_admin` (needs `DATABASE_URL`) |

### Admin access

Admin is **only** the database `is_admin` flag — not usernames, not a browser cookie alone.
Promote yourself from a machine that already has your Neon `DATABASE_URL` (that credential is the real key):

```bash
npm run admin:promote -- yourusername
npm run admin:promote -- yourusername --revoke
```

A “key file on this PC” does not work well for a hosted web app: the server cannot read files on your laptop, and anything checked only in the browser can be copied. DB credentials (or a one-time promote script using them) are the right control.

## Health

`GET /api/health` — DB ping for deploys/canaries.

## Customizing activities (local catalog)

**Source of truth:** `src/db/seed-data.ts` (same idea as Mitoversity lessons).

1. Edit / add protocols in that file  
2. Restart the dev server (`npm run dev`)  
3. Open Catalog and enable the activity on your list  

Neon still stores **who logged what** (and favorites). Protocol definitions are
synced into the DB automatically so foreign keys work — you usually don’t need
`npm run db:seed` just to change the activity list.

Optional UX metadata (equipment / how-to): `src/lib/protocol-meta.ts`.

### Volcanic anchors (magnetism score)

Magnetism uses ~1k Holocene volcanoes + USGS US systems + arc/hotspot midpoints (`src/lib/volcanic-anchors.data.ts`).

To regenerate after refreshing source CSV/JSON under `data/volcano/`:

```bash
# GVP-derived Holocene list (TidyTuesday extract)
curl.exe -sL -o data/volcano/github_volcanoes.csv "https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2020/2020-05-12/volcano.csv"
# USGS US volcanoes
curl.exe -sL -o data/volcano/usgs_us.json "https://volcanoes.usgs.gov/hans-public/api/volcano/getUSVolcanoes"
npm run volcanoes:build
```

## Deploy

1. Push to GitHub → import on Vercel  
2. Set `DATABASE_URL`, `AUTH_SECRET`. Optionally set `AUTH_URL` to the **production** URL (not localhost). Auth uses `trustHost` so the request host is preferred.  
3. Run `npm run db:setup` and `npm run db:seed` against prod DB  

## License

Private / project use.
