/**
 * Grant or revoke admin (is_admin) for a username.
 * Requires DATABASE_URL (your DB credentials = the real admin key).
 *
 * Usage:
 *   npm run admin:promote -- yourusername
 *   npm run admin:promote -- yourusername --revoke
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing (.env.local or .env)");
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== "--");
const revoke = args.includes("--revoke");
const username = args.find((a) => !a.startsWith("--"))?.trim().toLowerCase();

if (!username) {
  console.error("Usage: npm run admin:promote -- <username> [--revoke]");
  process.exit(1);
}

const sql = neon(url);
const rows = await sql`
  SELECT id, username, is_admin
  FROM users
  WHERE username = ${username}
  LIMIT 1
`;

const user = rows[0];
if (!user) {
  console.error(`No user with username "${username}"`);
  process.exit(1);
}

const next = !revoke;
await sql`
  UPDATE users
  SET is_admin = ${next}
  WHERE id = ${user.id}
`;

console.log(
  revoke
    ? `Revoked admin from ${user.username} (${user.id})`
    : `Granted admin to ${user.username} (${user.id})`,
);
console.log("Sign out and back in (or refresh /app) if the UI still looks stale.");
