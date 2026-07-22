import { config } from "dotenv";
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`
  insert into content_overrides (key, value, updated_at)
  values (
    'protocol:cold-face-plunge',
    ${JSON.stringify({ active: false, deleted: true })}::jsonb,
    now()
  )
  on conflict (key) do update set
    value = excluded.value,
    updated_at = now()
`;

await sql`
  insert into content_overrides (key, value, updated_at)
  values (
    'protocol:cold-thermogenesis',
    ${JSON.stringify({
      name: "Cold thermogenesis",
      active: true,
      points: 24,
      category: "cold",
      maxPerDay: 9999,
      permanent: false,
      sortOrder: 51,
      timeOfDay: "anytime",
      allowsMultiple: true,
      durationEnabled: true,
      lockedTimeOfDay: null,
      referenceMinutes: 15,
      maxDurationMinutes: 20,
      description:
        "Plunge / shower or face immersion. Pick mode, skin temp (~50°F target), and duration for plunge/shower — face immersion is 3 rounds.",
    })}::jsonb,
    now()
  )
  on conflict (key) do update set
    value = excluded.value,
    updated_at = now()
`;

await sql`
  update protocols
  set
    name = 'Cold thermogenesis',
    description = 'Plunge / shower or face immersion. Pick mode, skin temp (~50°F target), and duration for plunge/shower — face immersion is 3 rounds.',
    points = 24,
    duration_enabled = true,
    max_duration_minutes = 20
  where id = 'cold-thermogenesis'
`;

// Remap favorites
const usersWithLegacy = await sql`
  select distinct user_id from user_favorites
  where protocol_id = 'cold-face-plunge'
`;
for (const row of usersWithLegacy) {
  await sql`
    insert into user_favorites (user_id, protocol_id)
    values (${row.user_id}, 'cold-thermogenesis')
    on conflict do nothing
  `;
}
await sql`delete from user_favorites where protocol_id = 'cold-face-plunge'`;
await sql`delete from user_schedule_items where protocol_id = 'cold-face-plunge'`;

console.log("cold merge overrides applied", {
  faceDeleted: true,
  remappedUsers: usersWithLegacy.length,
});
