/**
 * Add username column, backfill from email, make email optional.
 * Usage: npm run db:migrate-username
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });
config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL);

console.log("Migrating users → username auth...");

// Add column if missing
await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username text
`;

// Backfill from email local-part or name
await sql`
  UPDATE users
  SET username = lower(
    regexp_replace(
      split_part(coalesce(email, name, id), '@', 1),
      '[^a-zA-Z0-9_]',
      '',
      'g'
    )
  )
  WHERE username IS NULL OR username = ''
`;

// Ensure usernames start with a letter
await sql`
  UPDATE users
  SET username = 'u' || username
  WHERE username ~ '^[0-9_]'
`;

// De-dupe by appending short id suffix where needed
await sql`
  UPDATE users u
  SET username = left(u.username, 16) || '_' || left(replace(u.id, '-', ''), 6)
  WHERE u.id IN (
    SELECT id FROM (
      SELECT id,
        row_number() OVER (PARTITION BY username ORDER BY created_at) AS rn
      FROM users
      WHERE username IS NOT NULL
    ) t
    WHERE rn > 1
  )
`;

// Empty fallback
await sql`
  UPDATE users
  SET username = 'user_' || left(replace(id, '-', ''), 8)
  WHERE username IS NULL OR username = ''
`;

await sql`ALTER TABLE users ALTER COLUMN username SET NOT NULL`;

// Unique index
await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (username)`;

// Email optional
await sql`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`;

const rows = await sql`SELECT username, email FROM users LIMIT 20`;
console.log("Sample users:", rows);
console.log("Done.");
