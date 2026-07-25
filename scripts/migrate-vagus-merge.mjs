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

// Catalog definitions live in seed-data.ts + content/ — do not write
// survivor activity patches to Neon. Only remaps + FK row for favorites.

await sql`
  insert into protocols (
    id, name, description, points, category, time_of_day, allows_multiple,
    sort_order, max_per_day, duration_enabled, reference_minutes,
    max_duration_minutes, active
  )
  values (
    'vagus-nerve-stimulation',
    'Vagus nerve stimulation',
    'Cold face immersion (5), baking soda water (4), or castor oil navel (6) — practices that stimulate the vagus nerve.',
    5,
    'other',
    'anytime',
    true,
    52,
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
    category = excluded.category,
    allows_multiple = excluded.allows_multiple,
    max_per_day = excluded.max_per_day,
    duration_enabled = excluded.duration_enabled,
    sort_order = excluded.sort_order,
    active = excluded.active
`;

const legacyIds = [
  "castor-oil-navel",
  "baking-soda-water",
  "cold-face-plunge",
];

const usersWithLegacy = await sql`
  select distinct user_id from user_favorites
  where protocol_id in (
    'castor-oil-navel',
    'baking-soda-water',
    'cold-face-plunge'
  )
`;
for (const row of usersWithLegacy) {
  await sql`
    insert into user_favorites (user_id, protocol_id)
    values (${row.user_id}, 'vagus-nerve-stimulation')
    on conflict do nothing
  `;
}
await sql`
  delete from user_favorites
  where protocol_id in (
    'castor-oil-navel',
    'baking-soda-water',
    'cold-face-plunge'
  )
`;
await sql`
  delete from user_schedule_items
  where protocol_id in (
    'castor-oil-navel',
    'baking-soda-water',
    'cold-face-plunge'
  )
`;

console.log("vagus nerve merge (favorites remap + FK only)", {
  legacyIds,
  remappedUsers: usersWithLegacy.length,
});
