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
| `npm run db:cleanup-guests` | Delete guest accounts older than 24h (converted accounts kept) |

Guest rows (`is_guest`) older than a day are purged automatically: on each new guest start, via daily Vercel cron (`/api/cron/cleanup-guests`), or the script above. Set `CRON_SECRET` in Vercel so the cron route can authorize.

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

## Customizing activities & articles

**Catalog is not authored in Neon.**

| Layer | Where |
|-------|--------|
| Activities | `content/activities.json` — definition, how-to, equipment, article link, mode `options` |
| Articles | `content/articles/<id>.json` — one flat article per file |
| Neon | User logs, favorites, schedule + thin `protocols` FK rows only |

1. Edit `content/activities.json` (or Admin → Content in local `npm run dev`)  
2. Edit articles under `content/articles/`  
3. Commit and deploy  

Production Admin Save is blocked (filesystem is read-only). One-time migrate from old Neon overrides:

```bash
npm run content:export-from-db -- --write
# optional: npm run content:export-from-db -- --write --clear-db
```

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
2. Set `DATABASE_URL`, `AUTH_SECRET`, and `CRON_SECRET` (for daily guest cleanup). Optionally set `AUTH_URL` to the **production** URL (not localhost). Auth uses `trustHost` so the request host is preferred.
3. Run `npm run db:setup` and `npm run db:seed` against prod DB

## License

Private / project use.
