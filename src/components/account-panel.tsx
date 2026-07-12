/**
 * Shared account user shape. UI lives in AccountHome (expandable cards).
 */
export type AccountPanelUser = {
  username: string;
  displayName: string | null;
  name: string | null;
  email: string | null;
  timezone: string | null;
  showOnLeaderboard: boolean;
  memberSinceLabel: string | null;
};
