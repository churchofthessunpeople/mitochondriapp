"use client";

import { logoutAction } from "@/lib/actions/auth";

export function OnboardingExitButton({ isGuest }: { isGuest: boolean }) {
  return (
    <form
      action={logoutAction}
      onSubmit={(e) => {
        if (
          isGuest &&
          !window.confirm(
            "Exit guest mode? Your progress will be lost unless you save an account first.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm text-muted hover:text-foreground"
      >
        {isGuest ? "Exit guest" : "Log out"}
      </button>
    </form>
  );
}
