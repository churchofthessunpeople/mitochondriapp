"use client";

import { useEffect, useState } from "react";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { getLeaderboardsAction } from "@/lib/actions/leaderboards";
import {
  leaderboardCacheDay,
  type LeaderboardBoards,
} from "@/lib/leaderboards";
import { cn } from "@/lib/utils";

export type { LeaderboardBoards };

type BoardKey = keyof LeaderboardBoards;

const EMPTY: LeaderboardBoards = {
  day: [],
  week: [],
  month: [],
  allTime: [],
};

const CLIENT_CACHE_KEY = "mito-leaderboards-v4";
const CLIENT_DAY_KEY = "mito-leaderboards-day";

function readClientCache(): LeaderboardBoards | null {
  try {
    const day = sessionStorage.getItem(CLIENT_DAY_KEY);
    if (day !== leaderboardCacheDay()) return null;
    const raw = sessionStorage.getItem(CLIENT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LeaderboardBoards;
    if (
      !parsed?.day ||
      !parsed?.week ||
      !parsed?.month ||
      !parsed?.allTime
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeClientCache(boards: LeaderboardBoards) {
  try {
    sessionStorage.setItem(CLIENT_DAY_KEY, leaderboardCacheDay());
    sessionStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(boards));
  } catch {
    /* private mode / quota */
  }
}

const TABS: {
  key: BoardKey;
  label: string;
  blurb: string;
  empty: string;
}[] = [
  {
    key: "day",
    label: "Yesterday",
    blurb: "Previous UTC day — full closed totals.",
    empty: "No points logged yesterday.",
  },
  {
    key: "week",
    label: "Week",
    blurb: "Last 7 closed UTC days (through yesterday).",
    empty: "No weekly points yet.",
  },
  {
    key: "month",
    label: "Month",
    blurb: "Last 30 closed UTC days (through yesterday).",
    empty: "No monthly points yet.",
  },
  {
    key: "allTime",
    label: "All time",
    blurb: "Lifetime totals through yesterday.",
    empty: "Leaderboard is empty.",
  },
];

export function LeaderboardPanel({
  boards: initialBoards,
  currentUserId,
  compact,
}: {
  /** Optional prefetched boards; when omitted, loads on mount (daily-cached). */
  boards?: LeaderboardBoards | null;
  currentUserId: string;
  /** Hide page title when nested under Account tabs */
  compact?: boolean;
}) {
  const [tab, setTab] = useState<BoardKey>("day");
  const [boards, setBoards] = useState<LeaderboardBoards>(
    initialBoards ?? EMPTY,
  );
  const [loading, setLoading] = useState(!initialBoards);
  const meta = TABS.find((t) => t.key === tab)!;

  useEffect(() => {
    if (initialBoards) {
      setBoards(initialBoards);
      setLoading(false);
      writeClientCache(initialBoards);
      return;
    }

    const fromSession = readClientCache();
    if (fromSession) {
      setBoards(fromSession);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getLeaderboardsAction()
      .then((next) => {
        if (cancelled) return;
        setBoards(next);
        writeClientCache(next);
      })
      .catch(() => {
        if (!cancelled) setBoards(EMPTY);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialBoards]);

  return (
    <div className="space-y-4">
      {!compact && (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Ranks
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Leaderboard
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            One timeframe at a time · ranks refresh once a day
          </p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm",
              tab === t.key
                ? "bg-accent text-on-accent"
                : "border border-border text-muted hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted">{meta.blurb}</p>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted">Loading ranks…</p>
      ) : (
        <LeaderboardTable
          rows={boards[tab]}
          currentUserId={currentUserId}
          emptyMessage={meta.empty}
        />
      )}
    </div>
  );
}
