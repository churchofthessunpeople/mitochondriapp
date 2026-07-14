import { after } from "next/server";
import { ensureCatalogSyncedToDb } from "@/lib/catalog";

/**
 * Schedule catalog FK sync after the response is sent — never block login/home.
 * Server-only (uses next/server `after`).
 */
export function scheduleCatalogSync() {
  try {
    after(() => {
      void ensureCatalogSyncedToDb();
    });
  } catch {
    void ensureCatalogSyncedToDb();
  }
}
