import { cn, formatPoints } from "@/lib/utils";

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  totalPoints: number;
  totalActions: number;
};

export function LeaderboardTable({
  rows,
  currentUserId,
  emptyMessage,
}: {
  rows: LeaderboardRow[];
  currentUserId?: string;
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="glass rounded-3xl px-6 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="grid grid-cols-[48px_1fr_100px_88px] gap-2 border-b border-border px-4 py-3 text-xs uppercase tracking-[0.14em] text-muted sm:px-6">
        <span>#</span>
        <span>Player</span>
        <span className="text-right">Points</span>
        <span className="text-right">Logs</span>
      </div>
      <ul>
        {rows.map((row) => {
          const isYou = row.userId === currentUserId;
          return (
            <li
              key={row.userId}
              className={cn(
                "grid grid-cols-[48px_1fr_100px_88px] gap-2 border-b border-border/60 px-4 py-3 text-sm last:border-b-0 sm:px-6",
                isYou && "bg-accent/10",
              )}
            >
              <span
                className={cn(
                  "font-semibold",
                  row.rank === 1 && "text-accent-2",
                  row.rank === 2 && "text-slate-200",
                  row.rank === 3 && "text-amber-600",
                )}
              >
                {row.rank}
              </span>
              <span className="truncate font-medium">
                {row.name}
                {isYou && (
                  <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-[11px] text-accent">
                    you
                  </span>
                )}
              </span>
              <span className="text-right font-semibold tabular-nums">
                {formatPoints(row.totalPoints)}
              </span>
              <span className="text-right tabular-nums text-muted">
                {row.totalActions}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
