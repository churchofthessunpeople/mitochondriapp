/**
 * Remap legacy midday / morning-natural favorites → Outside Time (sun-exposure).
 * Catalog copy lives in seed-data.ts + content/ — not Neon overrides.
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
const sql = neon(url);

await sql`
  update protocols
  set
    name = 'Outside Time',
    description = 'Time outdoors — pick morning, solar noon, or afternoon (from your place sun times), full sun or shaded, and how long you stayed.',
    points = 8,
    max_duration_minutes = 120,
    reference_minutes = 15
  where id = 'sun-exposure'
`;

const legacy = ["midday-sun-skin", "morning-natural-light"];
const usersWithLegacy = await sql`
  select distinct user_id from user_favorites
  where protocol_id = any(${legacy})
`;
for (const row of usersWithLegacy) {
  await sql`
    insert into user_favorites (user_id, protocol_id)
    values (${row.user_id}, 'sun-exposure')
    on conflict do nothing
  `;
}
await sql`
  delete from user_favorites
  where protocol_id = any(${legacy})
`;
await sql`
  delete from user_schedule_items
  where protocol_id = any(${legacy})
`;

const p = await sql`select id, name from protocols where id = 'sun-exposure'`;
console.log("outside time merge (favorites remap + FK only)", {
  remappedUsers: usersWithLegacy.length,
  protocol: p[0],
});
