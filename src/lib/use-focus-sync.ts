"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** Ignore bursty focus + visibility events from the same return. */
const MIN_INTERVAL_MS = 2_000;

/**
 * Pull fresh RSC props when the user returns to this tab/window
 * (alt-tab, other browser tab, Windows virtual desktop, phone→PC).
 * Skips the initial mount — server data is already current then.
 */
export function useFocusSync() {
  const router = useRouter();
  const lastRefreshAt = useRef(0);
  const leftPage = useRef(false);

  useEffect(() => {
    function refreshIfNeeded() {
      if (!leftPage.current) return;
      leftPage.current = false;
      const now = Date.now();
      if (now - lastRefreshAt.current < MIN_INTERVAL_MS) return;
      lastRefreshAt.current = now;
      router.refresh();
    }

    function markLeft() {
      leftPage.current = true;
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        markLeft();
        return;
      }
      refreshIfNeeded();
    }

    function onBlur() {
      markLeft();
    }

    function onFocus() {
      refreshIfNeeded();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [router]);
}
