"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppContentBundle } from "@/lib/content-overrides";

const AppContentContext = createContext<AppContentBundle | null>(null);

export function AppContentProvider({
  content,
  children,
}: {
  content: AppContentBundle;
  children: ReactNode;
}) {
  return (
    <AppContentContext.Provider value={content}>
      {children}
    </AppContentContext.Provider>
  );
}

export function useAppContent(): AppContentBundle {
  const ctx = useContext(AppContentContext);
  if (!ctx) {
    throw new Error("useAppContent requires AppContentProvider");
  }
  return ctx;
}

export function useAppContentOptional(): AppContentBundle | null {
  return useContext(AppContentContext);
}
