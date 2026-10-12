# Mitopet (future idea)

**Status:** Parked — revisit later. Do not implement yet.

**Captured:** 2026-07-21

## Concept

Tamagotchi-style companion that develops as the user logs activities. The existing level/XP system would become the growth engine; the Mitopet is the visible face of that progress.

## Direction we liked

- **Visual layer on XP, not a replacement** — keep `levelFromXp` / Level 1–10 math; map stages (or morphs) to those levels.
- **No death / guilt loop** — prefer slow growth + dormant/cocoon when idle over “pet is sick because you skipped sunrise.” Health apps + shame churn badly.
- **Logging is feeding** — no second currency or pet-food economy that fights the checklist.
- **Optional pillar-reactive traits** — Light / Water / Magnetism / Support logs subtly shape appearance (brighter, fluid, field-glow, sturdy) so pillars feel lived-in.
- **Streaks = vitality, not survival** — week streak → alert; broken streak → quiet/resting; recovers on return.
- **Brand fit** — organism / mito cell / little sun-creature aesthetic, not generic cute-animal Tamagotchi that undercuts Mitoversity tone.
- **Home surface** — Today header or Account; not a mini-game that steals focus from logging.

## Narrow wedge (if/when we build)

Ship **one pet, XP-driven stages, no death, no shops**. Measure whether people open the app *to see the pet*. Only then deepen traits and reactions.

## Open fork

1. **Retarget only** — pretty XP avatar / stage skins (smaller build).
2. **Pillar-reactive companion** — appearance reflects how they play (more design + data).

## Related existing systems

- `src/lib/levels.ts` — lifetime XP → Level 1–10
- Streak badges (`streak-badges.ts`) — emotional job Mitopet might partially absorb
- Level celebration popup (`celebratedLevel` on profile)

## Non-goals (for v1)

- Parallel pet economy
- Pet death / harsh neglect mechanics
- Replacing numerical levels entirely in the UI (can hide the number behind the pet later if stages are clear enough)
