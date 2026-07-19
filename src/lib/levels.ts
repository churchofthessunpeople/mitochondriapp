/**
 * Player levels from lifetime points (SUM of completion points).
 * Calibrated so Level 10 ≈ 1 year at ~500 pts/day (2× sunrise pace).
 */

export const MAX_LEVEL = 10;

/** Cumulative XP required to enter each level (index 0 = Level 1). */
export const LEVEL_THRESHOLDS = [
  0, // 1
  3_500, // 2 — ~1 week @ 500/day
  10_500, // 3 — ~3 weeks
  21_000, // 4 — ~6 weeks
  38_500, // 5 — ~2.5 months
  63_000, // 6 — ~4 months
  91_000, // 7 — ~6 months
  122_500, // 8 — ~8 months
  154_000, // 9 — ~10 months
  182_500, // 10 — 1 year @ 500/day
] as const;

export type LevelProgress = {
  level: number;
  xp: number;
  /** XP earned within the current level band */
  xpIntoLevel: number;
  /** Width of the current → next band (null at max) */
  xpForNextLevel: number | null;
  /** XP still needed for next level (null at max) */
  xpToNextLevel: number | null;
  /** 0–1 progress within the current level band */
  progress: number;
};

export function levelFromXp(xp: number): LevelProgress {
  const safe = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));

  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safe >= LEVEL_THRESHOLDS[i]!) {
      level = i + 1;
      break;
    }
  }

  if (level >= MAX_LEVEL) {
    return {
      level: MAX_LEVEL,
      xp: safe,
      xpIntoLevel: 0,
      xpForNextLevel: null,
      xpToNextLevel: null,
      progress: 1,
    };
  }

  const floor = LEVEL_THRESHOLDS[level - 1]!;
  const ceil = LEVEL_THRESHOLDS[level]!;
  const span = ceil - floor;
  const into = safe - floor;

  return {
    level,
    xp: safe,
    xpIntoLevel: into,
    xpForNextLevel: span,
    xpToNextLevel: Math.max(0, span - into),
    progress: span > 0 ? Math.min(1, into / span) : 1,
  };
}

export function formatLevelLabel(level: number): string {
  return `Level ${level}`;
}
