"use client";

import { useTransition } from "react";
import { startGuestAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function GuestStartButton({
  className,
  label = "Continue as guest",
}: {
  className?: string;
  label?: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => startGuestAction())}
      className={cn(className, pending && "opacity-60")}
    >
      {pending ? "Starting…" : label}
    </button>
  );
}
