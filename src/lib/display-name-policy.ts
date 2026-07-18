/** Days between display name changes (after onboarding grace). */
export const DISPLAY_NAME_CHANGE_COOLDOWN_DAYS = 30;

/** New accounts can change display name freely for this many days. */
export const DISPLAY_NAME_ONBOARDING_GRACE_DAYS = 7;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type DisplayNameChangeUser = {
  createdAt: Date;
  displayNameChangedAt: Date | null;
};

export function displayNameChangeBlockedUntil(
  user: DisplayNameChangeUser,
  now = new Date(),
): Date | null {
  const nowMs = now.getTime();
  const onboardingEnds =
    user.createdAt.getTime() +
    DISPLAY_NAME_ONBOARDING_GRACE_DAYS * MS_PER_DAY;
  if (nowMs < onboardingEnds) return null;

  if (!user.displayNameChangedAt) return null;

  const nextAllowed =
    user.displayNameChangedAt.getTime() +
    DISPLAY_NAME_CHANGE_COOLDOWN_DAYS * MS_PER_DAY;
  if (nowMs >= nextAllowed) return null;
  return new Date(nextAllowed);
}

export function formatDisplayNameChangeRetry(retryAfter: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(retryAfter);
}
