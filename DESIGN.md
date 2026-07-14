# Mitochondriapp — Design Document

**Purpose:** A single human-readable description of how the product works today.  
Use this to mark up changes: edit sections, strike through old rules, add **Decision** notes.  
When code and this doc disagree, treat this doc as the *intent* you want — then implement.

**Last updated:** 2026-07-14 (morning-light session scoring, variants, permanent logs, sitewide disclaimer)

---

## 1. Product thesis

**Mitochondriapp** is a daily **mitochondrial environment** tracker inspired by Dr. Jack Kruse–style priorities.

### Spine: Light · Water · Magnetism (+ Support)

| Pillar | Daily keystone | Place / teaching |
|--------|----------------|------------------|
| **Light** | Sunrise quality tiers → day boost (up to 2×) | Sun times, latitude · guide sheet |
| **Water** | Low-D hydration, deuterium-aware meal, or mineralized water | Deuterium / ATP synthase *lifestyle frame* · guide sheet |
| **Magnetism** | Barefoot, low-field hour, nnEMF block, nature, Magnetico | **Main field** (WMM µT/dip/declination) + **geology** (GVP/USGS) · guide sheet |
| **Support** | Cold, sleep architecture, daylight movement | No guide sheet — catalog pillar only |

Supporting catalog: cold thermogenesis, sleep architecture, daylight movement, and other habits grouped under **Support** in the catalog UI.

Also:

- **Only log what you can actually do** (personal “via” / available list)  
- **Where you are matters** (ZIP → sun; magma catalog for magnetism place score)  
- **Gamification that teaches** — L · W · M strip, keystone labels, points/streaks  

**Tone / UI:** Low-blue “firelight” night + parchment day (warm amber accents, not cyan).  

> **Not medical advice.** A **sitewide disclaimer bar** (`SiteDisclaimer` in root layout) states that protocols, scores, and Mitoversity content are educational only — not medical advice, diagnosis, or treatment. Scores and regions are a lifestyle framework, not clinical guidance.

---

## 2. Core user loop

```
Register / log in
    → Onboarding (ZIP + starter activities + optional first log)
        → Daily home (/app?sunrise=1 on first exit — morning check-in)
            → L · W · M progress strip (tap → teaching sheets)
            → Morning light check-in (tier → modifiers → session → confirm)
            → Checklist · Place · Catalog · Leaderboard
        → Mitoversity (lessons, ?lesson= deep links)
        → Account (history, friends, reminders, profile)
```

**Success for a day:** L · W · M strip shows 3/3 — morning light keystone logged, any water keystone logged, any magnetism keystone logged — plus optional support protocols.

**Permanent protocols** on the available list auto-log each calendar day (see §6.5).

---

## 3. Navigation model (single-page shell)

### 3.1 Three top-level destinations

| Destination | URL | Role |
|-------------|-----|------|
| **Today** | `/app` | Daily log, place, catalog, leaderboards |
| **Mitoversity** | `/app?t=mitoversity` | Research-style lessons on light/water/magnetism; Kruse cited where his theories are specific |
| **Account** | `/app?t=account` (and deep links) | Profile, social, history |

Bottom nav: **Today · Learn · Account**. Lessons live in `src/lib/mitoversity.ts` (~17 entries; add over time). Deep link `?lesson=<id>` opens a specific lesson.

**Admin** (bootstrap admins only): header nav + mobile bottom nav **Admin** button, or `/app?t=admin` — opens Admin sheet.

### 3.2 Today sections (in-page tabs, not routes)

Under Today:

1. **Checklist** — log available activities; fixed **Morning light** row; suggested-now by sun phase; weekly summary strip  
2. **Place** — sun times, region scores, live geomag / artificial-EM context, ZIP / travel  
3. **Catalog** — full catalog grouped by **L · W · M · S** pillar; toggle “available to me”; search and filters  
4. **Leaderboard** — light week, week, month, all-time, friends week  

### 3.3 Account sections (in-page tabs)

1. **History** — last ~45 days, lifetime points; tap day → day detail sheet  
2. **Friends** — requests + private board among accepted friends  
3. **Reminders** — local-time labels; presets from sunrise/sunset when known  
4. **Profile** — display name, username, password, recovery email, timezone, leaderboard visibility, admin entry (if allowed), CSV export, log out  

Deep links open Account on the right tab:

| URL | Opens |
|-----|--------|
| `/app?t=history` | Account → History |
| `/app?t=friends` | Account → Friends |
| `/app?t=reminders` | Account → Reminders |
| `/app?t=account` | Account (default section often History) |

**Leaderboard deep link:** `/app?t=leaderboard` opens **Today → Leaderboard** (not Account).

### 3.4 In-page “sheets” (cards, not new pages)

Secondary content **stays inside `/app`** with a **← Back** control:

| Sheet | Opened from | Content |
|-------|-------------|---------|
| **Scoring guide** | Place → “How scoring works” | How 1–5 region scores work |
| **Browse regions** | Place → “Browse rated regions” | Optional region override + list |
| **Guide Light / Water / Magnetism** | L · W · M strip | Pillar teaching cards |
| **Day detail** | History day row | Logs for that calendar day (grouped sections) |
| **Admin** | Profile / header / bottom nav / `?t=admin` | Users + protocols admin (if allowed) |

**Rule:** Aside from Today/Account/Mitoversity and auth/onboarding, user-facing links should open sheets, not multi-page chrome.

**Exceptions that leave the app intentionally:**

- Auth: login, register, password reset, verify-email (when enabled)  
- Onboarding wizard (`/onboarding`)  
- CSV download (`/api/export/csv`)  
- Log out → marketing home  

### 3.5 Legacy URLs

Old multi-page paths **redirect into the shell** (middleware + thin redirect pages), e.g.:

- `/today`, `/schedule`, `/place`, `/activities` → `/app`  
- `/account`, `/history`, `/leaderboard`, `/friends`, `/reminders` → matching `/app?t=…`  
- `/region`, `/region/scoring`, `/admin` → `/app`  
- `/history/YYYY-MM-DD` → `/app?t=history` (**date is not preserved** — day detail only via in-app sheet tap)

Canonical route constants live in `src/lib/routes.ts`.

---

## 4. Auth & identity

| Topic | Behavior today |
|-------|----------------|
| Sign-in | **Username + password** (Auth.js / NextAuth credentials) |
| Registration | Username, optional display name, password |
| Email | Optional **recovery email** for password reset; optional **email verification** when env-enabled (`/verify-email`) |
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
3. Starter activities (curated IDs — **excludes sunrise keystones**; morning light is daily check-in)  
4. Optional first-win log  
5. Done → `/app?sunrise=1` (forces morning-light check-in)

**Starter pack IDs** (`src/lib/onboarding.ts`):  
`low-d-hydration`, `deuterium-aware-meal`, `barefoot-earth`, `magnetic-awareness`, `midday-sun-skin`, `sunset-viewing`, `blue-light-hygiene`, `dark-bedroom`, `reduce-nnemf-block`, `morning-movement`

**Open for product review**

- [ ] Too many starters? Too few?  
- [ ] Force horizon sunrise on day 1? (partially: `?sunrise=1` after onboarding)  

---

## 6. Activities (protocols)

### 6.1 What a protocol is

A catalog item you can log:

| Field | Meaning |
|-------|---------|
| `id` | Stable slug (e.g. `sunset-viewing`) |
| Name / description | User-facing copy |
| `points` | Base points for one log (or reference per 15-min block if duration-based) |
| `category` | light, grounding, water_food, cold, emf, movement, sleep, other |
| `timeOfDay` | Suggested slot: sunrise, morning, afternoon, evening, sunset, night, anytime |
| `lockedTimeOfDay` | If set, only assignable/loggable in that slot (e.g. sunset-only) |
| `allowsMultiple` | Multi-log per day (uncapped when true) |
| `maxPerDay` | Legacy field; multi-log protocols are effectively uncapped in code |
| `durationEnabled` | User enters minutes; points scale in **15-minute blocks** from `referenceMinutes` up to `maxDurationMinutes` |
| `permanent` | If true, auto-logs daily while on available list (see §6.5) |
| `active` | Soft-delete / hide from catalog |

**Source of truth for definitions:** `src/db/seed-data.ts` → synced to Neon via `src/lib/catalog.ts` on app load (dev: restart picks up seed changes; `npm run db:seed` still available).  
**Extra UX copy (how / equipment):** `src/lib/protocol-meta.ts` (opens in Protocol how-to dialog from catalog).

**Morning-light keystones** (`sunrise-horizon`, `sunrise-open-sky`, `sunrise-outside`) are **not catalog-selectable** — logged only via daily check-in and the fixed **Morning light** checklist row.

### 6.2 Available list (“via”)

- User favorites table = **what I can actually do**  
- Checklist only shows available protocols (+ fixed Morning light row)  
- Catalog toggles available on/off; stale sunrise favorites are purged  
- Schedule assignment (if used) requires activity to be on available list first  

### 6.3 Categories & catalog display

**DB category order** (`src/lib/categories.ts`):  
Light → Water & food → Grounding → EMF → Cold → Movement → Sleep → Other  

**Catalog UI** groups by **L · W · M · S pillar** (with category sub-labels), not flat category list. Search, pillar filter, and “not on checklist” filter available.

### 6.4 Checklist ordering (“suggested now”)

Depends on **sun phase** from local sunrise/sunset:

| Phase | Prefer slots |
|-------|----------------|
| Night | night, evening, anytime |
| Sunrise | sunrise, morning, anytime |
| Day | morning, afternoon, anytime, sunrise |
| Sunset | sunset, evening, anytime |

Season coach line may nudge UV/light behavior by latitude band.

**Morning light row** — always at top; tier chips (Horizon 2×, Open-sky 1.5×, Outside 1.25×); tap opens same keystone dialog as daily check-in; re-log replaces prior sunrise tier for the day.

### 6.5 Permanent auto-log protocols

Protocols with `permanent: true` in seeds:

| Protocol id | Slot |
|-------------|------|
| `magnetico-sleep-pad` | night |
| `breaker-off-bedroom` | night |
| `breaker-off-office` | morning |
| `dark-bedroom` | night |
| `cool-bedroom-sleep` | night |

While on the user’s **available list**, these auto-insert a completion each calendar day (`src/lib/permanent-completions.ts`). User can **skip for one day** → `user_permanent_skips` row; removing from available list or unchecking stops future auto-logs.

History groups these under **“Automatic · every day”**.

**Open for product review**

- [ ] Which protocols belong in seed catalog?  
- [ ] Points values fair?  
- [ ] Multi-log / duration defaults OK?  
- [ ] Permanent auto-log UX clear enough?  

---

## 7. Points & scoring

### 7.1 Base points

```
If duration disabled: points = protocol.points (or variant-adjusted base — see §7.4)
If duration enabled:  points = round(base × (minutes / 15))
                      clamped to [1 .. base at maxDuration]
```

Duration uses **15-minute blocks** (`DURATION_BLOCK_MINUTES` in `scoring.ts`), not raw `referenceMinutes` ratio.

### 7.2 Morning light day boost (keystone)

**Philosophy:** Sunrise quality is the highest-leverage habit (Kruse emphasis).  
Sunset is valuable but **does not unlock** a day multiplier; it only earns normal (or boosted) points.

**Tiers** (best **effective** multiplier **wins for the day**):

| Tier | Max multiplier | Protocol id | Meaning |
|------|----------------|-------------|---------|
| Horizon | **2×** | `sunrise-horizon` | Saw sun come up over the horizon (eyes to disk, no glass) |
| Open sky | **1.5×** | `sunrise-open-sky` | Outside under decent open skies in the morning |
| Outside | **1.25×** | `sunrise-outside` | Outside morning light with limited sky view |

**Modifier penalties** (subtracted from tier max before sky/duration scaling):

| Modifier | Penalty |
|----------|---------|
| Sunglasses worn | −0.5× |
| Partial skin coverage | −0.25× |
| Not grounded | −0.25× |

Minimum effective multiplier after modifiers: **1×**.

**Sky conditions** — session length required for **full** keystone points and **full** effective day boost:

| Sky | Minutes needed |
|-----|----------------|
| Clear | 30 |
| Cloudy | 45 |
| Heavy overcast | 60 |

Below required duration: points and boost scale **linearly** (e.g. 30 min on cloudy ≈ 67% of timing-adjusted base and boost).

**Sunrise timing** — keystone base points also depend on **when** you viewed (start/finish session vs local sunrise):

- Optimal window: **±15 minutes** from official sunrise (both start and end inside window → no timing penalty)  
- Outside window: **−1 pt per minute** on worst edge (start or finish), minimum 1 pt  
- Session stored as signed offsets from sunrise: `variantValue` = start offset, `durationMinutes` = encoded end offset + sky (`sunrise-sky.ts`)

**Check-in flow** (`sunrise-keystone-dialog.tsx`): tier → modifiers (sky, grounded, skin, sunglasses) → confirm (start/finish times) → log.

**Dismissal:** per-user `localStorage` (missed today) or `sessionStorage` (ask later this session). Legacy global keys cleared on mount. `?sunrise=1` forces open after onboarding.

**Rules:**

1. Logging a **keystone** earns **base points only** (does not multiply itself).  
2. That unlocks **effective** `sunriseBuffMultiplier` on **all other** real logs that calendar day.  
3. If a better tier / modifiers / duration is logged later, day is recomputed to the best stored multiplier.  
4. Removing the only keystone drops the boost and recomputes.  
5. Re-logging a different tier **removes prior sunrise tier rows** first.  
6. Legacy ids (if still in DB): `sunrise-grounding` → horizon, `no-sunglasses-sunrise` → open sky.  
7. Barefoot / other sunrise-slot activities **do not** unlock the boost unless they are keystone ids.

**UI rules:**

- Show boost **once at the top** of the checklist (e.g. “2× day boost · Horizon sunrise”).  
- **Do not** put “1.5× / 2×” on every activity row tag.  
- Daily modal: multi-step tier + modifiers + session, not a single yes/no.

**Implementation:** `src/lib/scoring.ts`, `src/lib/sunrise-timing.ts`, `src/lib/sunrise-sky.ts`, `src/lib/sunrise-keystone-points.ts`, `src/lib/actions/completions.ts`.

### 7.3 Protocol variants (non-sunrise)

Stored in `daily_completions.variantValue` and/or user profile prefs:

| Protocol | Variant | Scoring |
|----------|---------|---------|
| **Magnetico sleep pad** | 5 / 10 / 20 gauss (`users.magneticoGauss`) | 1.25× / 1.5× / 2× on catalog base |
| **Cool bedroom sleep** | Thermostat °F (`users.sleepRoomTempF`) | 65°F = 10 pts; −1 pt per °F warmer (min 1) |
| **Cold thermogenesis** | Skin temp °F per log (50–70°F, 5° steps) | 50°F optimal; −2 catalog base per 5° above 50 |

Variant UI: chips on checklist / duration dialog; profile fields for Magnetico and sleep room temp.

### 7.4 Streaks

- **Current streak:** consecutive calendar days with ≥1 real (non-bonus) log, allowing “not yet today if yesterday logged.”  
- **Best streak:** longest run in recent history.  
- **Streak bonus:** small extra points when logging on a multi-day streak (cap 7 pts formula in `streakBonusPoints`), once per day max.

### 7.5 Day total

Sum of `pointsEarned` on all completion rows for that user-local calendar day (including streak bonus rows).

**Open for product review**

- [ ] Tier mults 2 / 1.5 / 1.25 feel right?  
- [ ] Sky duration thresholds (30 / 45 / 60) fair?  
- [ ] Should sunset ever get a small evening bonus (not a day unlock)?  
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
- Morning-light timing scoring  

### 8.3 Region lifestyle scores (1–5)

Curated places in `regions` table / `region-seeds.ts`.

**Composite health rating** ≈ rounded average of:

1. **Sun score** — from absolute latitude (equator better for year-round solar signal)  
2. **Magnetism score** — distance to nearest Holocene volcano / magma system from expanded anchors (~1k points: Smithsonian GVP Holocene catalog + USGS US volcanoes + arc/hotspot/rift midpoints). Lifestyle framework, not real-time hazard alerts. Regenerate: `node scripts/build-volcanic-anchors.mjs`  
3. **Policy score** — starts mid, adjusts for BTC tender, outdoor culture, CBDC pressure, surveillance, etc.

ZIP maps to **nearest curated region** for the 1–5 scores; ZIP itself sets **precision sun times**.  
In-app scoring guide sheet explains this transparently.

### 8.4 Place panel (live context)

Beyond curated region scores, Today → Place may show for the user’s coordinates:

- WMM geomagnetic field (µT, dip, declination) — `geomag.ts`  
- Artificial EM load proxy — `artificial-em.ts`  
- Elevation, UV band, solar noon — `place-factors.ts`  

Educational lifestyle context, not a medical or safety rating of the user’s street.

**Disclaimer copy:** educational lifestyle framework, not medical/legal/investment advice; reinforced by sitewide `SiteDisclaimer`.

**Open for product review**

- [ ] Are region seeds / scores fair for places you care about?  
- [ ] Should policy factors be more / less political?  
- [ ] Travel mode UX clear enough?  

---

## 9. Social & leaderboards

### 9.1 Leaderboards (Today tab)

| Board | What it ranks |
|-------|----------------|
| Light week | Light-category points only, ~7 days |
| Week | All points, ~7 days |
| Month | ~30 days |
| All time | Lifetime |
| Friends week | Accepted friends + you |

Users can **hide from public boards** (`showOnLeaderboard` on Profile).

### 9.2 Friends

- Request by username  
- Accept / reject  
- Friends board is private among accepted edges  

### 9.3 History & export

- In-app history list (**~45 days** on home payload)  
- Day detail sheet — sections: **Sunrise** · **Activities** · **Automatic · every day**  
- Copy day activities (grouped bullets)  
- CSV export of logs (authenticated API)

---

## 10. Reminders

Stored as label + local `HH:MM` + enabled flag.  
UI offers sun-relative presets when sun times known.

**Browser notifications:** `reminders-client.tsx` can request `Notification` permission and fire **local scheduled notifications** in supported browsers — not a guaranteed cross-device push service.

**Open for product review**

- [ ] Server-side / mobile push needed?  
- [ ] Timezone changes — re-nudge user?  

---

## 11. Admin

- **Access:** `users.is_admin` **or** username in `ADMIN_USERNAMES` env (synced on login)  
- **In-page Admin sheet** (`admin-panel.tsx`):

| Tab / zone | Capabilities |
|------------|----------------|
| **Users** | Search, view/edit profile fields, reset password, delete user |
| **Protocols** | List catalog, upsert / soft-disable protocols |
| **Danger zone** | Reset **all** user activity (all `daily_completions` + `user_permanent_skips`) — in-app confirm dialog |

Admin entry: Profile link, desktop header, mobile bottom nav (admins only), `/app?t=admin`.

Not a full CMS; seeds remain source of truth for protocol definitions.

---

## 12. Themes, disclaimer & visual system

| Mode | Intent |
|------|--------|
| Night (default brand) | Dark, firelight amber accents, low blue |
| Day | Parchment / light surfaces, same accent family |

Theme toggle in shell. Prefer warm accent; avoid “health app cyan.”

**Sitewide disclaimer:** fixed footer bar on every page (`src/components/site-disclaimer.tsx`, root `layout.tsx`). Mobile bottom nav and app shell content pad above it (`--site-disclaimer-offset` in `globals.css`).

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
| `users` | Identity, location, travel, admin, onboarding, leaderboard flag, **`magneticoGauss`**, **`sleepRoomTempF`** |
| `protocols` | Global catalog (synced from seeds) |
| `user_favorites` | Available list |
| `user_schedule_items` | Optional time-of-day schedule (legacy / advanced) |
| `daily_completions` | Logs (`pointsEarned`, `durationMinutes`, **`variantValue`**, **`sunriseBuffMultiplier`**, streak bonus flag, day) |
| `user_permanent_skips` | Per-user per-day skip for permanent auto-logs |
| `regions` | Curated place scores |
| `friendships` | Social graph |
| `user_reminders` | Reminder rows |
| Auth tables | sessions, accounts, verification tokens |
| `rate_limits` | Abuse control |

**Sunrise keystone storage note:** `variantValue` = start offset from sunrise (minutes); `durationMinutes` = encoded end offset + sky condition for new logs (legacy rows may store raw end offset only).

### 13.4 Mutation → UI refresh

Most server actions call `revalidateApp()` so `/app` refreshes after ZIP, favorites, profile, etc.

**Exception:** `logCompletionAction` uses **optimistic client state** on the checklist (no full shell revalidate on every tap); `after()` revalidates `/history` paths. Sunrise check-in calls `router.refresh()` after log.

### 13.5 Calendar day

All “today” logic uses the user’s **timezone** (from profile / ZIP), not only server UTC.

---

## 14. Screen-by-screen checklist (for QA / redesign)

### Marketing `/`

- [ ] Value prop clear  
- [ ] Register / sign in  
- [ ] Sitewide disclaimer visible  

### Onboarding

- [ ] ZIP → sun + nearest region  
- [ ] Starters sensible (no sunrise keystones in pack)  
- [ ] Exit to `/app?sunrise=1`  

### Today → Checklist

- [ ] Morning light row + daily modal (tier → modifiers → session) until logged or dismissed  
- [ ] Boost banner only at top when active  
- [ ] Tags show base pts, not mult on every row  
- [ ] Suggested-now matches phase  
- [ ] Multi-log, duration, variant chips (Magnetico / cold thermo / sleep temp)  
- [ ] Permanent auto-log section when applicable  

### Today → Place

- [ ] Sunrise/sunset correct for ZIP  
- [ ] Scores + factors + geomag / artificial EM readable  
- [ ] Scoring + regions + guide sheets open as sheets  

### Today → Catalog

- [ ] Pillar grouping; toggle available updates checklist  
- [ ] Sunrise keystones **not** selectable  
- [ ] How-to dialog from protocol meta  

### Today → Leaderboard

- [ ] All board tabs; friends board; opt-out respected  

### Account tabs

- [ ] History day → sheet (Sunrise / Activities / Automatic sections)  
- [ ] Friends request/accept  
- [ ] Reminders + sun presets (+ browser notification permission if used)  
- [ ] Profile forms + export + admin (if allowed)  

---

## 15. Product decisions backlog

Use this section as a working scratchpad. Check when decided; note the rule in the main sections above.

| ID | Question | Status | Decision |
|----|----------|--------|----------|
| P1 | Morning tier mults 2 / 1.5 / 1.25 | Implemented | Keep unless changed |
| P2 | Sunset unlocks day boost? | Decided no | Base points only (+ receive boost) |
| P3 | Boost shown on every row? | Decided no | Top banner only |
| P4 | Today/Account only top nav | Implemented | Sheets for secondary; Leaderboard on Today |
| P5 | Email required? | Open | |
| P6 | Server/mobile push reminders? | Open | Browser notifications exist today |
| P7 | International non-US postal? | Open | ZIP-first today |
| P8 | Medical disclaimers stronger? | **Implemented** | Sitewide `SiteDisclaimer` bar |
| P9 | Public vs friends-only default boards | Open | Public opt-out today |
| P10 | Sunrise in catalog? | Decided no | Daily check-in + Morning light row only |
| P11 | Sky duration for full boost? | Implemented | 30 / 45 / 60 min (clear / cloudy / overcast) |

---

## 16. How to change the product (playbook)

| Want to change… | Edit… | Then… |
|-----------------|-------|--------|
| Protocol list / points | `src/db/seed-data.ts` | Restart dev or `npm run db:seed` |
| Protocol how-to / equipment | `src/lib/protocol-meta.ts` | Refresh app |
| Morning boost tiers / modifiers | `src/lib/scoring.ts` + seeds + `sunrise-keystone-dialog.tsx` | Tests |
| Sunrise timing / sky rules | `src/lib/sunrise-timing.ts`, `src/lib/sunrise-sky.ts`, `sunrise-keystone-points.ts` | `npx tsx --test src/lib/sunrise-*.test.ts` |
| Magnetico / cold / sleep variants | `src/lib/magnetico.ts`, `cold-thermo-skin-temp.ts`, `sleep-room-temp.ts`, `protocol-variants.ts` | `npm test` |
| Permanent auto-logs | `src/db/seed-data.ts` (`permanent`), `permanent-completions.ts` | — |
| Starter onboarding set | `src/lib/onboarding.ts` | — |
| Region list / scores | `src/db/region-seeds.ts` + `region-scoring.ts` | `npm run db:seed` |
| Tab / deep-link map | `src/lib/app-tabs.ts`, `src/lib/routes.ts` | — |
| New in-page sheet | `src/lib/app-sheets.ts` + `AppShell` + panel component | Avoid new routes |
| Checklist order | `src/lib/checklist-order.ts` | — |
| LWM pillars / keystones | `src/lib/lwm.ts` | — |
| Sitewide disclaimer | `src/components/site-disclaimer.tsx` | — |
| Auth rate limits | `src/lib/rate-limit.ts` | — |
| Admin capabilities | `src/lib/actions/admin.ts`, `admin-panel.tsx` | — |

After structural product changes, **update this document in the same PR** so it stays the source of intent.

---

## 17. Glossary

| Term | Meaning |
|------|---------|
| **Protocol / activity** | Catalog item you can log |
| **Available / via list** | Subset of catalog the user can do |
| **Keystone** | Pillar-defining protocol (sunrise tiers for Light; listed water/magnetism ids for W/M) |
| **Modifier** | Morning-light answers (sky, grounded, skin, sunglasses) that adjust effective day boost |
| **Permanent protocol** | Auto-logs daily while on available list until skipped or removed |
| **Variant value** | Per-log or profile field adjusting base points (gauss, skin temp, sleep temp, sunrise offsets) |
| **Support pillar** | Cold, movement, sleep habits in catalog — fourth display group “S” |
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
- A guaranteed cross-device push-notification service (browser local notifications only)  
- A multi-page product with separate chrome for every feature  

---

*End of design document. Mark sections with your edits; implementers should reconcile code to match.*
