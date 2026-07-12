import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Prefer DATABASE_URL. A placeholder keeps `next build` / module evaluation
 * happy when env vars are not injected yet; real queries still need Neon.
 */
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://build:build@localhost:5432/build?sslmode=require";

const sql = neon(connectionString);

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export const db = globalForDb.db ?? drizzle(sql, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
