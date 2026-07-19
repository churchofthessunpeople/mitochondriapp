import { Award, Flame } from "lucide-react";
import type { LevelProgress } from "@/lib/levels";
import { formatLevelLabel, MAX_LEVEL } from "@/lib/levels";
import type { StreakBadgeKey } from "@/lib/streak-badges";
import { cn, formatPoints } from "@/lib/utils";

/** Client-safe badge status (ISO dates). */
export type StreakBadgeView = {
  key: StreakBadgeKey;
  label: string;
  shortLabel: string;
  days: number;
  description: string;
  earned: boolean;
  earnedAt: string | null;
  streakDays: number | null;
};

type LevelBarProps = {
  progress: LevelProgress;
  className?: string;
  compact?: boolean;
};

export function LevelProgressBar({
  progress,
  className,
  compact = false,
}: LevelBarProps) {
  const pct = Math.round(progress.progress * 100);
  return (
    <div className={cn(className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p
          className={cn(
            "font-semibold tracking-tight",
            compact ? "text-sm" : "text-base",
          )}
        >
          {formatLevelLabel(progress.level)}
          {progress.level >= MAX_LEVEL ? (
            <span className="ml-1.5 text-xs font-medium text-accent">Max</span>
          ) : null}
        </p>
        <p className="text-xs tabular-nums text-muted">
          {progress.xpToNextLevel != null
            ? `${formatPoints(progress.xpToNextLevel)} to ${formatLevelLabel(progress.level + 1)}`
            : `${formatPoints(progress.xp)} lifetime`}
        </p>
      </div>
      <div
        className={cn(
          "mt-2 overflow-hidden rounded-full bg-foreground/10",
          compact ? "h-1.5" : "h-2",
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${formatLevelLabel(progress.level)} progress`}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {!compact ? (
        <p className="mt-1.5 text-[11px] text-muted">
          {formatPoints(progress.xp)} lifetime points
        </p>
      ) : null}
    </div>
  );
}

type BadgesProps = {
  badges: StreakBadgeView[];
  className?: string;
};

export function StreakBadgeStrip({ badges, className }: BadgesProps) {
  return (
    <ul className={cn("grid grid-cols-3 gap-2", className)}>
      {badges.map((b) => (
        <li
          key={b.key}
          className={cn(
            "rounded-2xl border px-2.5 py-2.5 text-center",
            b.earned
              ? "border-accent/40 bg-accent/10"
              : "border-border bg-foreground/[0.02] opacity-55",
          )}
          title={b.description}
        >
          <span
            className={cn(
              "mx-auto flex h-8 w-8 items-center justify-center rounded-xl border",
              b.earned
                ? "border-accent/50 bg-accent text-on-accent"
                : "border-border text-muted",
            )}
          >
            {b.earned ? (
              <Award className="h-4 w-4" strokeWidth={2.25} />
            ) : (
              <Flame className="h-4 w-4" strokeWidth={2.25} />
            )}
          </span>
          <p
            className={cn(
              "mt-1.5 text-[11px] font-semibold",
              b.earned ? "text-accent" : "text-muted",
            )}
          >
            {b.shortLabel}
          </p>
          <p className="mt-0.5 text-[10px] tabular-nums text-muted">
            {b.days}d
          </p>
        </li>
      ))}
    </ul>
  );
}
