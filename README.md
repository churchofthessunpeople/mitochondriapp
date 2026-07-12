# Mitochondriapp

Track Dr. Jack Kruse–inspired lifestyle protocols (light, magnetism, water, cold, circadian timing) to counter modern environmental stress — including deuterium load and disrupted magnetic / light environments.

Users register, log what they did each day, earn points, review history, and climb a leaderboard. Protocols are organized by **time of day** (sunrise → night) and can be completed by **click** or **drag-and-drop**.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Auth.js** (NextAuth v5) credentials auth
- **Neon** Postgres + **Drizzle ORM**
- **@dnd-kit** for drag-and-drop
- Deploy target: **Vercel**

## Features (MVP)

- Register / log in
- Daily protocol board by time of day
- Click toggle or drag cards into **Done today**
- Point values per protocol (once per day)
- Personal history
- Weekly + all-time leaderboard
- Seed catalog of ~24 provisional protocols (easy to edit)

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

Copy `.env.example` → `.env.local` and fill in:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |

### 3. Database

```bash
npm run db:push
npm run db:seed
```

### 4. Dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add env vars: `DATABASE_URL`, `AUTH_SECRET`.
4. Deploy.
5. From your machine (or a one-off script), run `npm run db:push` and `npm run db:seed` against the production `DATABASE_URL`.

Optional: set `AUTH_URL` to your production URL if Auth.js needs an explicit base URL.

## Customizing protocols

Edit `src/db/seed-data.ts`, then re-run:

```bash
npm run db:seed
```

Each protocol has:

- `id` — stable string key
- `name` / `description`
- `points` — game score (tune freely)
- `timeOfDay` — `sunrise` \| `morning` \| `afternoon` \| `evening` \| `sunset` \| `night` \| `anytime`
- `sortOrder` — display order within a section

## Project map

```
src/
  app/                 # routes: /, /login, /register, /today, /history, /leaderboard
  components/          # UI (protocol board, auth, leaderboard, history)
  db/                  # schema, seed, drizzle client
  lib/actions/         # server actions (auth, completions)
  auth.ts              # Auth.js config
```

## Disclaimer

Protocol descriptions are lifestyle education / tracking inspiration only — not medical advice. Point values are provisional for engagement and should be refined to match your preferred weighting of Dr. Kruse’s guidance.
