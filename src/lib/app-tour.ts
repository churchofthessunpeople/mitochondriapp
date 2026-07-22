import type { AppTab, TodaySection } from "@/lib/app-tabs";

export type TourStep = {
  id: string;
  /** Matches `data-tour` on the target element */
  target: string;
  title: string;
  body: string;
  appTab?: AppTab;
  todaySection?: TodaySection;
  /** Prefer bubble below (default) or above the target */
  placement?: "above" | "below";
};

const BASE_TOUR_STEPS: TourStep[] = [
  {
    id: "overview",
    target: "today-overview",
    title: "Today at a glance",
    body: "Points and streak for this day live here. Expand for a fuller summary of light, water, and magnetism scores.",
    appTab: "schedule",
    todaySection: "checklist",
  },
  {
    id: "morning-light",
    target: "morning-light",
    title: "Sunrise",
    body: "Your keystone check-in. Tap to log your sunrise experience - it can boost the rest of today’s points.",
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
    body: "Habits that auto-log every day while they’re on your list - tap to skip a night if needed.",
    appTab: "schedule",
    todaySection: "checklist",
  },
  {
    id: "place",
    target: "today-tab-place",
    title: "Place",
    body: "Open Place to set your ZIP for sunrise/sunset and local light & magnetism context.",
    appTab: "schedule",
    todaySection: "checklist",
    placement: "below",
  },
  {
    id: "place-zip",
    target: "place-panel",
    title: "Your location",
    body: "Enter a US ZIP here. Sun times and place scores update from your coordinates.",
    appTab: "schedule",
    todaySection: "place",
  },
  {
    id: "mitoversity",
    target: "nav-mitoversity",
    title: "Mitoversity",
    body: "Articles on why light, water, magnetism and the specific activities in this app matter.",
    appTab: "mitoversity",
    placement: "above",
  },
];

const GUEST_TOUR_STEP: TourStep = {
  id: "save-progress",
  target: "nav-save-progress",
  title: "Save your progress",
  body: "You’re in guest mode. Tap Save anytime to create a username and keep history + leaderboard access.",
  appTab: "schedule",
  todaySection: "checklist",
  placement: "above",
};

export function getAppTourSteps(isGuest: boolean): TourStep[] {
  return isGuest ? [...BASE_TOUR_STEPS, GUEST_TOUR_STEP] : BASE_TOUR_STEPS;
}
