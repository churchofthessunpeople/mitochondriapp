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

const legacyIds = [
  "mineralized-water",
  "carbonated-water",
  "baking-soda-water",
];

for (const id of legacyIds) {
  await sql`
    insert into content_overrides (key, value, updated_at)
    values (
      ${`protocol:${id}`},
      ${JSON.stringify({ active: false, deleted: true })}::jsonb,
      now()
    )
    on conflict (key) do update set
      value = excluded.value,
      updated_at = now()
  `;
}

await sql`
  insert into content_overrides (key, value, updated_at)
  values (
    'protocol:drinking-water',
    ${JSON.stringify({
      name: "Drinking water",
      active: true,
      points: 4,
      category: "water_food",
      maxPerDay: 9999,
      permanent: false,
      sortOrder: 50,
      timeOfDay: "anytime",
      allowsMultiple: true,
      durationEnabled: false,
      lockedTimeOfDay: null,
      referenceMinutes: 15,
      maxDurationMinutes: 60,
      description:
        "Log a glass: RO, spring, or deuterium-depleted; salt or baking soda remineralization; still or carbonated. DDW includes deuterium PPM.",
    })}::jsonb,
    now()
  )
  on conflict (key) do update set
    value = excluded.value,
    updated_at = now()
`;

// protocols table has no `permanent` column — that flag lives in seed/overrides only.
await sql`
  insert into protocols (
    id, name, description, points, category, time_of_day, allows_multiple,
    sort_order, max_per_day, duration_enabled, reference_minutes,
    max_duration_minutes, active
  )
  values (
    'drinking-water',
    'Drinking water',
    'Log a glass: RO, spring, or deuterium-depleted; salt or baking soda remineralization; still or carbonated. DDW includes deuterium PPM.',
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
    'carbonated-water',
    'baking-soda-water'
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
    'carbonated-water',
    'baking-soda-water'
  )
`;
await sql`
  delete from user_schedule_items
  where protocol_id in (
    'mineralized-water',
    'carbonated-water',
    'baking-soda-water'
  )
`;

console.log("drinking water merge overrides applied", {
  legacyDeleted: legacyIds,
  remappedUsers: usersWithLegacy.length,
});
