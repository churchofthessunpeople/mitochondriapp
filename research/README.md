# Research — Dr. Jack Kruse forum index

Source material for the app's display of Kruse's own theories, built from his posts on forum.jackkruse.com (Apr 11 – Oct 10, 2026).

## Docs
- `protocols.md` — app source. Practical protocols (id, pillar, `app: ready|hold`, summary, steps, equipment, his cautions, `why` article ids, 2–5 forum post links). Paraphrased only; no critiques.
- `articles.md` — app source. Theory articles (id, pillar, linked `protocols`, body, 3–12 forum post links) plus a glossary. Paraphrased only; no critiques. `why` ↔ `protocols` links agree both ways.
- `inconsistencies.md` — research only, never shown in the app. Contradictions (C1…), shifts over time and factual slips (C26, C43, C45 sub-items), ≤6 post links per bullet.

## Raw sources (`raw/`)
| Range | Posts | Files |
|---|---|---|
| Pilot (selected threads) | 126 | `kruse-pilot-threads.json` |
| Sep 11 – Oct 10, 2026 | 273 | `kruse-month-posts.json`, `month-batch-1..5.md` |
| Aug 11 – Sep 10, 2026 | 430 | `kruse-aug-posts.json`, `aug-batch-1..10.md` |
| Jul 11 – Aug 10, 2026 | 498 | `kruse-jul-posts.json`, `jul-batch-1..8.md` |
| Jun 16 – Jul 10, 2026 | 237 | `kruse-jun-posts.json`, `jun-batch-1..3.md` |
| May 11 – Jun 9, 2026 | 581 | `kruse-may-posts.json`, `may-batch-1..12.md` |
| Apr 11 – May 10, 2026 | 955 | `kruse-apr-posts.json`, `apr-batch-1..16.md` |
| Thread openers Jun 11 – Sep 10 (missed earlier) | 50 | `kruse-thread-starters.json`, `starters-batch-1..2.md` |

3,150 unique posts in total (the May and April counts include 26 and 30 thread-opening posts). JSON files are arrays of threads with `posts: [{id, date, url, text}]`.

## Notes (`notes/`)
Per-batch reader notes (teachings, protocols, contradictions, slips): `group-1..4` (pilot), `month-1..5`, `aug-1..10`, `jul-1..8`, `jun-1..3`, `may-1..12`, `starters-1..2`, `apr-1..16`.

## Archive (`archive/`)
The old long-form index (`kruse-teachings.md`, `kruse-teachings-details.md`, `kruse-references.md`), kept for reference; superseded by the three docs above.

## Method
1. Fetch his posts via XenForo member search (`user_id=1031`), paging back with `before=`; throttle 2.5 s per request and stop on any 429/403. Run the in-page delay on a Web Worker timer (one resolver per call), because background-tab timers get throttled.
2. Member search links his thread-opening posts to the thread itself (no `post-` id), so in the same loop fetch each such thread and take its first post. Earlier passes missed these and they were collected separately for Jun 11 – Sep 10; Sep 11 – Oct 10 openers were already covered by the pilot.
3. Split into batches; one reader agent at a time writes a notes file per batch.
4. Merge the notes into the three docs (later statements win over earlier ones). For large months, split the notes by destination (article section, protocols, contradictions) and merge each section separately, then reassemble `articles.md`. There is no size cap: keep every substantive teaching, setting and caution, and skip only restatements. Articles follow one shape: a plain opening claim, mechanism one idea per paragraph (terms defined on first use, `####` subheadings for long ones), then what he says to do; new material is worked into that flow, not appended. New terms go in the glossary. Then a node check confirms every cited post id exists in `raw/`, ids are unique, `why`/`protocols` links agree, source caps hold, no critique wording, and no 10-word run is copied from a post.

## Next pass
Mar 11 – Apr 10, 2026.
