/**
 * Roll Sun Exposure → Outside Time in Neon content overrides,
 * and soft-delete legacy midday / morning-natural sun activities.
 */
import { config } from "dotenv";
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const outsideTimeProtocol = {
  name: "Outside Time",
  active: true,
  points: 8,
  category: "light",
  maxPerDay: 9999,
  permanent: false,
  sortOrder: 10,
  timeOfDay: "anytime",
  allowsMultiple: true,
  durationEnabled: true,
  lockedTimeOfDay: null,
  referenceMinutes: 15,
  maxDurationMinutes: 120,
};

const outsideTimeMeta = {
  how: "Log outdoor time: pick morning, solar noon, or afternoon (from Place sun times), whether you were in full sun or shade, and how long you stayed.\n\nSlots: morning (sunrise → 1 hour before solar noon), solar noon (1 hour before → 2 hours after), afternoon (then → sunset). Full sun scores higher than shade. Stay within a non-burning window. Sunrise check-in is separate — it unlocks the day boost.",
  articleId: "solar-noon-vitamin-d",
  equipment: "none",
};

await sql`
  insert into content_overrides (key, value, updated_at)
  values
    ('protocol:sun-exposure', ${JSON.stringify(outsideTimeProtocol)}::jsonb, now()),
    ('protocol-meta:sun-exposure', ${JSON.stringify(outsideTimeMeta)}::jsonb, now())
  on conflict (key) do update set
    value = excluded.value,
    updated_at = now()
`;

for (const id of ["midday-sun-skin", "morning-natural-light"]) {
  await sql`
    insert into content_overrides (key, value, updated_at)
    values (
      ${"protocol:" + id},
      ${JSON.stringify({ active: false, deleted: true })}::jsonb,
      now()
    )
    on conflict (key) do update set
      value = excluded.value,
      updated_at = now()
  `;
}

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

// Remap favorites from legacy sun ids → Outside Time
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

const check = await sql`
  select key, value->>'name' as name, value->>'deleted' as deleted
  from content_overrides
  where key in (
    'protocol:sun-exposure',
    'protocol:midday-sun-skin',
    'protocol:morning-natural-light'
  )
`;
console.log("updated overrides", check);
const p = await sql`select id, name from protocols where id = 'sun-exposure'`;
console.log("protocol row", p);
