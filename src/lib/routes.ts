/**
 * Canonical app routes — single-page shell at /app.
 * Prefer these constants (or middleware redirects) over hard-coded legacy paths.
 */

export const ROUTES = {
  home: "/app",
  account: "/app?t=account",
  mitoversity: "/app?t=mitoversity",
  history: "/app?t=history",
  leaderboard: "/app?t=leaderboard",
  friends: "/app?t=friends",
  reminders: "/app?t=reminders",
  /**
   * Legacy path stubs — middleware/pages redirect into /app.
   * Prefer openSheet({ id }) inside the shell instead of linking these.
   */
  regionBrowse: "/region",
  regionScoring: "/region/scoring",
  admin: "/admin",
  exportCsv: "/api/export/csv",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  historyDay: (date: string) => `/history/${date}`,
} as const;

/** Legacy path prefixes that must redirect into the SPA */
export const LEGACY_REDIRECTS: { from: string; to: string; exact?: boolean }[] =
  [
    { from: "/today", to: ROUTES.home },
    { from: "/schedule", to: ROUTES.home },
    { from: "/place", to: ROUTES.home },
    { from: "/activities", to: ROUTES.home },
    { from: "/account", to: ROUTES.account },
    { from: "/history", to: ROUTES.history, exact: true },
    { from: "/leaderboard", to: ROUTES.leaderboard },
    { from: "/friends", to: ROUTES.friends },
    { from: "/reminders", to: ROUTES.reminders },
  ];

/** Paths revalidated after mutations that affect the shell */
export const APP_REVALIDATE_PATHS = [
  ROUTES.home,
  ROUTES.onboarding,
  ROUTES.regionBrowse,
  ROUTES.admin,
] as const;
