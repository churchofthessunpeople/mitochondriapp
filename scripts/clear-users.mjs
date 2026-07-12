/**
 * Wipe users and related auth/completion data. Keeps protocols.
 * Usage: npm run db:clear-users
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const sql = neon(url);

console.log("Clearing users and related data...");

// Order matters if any FKs lack cascade
await sql`DELETE FROM daily_completions`;
await sql`DELETE FROM sessions`;
await sql`DELETE FROM accounts`;
await sql`DELETE FROM verification_tokens`;
await sql`DELETE FROM rate_limits`;
await sql`DELETE FROM users`;

const usersLeft = await sql`SELECT count(*)::int AS n FROM users`;
const protocols = await sql`SELECT count(*)::int AS n FROM protocols`;

console.log("Users remaining:", usersLeft[0]?.n ?? 0);
console.log("Protocols kept:", protocols[0]?.n ?? 0);
console.log("Done. You can register fresh accounts.");
