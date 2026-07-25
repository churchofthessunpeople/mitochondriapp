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

// Catalog SoT is seed-data.ts + content/ — FK + favorites remap only.
const legacyIds = ["mineralized-water", "carbonated-water"];

await sql`
  insert into protocols (
    id, name, description, points, category, time_of_day, allows_multiple,
    sort_order, max_per_day, duration_enabled, reference_minutes,
    max_duration_minutes, active
  )
  values (
    'drinking-water',
    'Drinking water',
    'Log a glass: RO, spring, or deuterium-depleted; optional salt remineralization; still or carbonated. DDW includes deuterium PPM.',
    4,
    'water_food',
    'anytime',
    true,
    50,
    9999,
    false,
    15,
    60,
    true
  )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    points = excluded.points,
    allows_multiple = excluded.allows_multiple,
    max_per_day = excluded.max_per_day,
    duration_enabled = excluded.duration_enabled,
    sort_order = excluded.sort_order,
    active = excluded.active
`;

const usersWithLegacy = await sql`
  select distinct user_id from user_favorites
  where protocol_id in (
    'mineralized-water',
    'carbonated-water'
  )
`;
for (const row of usersWithLegacy) {
  await sql`
    insert into user_favorites (user_id, protocol_id)
    values (${row.user_id}, 'drinking-water')
    on conflict do nothing
  `;
}
await sql`
  delete from user_favorites
  where protocol_id in (
    'mineralized-water',
    'carbonated-water'
  )
`;
await sql`
  delete from user_schedule_items
  where protocol_id in (
    'mineralized-water',
    'carbonated-water'
  )
`;

console.log("drinking water merge (favorites remap + FK only)", {
  legacyDeleted: legacyIds,
  remappedUsers: usersWithLegacy.length,
});
