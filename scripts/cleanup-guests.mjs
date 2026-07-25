/**
 * Delete guest accounts older than 24 hours.
 * Converted accounts (is_guest = false) are kept.
 *
 *   npm run db:cleanup-guests
 *   npm run db:cleanup-guests -- --dry-run
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const sql = neon(url);
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

const stale = await sql`
  select id, username, created_at
  from users
  where is_guest = true
    and created_at < ${cutoff.toISOString()}
  order by created_at asc
`;

console.log(
  `Found ${stale.length} guest(s) older than ${cutoff.toISOString()}`,
);
if (stale.length > 0 && stale.length <= 20) {
  for (const row of stale) {
    console.log(`  ${row.username}  created ${row.created_at}`);
  }
}

if (dryRun) {
  console.log("Dry-run — no deletes.");
  process.exit(0);
}

if (stale.length === 0) {
  console.log("Nothing to delete.");
  process.exit(0);
}

const result = await sql`
  delete from users
  where is_guest = true
    and created_at < ${cutoff.toISOString()}
  returning id
`;

console.log(`Deleted ${result.length} guest account(s).`);
