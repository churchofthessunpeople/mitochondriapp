import type { AppTab, TodaySection } from "@/lib/app-tabs";

export type TourStep = {
  id: string;
  /** Matches `data-tour` on the target element (omit for centered modal steps) */
  target?: string;
  title: string;
  body: string;
  appTab?: AppTab;
  todaySection?: TodaySection;
  /** Prefer bubble below (default) or above the target */
  placement?: "above" | "below";
  /** Centered dialog (no spotlight). Used for the closing Jack Kruse tip. */
  modal?: boolean;
  /** Optional outbound link shown on modal steps */
  link?: { href: string; label: string };
};

const BASE_TOUR_STEPS: TourStep[] = [
  {
    id: "overview",
    target: "today-overview",
    title: "Today at a glance",
    body: "Points and streak for this day live here. Expand this bar for Light / Water / Magnetism progress and how points feed your level.",
    appTab: "schedule",
    todaySection: "checklist",
  },
  {
    id: "morning-light",
    target: "morning-light",
    title: "Sunrise",
    body: "Your most important daily habit. Tap to log morning light — it can multiply the rest of today’s points.",
    appTab: "schedule",
    todaySection: "checklist",
  },
  {
    id: "edit-activities",
    target: "edit-activities",
    title: "Edit activities",
    body: "Choose what you can actually do. Only selected activities appear on your checklist.",
    appTab: "schedule",
    todaySection: "checklist",
  },
  {
    id: "available",
    target: "section-available",
    title: "Available",
    body: "Your checklist for today. Tap a row to log it.",
    appTab: "schedule",
    todaySection: "checklist",
  },
  {
    id: "performed",
    target: "section-performed",
    title: "Performed",
    body: "Once you log an activity, it moves here so you can see what you’ve already done today.",
    appTab: "schedule",
    todaySection: "checklist",
  },
  {
    id: "permanent",
    target: "section-permanent",
    title: "Permanent",
    body: "Habits that auto-log every day while they’re on your list — tap to skip a night if needed.",
    appTab: "schedule",
    todaySection: "checklist",
  },
  {
    id: "place",
    target: "today-tab-place",
    title: "Place",
    body: "Open Place to set a US ZIP for sunrise/sunset and local light & magnetism context.",
    appTab: "schedule",
    todaySection: "checklist",
    placement: "below",
  },
  {
    id: "place-zip",
    target: "place-panel",
    title: "Your location",
    body: "Enter a US ZIP here (US only for now). Sun times and place scores update from your coordinates.",
    appTab: "schedule",
    todaySection: "place",
  },
  {
    id: "mitoversity",
    target: "nav-mitoversity",
    title: "Mitoversity",
    body: "Articles on why light, water, magnetism and the specific activities in this app matter. Start with the pinned beginner set.",
    appTab: "mitoversity",
    placement: "above",
  },
];

const GUEST_TOUR_STEP: TourStep = {
  id: "save-progress",
  target: "nav-save-progress",
  title: "Save your progress",
  body: "You’re in guest mode (24 hours). Tap Save progress to create a username and keep history + leaderboard access before it expires.",
  appTab: "schedule",
  todaySection: "checklist",
  placement: "above",
};

/** Final tip — always last, after guest Save step when applicable. */
const KRUSE_TOUR_STEP: TourStep = {
  id: "jack-kruse",
  modal: true,
  title: "Go deeper with Dr. Jack Kruse",
  body: "This app is inspired by Dr. Kruse’s light–water–magnetism teaching. Visit his site for the full library of essays, forums, and getting-started guides.",
  link: {
    href: "https://jackkruse.com/getting-started/",
    label: "Visit jackkruse.com",
  },
};

export function getAppTourSteps(isGuest: boolean): TourStep[] {
  const steps = isGuest
    ? [...BASE_TOUR_STEPS, GUEST_TOUR_STEP]
    : [...BASE_TOUR_STEPS];
  return [...steps, KRUSE_TOUR_STEP];
}
