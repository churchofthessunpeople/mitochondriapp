"use client";

import { useState } from "react";
import {
  LeaderboardTable,
  type LeaderboardRow,
} from "@/components/leaderboard-table";
import { cn } from "@/lib/utils";

export type LeaderboardBoards = {
  lightWeek: LeaderboardRow[];
  week: LeaderboardRow[];
  month: LeaderboardRow[];
  allTime: LeaderboardRow[];
  friendsWeek: LeaderboardRow[];
};

type BoardKey = keyof LeaderboardBoards;

const TABS: {
  key: BoardKey;
  label: string;
  blurb: string;
  empty: string;
}[] = [
  {
    key: "lightWeek",
    label: "Week · light",
    blurb:
      "Light-category points only this week — morning outdoor light, sun, sunset…",
    empty: "No light logs this week yet.",
  },
  {
    key: "week",
    label: "Week · all",
    blurb: "All points this week.",
    empty: "No weekly points yet.",
  },
  {
    key: "month",
    label: "Month",
    blurb: "Last 30 days.",
    empty: "No monthly points yet.",
  },
  {
    key: "allTime",
    label: "All time",
    blurb: "Lifetime lifetime totals.",
    empty: "Leaderboard is empty.",
  },
  {
    key: "friendsWeek",
    label: "Friends",
    blurb: "Private board among accepted friends (this week).",
    empty: "Add friends to see a private board.",
  },
];

export function LeaderboardPanel({
  boards,
  currentUserId,
  onOpenFriends,
}: {
  boards: LeaderboardBoards;
  currentUserId: string;
  onOpenFriends?: () => void;
}) {
  const [tab, setTab] = useState<BoardKey>("lightWeek");
  const meta = TABS.find((t) => t.key === tab)!;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-accent">Ranks</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Leaderboard
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          One timeframe at a time · multi-logs are capped
        </p>
      </div>

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

      {tab === "friendsWeek" && onOpenFriends && (
        <button
          type="button"
          onClick={onOpenFriends}
          className="text-xs text-accent hover:underline"
        >
          Manage friends →
        </button>
      )}

      <LeaderboardTable
        rows={boards[tab]}
        currentUserId={currentUserId}
        emptyMessage={meta.empty}
      />
    </div>
  );
}
