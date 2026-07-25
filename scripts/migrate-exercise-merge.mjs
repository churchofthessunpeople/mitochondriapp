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

const legacyIds = ["morning-movement", "rebounding"];

await sql`
  insert into protocols (
    id, name, description, points, category, time_of_day, allows_multiple,
    sort_order, max_per_day, duration_enabled, reference_minutes,
    max_duration_minutes, active
  )
  values (
    'exercise',
    'Exercise',
    'Rebounding, resistance bands, or walking — indoors or outdoors, with duration.',
    3,
    'movement',
    'anytime',
    true,
    13,
    9999,
    true,
    15,
    120,
    true
  )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    points = excluded.points,
    allows_multiple = excluded.allows_multiple,
    max_per_day = excluded.max_per_day,
    duration_enabled = excluded.duration_enabled,
    reference_minutes = excluded.reference_minutes,
    max_duration_minutes = excluded.max_duration_minutes,
    sort_order = excluded.sort_order,
    active = excluded.active
`;

const usersWithLegacy = await sql`
  select distinct user_id from user_favorites
  where protocol_id in ('morning-movement', 'rebounding')
`;
for (const row of usersWithLegacy) {
  await sql`
    insert into user_favorites (user_id, protocol_id)
    values (${row.user_id}, 'exercise')
    on conflict do nothing
  `;
}
await sql`
  delete from user_favorites
  where protocol_id in ('morning-movement', 'rebounding')
`;
await sql`
  delete from user_schedule_items
  where protocol_id in ('morning-movement', 'rebounding')
`;

console.log("exercise merge (favorites remap + FK only)", {
  legacyDeleted: legacyIds,
  remappedUsers: usersWithLegacy.length,
});
