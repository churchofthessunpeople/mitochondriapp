# Mitochondriapp — Design Document

**Purpose:** A single human-readable description of how the product works today.  
Use this to mark up changes: edit sections, strike through old rules, add **Decision** notes.  
When code and this doc disagree, treat this doc as the *intent* you want — then implement.

**Last updated:** 2026-07-12 (L · W · M pillars, keystones, teaching sheets)

---

## 1. Product thesis

**Mitochondriapp** is a daily **mitochondrial environment** tracker inspired by Dr. Jack Kruse–style priorities.

### Spine: Light · Water · Magnetism

| Pillar | Daily keystone | Place / teaching |
|--------|----------------|------------------|
| **Light** | Sunrise quality tiers → day boost (2× / 1.5× / 1.25×) | Sun times, latitude · guide sheet |
| **Water** | Low-D hydration, deuterium-aware meal, or mineralized water | Deuterium / ATP synthase *lifestyle frame* · guide sheet |
| **Magnetism** | Barefoot, low-field hour, nnEMF block, nature | **Main field** (WMM µT/dip/declination) + **geology** (GVP/USGS) · guide sheet |

Supporting catalog: cold, sleep architecture, daylight movement.

Also:

- **Only log what you can actually do** (personal “via” / available list)  
- **Where you are matters** (ZIP → sun; magma catalog for magnetism place score)  
- **Gamification that teaches** — LWM strip, keystone labels, points/streaks  

**Tone / UI:** Low-blue “firelight” night + parchment day (warm amber accents, not cyan).  

> **Not medical advice.** Scores and protocols are educational / lifestyle framework only.

---

## 2. Core user loop

```
Register / log in
    → Onboarding (ZIP + starter activities + optional first log)
        → Daily home (/app)
            → L · W · M progress strip (tap → teaching sheets)
            → Morning light check-in (tier → day boost)
            → Checklist · Place · Catalog (pillar-grouped)
        → Account (history, boards, friends, reminders, profile)
```

**Success for a day:** L · W · M strip shows 3/3 — morning light keystone, water keystone, magnetism action — plus optional support protocols.

---

## 3. Navigation model (single-page shell)

### 3.1 Only two top-level destinations

| Destination | URL | Role |
|-------------|-----|------|
| **Today** | `/app` | Daily log, place, catalog |
| **Kruseiversity** | `/app?t=kruseiversity` | Why actions matter (Kruse-style teaching); expandable lessons |
| **Account** | `/app?t=account` (and deep links) | Profile, social, history |

Bottom nav: **Today · Learn · Account**. Lessons live in `src/lib/kruseiversity.ts` (add entries over time).

### 3.2 Today sections (in-page tabs, not routes)

Under Today:

1. **Checklist** — log available activities; suggested-now by sun phase  
2. **Place** — sun times, region scores, ZIP / travel  
3. **Catalog** — full catalog; toggle “available to me”

### 3.3 Account sections (in-page tabs)

1. **History** — last ~45 days, lifetime points; tap day → day detail sheet  
2. **Board** — leaderboards (light week, week, month, all-time, friends)  
3. **Friends** — requests + private board among accepted friends  
4. **Reminders** — local-time labels; presets from sunrise/sunset when known  
5. **Profile** — display name, username, password, recovery email, timezone, leaderboard visibility, admin entry, CSV export, log out  

Deep links open Account on the right tab:

| URL | Opens |
|-----|--------|
| `/app?t=history` | History |
| `/app?t=leaderboard` | Board |
| `/app?t=friends` | Friends |
| `/app?t=reminders` | Reminders |
| `/app?t=account` | Account (default section often History) |

### 3.4 In-page “sheets” (cards, not new pages)

Secondary content **stays inside `/app`** with a **← Back** control:

| Sheet | Opened from | Content |
|-------|-------------|---------|
| **Scoring guide** | Place → “How scoring works” | How 1–5 region scores work |
| **Browse regions** | Place → “Browse rated regions” | Optional region override + list |
| **Day detail** | History day row | Logs for that calendar day |
| **Admin** | Profile → Admin | Protocol catalog admin (if allowed) |

**Rule:** Aside from Today/Account and auth/onboarding, user-facing links should open sheets, not multi-page chrome.

**Exceptions that leave the app intentionally:**

- Auth: login, register, password reset  
- Onboarding wizard (`/onboarding`)  
- CSV download (`/api/export/csv`)  
- Log out → marketing home  

### 3.5 Legacy URLs

Old multi-page paths **redirect into the shell** (middleware + thin redirect pages), e.g.:

- `/today`, `/schedule`, `/place`, `/activities` → `/app`  
- `/account`, `/history`, `/leaderboard`, `/friends`, `/reminders` → matching `/app?t=…`  
- `/region`, `/region/scoring`, `/admin`, `/history/YYYY-MM-DD` → `/app` (or Account history)

Canonical route constants live in `src/lib/routes.ts`.

---

## 4. Auth & identity

| Topic | Behavior today |
|-------|----------------|
| Sign-in | **Username + password** (Auth.js / NextAuth credentials) |
| Registration | Username, optional display name, password |
| Email | Optional **recovery email** for password reset; verification not required for core use |
| Session | Cookie session; password change bumps `sessionVersion` and forces re-login |
| Rate limits | Login / register / password / username change limited by IP and user |

**Open for product review**

- [ ] Keep username-only, or require email?  
- [ ] Magic links / OAuth later?  

---

## 5. Onboarding

Shown when `onboardingComplete` is false **and** user doesn’t already look “established” (has ZIP/place/region or favorites).

**Steps (wizard):**

1. Welcome  
2. Location (US ZIP)  
3. Starter activities (curated IDs)  
4. Optional first-win log  
5. Done → `/app`

**Starter pack IDs** (`src/lib/onboarding.ts`):  
`morning-natural-light`, `sunrise-horizon`, `barefoot-earth`, `mineralized-water`, `midday-sun-skin`, `sunset-viewing`, `blue-light-hygiene`, `dark-bedroom`, `morning-movement`, `phone-away-sleep`

**Open for product review**

- [ ] Too many starters? Too few?  
- [ ] Force horizon sunrise on day 1?  

---

## 6. Activities (protocols)

### 6.1 What a protocol is

A catalog item you can log:

| Field | Meaning |
|-------|---------|
| `id` | Stable slug (e.g. `sunset-viewing`) |
| Name / description | User-facing copy |
| `points` | Base points for one log (or reference minutes if duration-based) |
| `category` | light, grounding, water_food, cold, emf, movement, sleep, other |
| `timeOfDay` | Suggested slot: sunrise, morning, afternoon, evening, sunset, night, anytime |
| `lockedTimeOfDay` | If set, only assignable/loggable in that slot (e.g. sunset-only) |
| `allowsMultiple` / `maxPerDay` | Multi-log caps |
| `durationEnabled` | User enters minutes; points scale from `referenceMinutes` up to `maxDurationMinutes` |
| `active` | Soft-delete / hide from catalog |

**Source of truth for seeds:** `src/db/seed-data.ts` → `npm run db:seed`  
**Extra UX copy (how / equipment):** `src/lib/protocol-meta.ts`

### 6.2 Available list (“via”)

- User favorites table = **what I can actually do**  
- Checklist only shows available protocols  
- Catalog toggles available on/off  
- Schedule assignment (if used) requires activity to be on available list first  

### 6.3 Categories (display order)

Light → Grounding → Water & food → Cold → EMF → Movement → Sleep → Other  

### 6.4 Checklist ordering (“suggested now”)

Depends on **sun phase** from local sunrise/sunset:

| Phase | Prefer slots |
|-------|----------------|
| Night | night, evening, anytime |
| Sunrise | sunrise, morning, anytime |
| Day | morning, afternoon, anytime, sunrise |
| Sunset | sunset, evening, anytime |

Season coach line may nudge UV/light behavior by latitude band.

**Open for product review**

- [ ] Which protocols belong in seed catalog?  
- [ ] Points values fair?  
- [ ] Multi-log / duration defaults OK?  

---

## 7. Points & scoring

### 7.1 Base points

```
If duration disabled: points = protocol.points
If duration enabled:  points = round(protocol.points * minutes / referenceMinutes)
                      clamped to [1 .. points at maxDuration]
```

### 7.2 Morning light day boost (keystone)

**Philosophy:** Sunrise quality is the highest-leverage habit (Kruse emphasis).  
Sunset is valuable but **does not unlock** a day multiplier; it only earns normal (or boosted) points.

**Tiers** (best logged tier **wins for the day**):

| Tier | Multiplier | Protocol id | Meaning |
|------|------------|-------------|---------|
| Horizon | **2×** | `sunrise-horizon` | Saw sun come up over the horizon (eyes to disk, no glass) |
| Open sky | **1.5×** | `sunrise-open-sky` | Outside under decent open skies in the morning |
| Outside | **1.25×** | `sunrise-outside` | Outside morning light with limited sky view |

**Rules:**

1. Logging a **keystone** morning protocol earns **base points only** (does not multiply itself).  
2. That unlocks `multiplier` on **all other** real logs that calendar day.  
3. If a better tier is logged later, day is recomputed to the best multiplier.  
4. Removing the only keystone drops the boost and recomputes.  
5. Legacy ids (if still in DB): `sunrise-grounding` → horizon, `no-sunglasses-sunrise` → open sky.  
6. Barefoot / other sunrise-slot activities **do not** unlock the boost unless they are keystone ids.

**UI rules:**

- Show boost **once at the top** of the checklist (e.g. “2× day boost · Horizon sunrise”).  
- **Do not** put “1.5× / 2×” on every activity row tag.  
- Daily modal: pick a tier, not a single yes/no.

**Implementation:** `src/lib/scoring.ts`, applied in `src/lib/actions/completions.ts`.

### 7.3 Streaks

- **Current streak:** consecutive calendar days with ≥1 real (non-bonus) log, allowing “not yet today if yesterday logged.”  
- **Best streak:** longest run in recent history.  
- **Streak bonus:** small extra points when logging on a multi-day streak (cap 7 pts formula in `streakBonusPoints`), once per day max.

### 7.4 Day total

Sum of `pointsEarned` on all completion rows for that user-local calendar day (including streak bonus rows).

**Open for product review**

- [ ] Tier mults 2 / 1.5 / 1.25 feel right?  
- [ ] Should sunset ever get a small evening bonus (not a day unlock)?  
- [ ] Should boost apply to multi-logs the same day only (yes today)?  
- [ ] Streak bonus too generous / stingy?  

---

## 8. Place, sun times, and regions

### 8.1 Location sources

1. **Home:** US ZIP → geocode → lat/lng, place label, timezone, optional elevation  
2. **Travel mode:** temporary ZIP override until inclusive `travelUntil` date  
3. **Region override:** optional curated region for lifestyle scores  

**Effective location** = travel if active, else home (`src/lib/location-effective.ts`).

### 8.2 Sun times

Computed from **exact lat/lng** + timezone for the local calendar day (`src/lib/sun.ts`).  
Drives:

- Phase (night / sunrise / day / sunset)  
- Checklist “suggested now”  
- Reminder presets (at sunrise, after sunrise, before sunset, at sunset)  
- Place UI (↑ sunrise / ↓ sunset)

### 8.3 Region lifestyle scores (1–5)

Curated places in `regions` table / `region-seeds.ts`.

**Composite health rating** ≈ average of:

1. **Sun score** — from absolute latitude (equator better for year-round solar signal)  
2. **Magnetism score** — distance to nearest Holocene volcano / magma system from expanded anchors (~1k points: Smithsonian GVP Holocene catalog + USGS US volcanoes + arc/hotspot/rift midpoints). Lifestyle framework, not real-time hazard alerts. Regenerate: `node scripts/build-volcanic-anchors.mjs`  

3. **Policy score** — starts mid, adjusts for BTC tender, outdoor culture, CBDC pressure, surveillance, etc.

ZIP maps to **nearest curated region** for the 1–5 scores; ZIP itself sets **precision sun times**.  
In-app scoring guide sheet explains this transparently.

**Disclaimer copy:** educational lifestyle framework, not medical/legal/investment advice.

**Open for product review**

- [ ] Are region seeds / scores fair for places you care about?  
- [ ] Should policy factors be more / less political?  
- [ ] Travel mode UX clear enough?  

---

## 9. Social & leaderboards

### 9.1 Leaderboards

| Board | What it ranks |
|-------|----------------|
| Light week | Light-category points only, ~7 days |
| Week | All points, ~7 days |
| Month | ~30 days |
| All time | Lifetime |
| Friends week | Accepted friends + you |

Users can **hide from public boards** (`showOnLeaderboard`).

### 9.2 Friends

- Request by username  
- Accept / reject  
- Friends board is private among accepted edges  

### 9.3 History & export

- In-app history list (45 days on home payload)  
- Day detail sheet  
- CSV export of logs (authenticated API)

---

## 10. Reminders

Stored as label + local `HH:MM` + enabled flag.  
UI offers sun-relative presets when sun times known (not push infrastructure by itself — **local checklist helpers**, not a guaranteed OS push system unless you add one later).

**Open for product review**

- [ ] Real push notifications needed?  
- [ ] Timezone changes — re-nudge user?  

---

## 11. Admin

- Access: `users.is_admin` **or** username in `ADMIN_USERNAMES` env  
- In-page Admin sheet: upsert / soft-disable protocols  
- Not a full CMS  

---

## 12. Themes & visual system

| Mode | Intent |
|------|--------|
| Night (default brand) | Dark, firelight amber accents, low blue |
| Day | Parchment / light surfaces, same accent family |

Theme toggle in shell. Prefer warm accent; avoid “health app cyan.”

**Open for product review**

- [ ] Icon / brand (swan / phoenix candidates in `public/icons`)  
- [ ] More / less glassmorphism  

---

## 13. Technical architecture (for implementers)

### 13.1 Stack

| Layer | Choice |
|-------|--------|
| App | Next.js App Router, React, TypeScript, Tailwind |
| Auth | Auth.js (NextAuth v5) credentials |
| DB | Neon Postgres + Drizzle ORM |
| Deploy | Vercel (typical) |

### 13.2 Key folders

```
src/app/           # Routes (thin redirects + /app data loader + auth pages)
src/components/    # UI (AppShell, TodayHome, AccountHome, sheets, forms)
src/lib/           # Domain logic (scoring, sun, geo, data loaders)
src/lib/actions/   # Server actions (mutations)
src/db/            # Schema, seeds
src/middleware.ts  # Auth + legacy redirects
```

### 13.3 Main data tables

| Table | Role |
|-------|------|
| `users` | Identity, location, travel, admin, onboarding, leaderboard flag |
| `protocols` | Global catalog |
| `user_favorites` | Available list |
| `user_schedule_items` | Optional time-of-day schedule (legacy / advanced) |
| `daily_completions` | Logs (`pointsEarned`, duration, streak bonus flag, day) |
| `regions` | Curated place scores |
| `friendships` | Social graph |
| `user_reminders` | Reminder rows |
| Auth tables | sessions, accounts, verification tokens |
| `rate_limits` | Abuse control |

### 13.4 Mutation → UI refresh

Server actions call `revalidateApp()` so `/app` (and related paths) refresh after logs, ZIP, favorites, etc.

### 13.5 Calendar day

All “today” logic uses the user’s **timezone** (from profile / ZIP), not only server UTC.

---

## 14. Screen-by-screen checklist (for QA / redesign)

### Marketing `/`

- [ ] Value prop clear  
- [ ] Register / sign in  

### Onboarding

- [ ] ZIP → sun + nearest region  
- [ ] Starters sensible  
- [ ] Exit to `/app`  

### Today → Checklist

- [ ] Morning modal tiers appear until logged or dismissed for day/session  
- [ ] Boost banner only at top when active  
- [ ] Tags show base pts, not mult  
- [ ] Suggested-now matches phase  
- [ ] Multi-log and duration flows work  

### Today → Place

- [ ] Sunrise/sunset correct for ZIP  
- [ ] Scores + factors readable  
- [ ] Scoring + regions open as sheets  

### Today → Catalog

- [ ] Toggle available updates checklist without full multi-page nav  

### Account tabs

- [ ] History day → sheet  
- [ ] Boards filter tabs  
- [ ] Friends request/accept  
- [ ] Reminders + sun presets  
- [ ] Profile forms + export + admin  

---

## 15. Product decisions backlog

Use this section as a working scratchpad. Check when decided; note the rule in the main sections above.

| ID | Question | Status | Decision |
|----|----------|--------|----------|
| P1 | Morning tier mults 2 / 1.5 / 1.25 | Implemented | Keep unless changed |
| P2 | Sunset unlocks day boost? | Decided no | Base points only (+ receive boost) |
| P3 | Boost shown on every row? | Decided no | Top banner only |
| P4 | Today/Account only top nav | Implemented | Sheets for secondary |
| P5 | Email required? | Open | |
| P6 | Push reminders? | Open | |
| P7 | International non-US postal? | Open | ZIP-first today |
| P8 | Medical disclaimers stronger? | Open | |
| P9 | Public vs friends-only default boards | Open | Public opt-out today |

---

## 16. How to change the product (playbook)

| Want to change… | Edit… | Then… |
|-----------------|-------|--------|
| Protocol list / points | `src/db/seed-data.ts` | `npm run db:seed` |
| Protocol how-to / equipment | `src/lib/protocol-meta.ts` | Refresh app |
| Morning boost tiers | `src/lib/scoring.ts` + seeds + check-in UI | Tests: `npm test` |
| Starter onboarding set | `src/lib/onboarding.ts` | — |
| Region list / scores | `src/db/region-seeds.ts` + `region-scoring.ts` | `npm run db:seed` |
| Tab / deep-link map | `src/lib/app-tabs.ts`, `src/lib/routes.ts` | — |
| New in-page sheet | `src/lib/app-sheets.ts` + `AppShell` + panel component | Avoid new routes |
| Checklist order | `src/lib/checklist-order.ts` | — |
| Auth rate limits | `src/lib/rate-limit.ts` | — |

After structural product changes, **update this document in the same PR** so it stays the source of intent.

---

## 17. Glossary

| Term | Meaning |
|------|---------|
| **Protocol / activity** | Catalog item you can log |
| **Available / via list** | Subset of catalog the user can do |
| **Keystone** | Morning-light tier protocol that unlocks a day multiplier |
| **Sheet** | In-app card overlay on `/app`, not a separate multi-page flow |
| **Phase** | night / sunrise / day / sunset from solar times |
| **Effective location** | Home or travel override used for sun + place |
| **Region score** | Curated 1–5 lifestyle place rating |
| **Completion** | One log row for a user on a calendar day |

---

## 18. Explicit non-goals (today)

Unless you reverse these, the app is **not**:

- A clinical medical device or diagnosis tool  
- A full calendar / meal planner  
- A social network beyond friends + boards  
- Multi-device push-notification infrastructure (reminders are in-app helpers)  
- Multi-page product with separate chrome for every feature  

---

*End of design document. Mark sections with your edits; implementers should reconcile code to match.*
