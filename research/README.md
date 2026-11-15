# Research — Dr. Jack Kruse forum index

Source material for the app's display of Kruse's own theories, built from his posts on forum.jackkruse.com (Mar 11 – Nov 14, 2026).

## Docs
- `protocols.md` — app source. Practical protocols (id, pillar, `app: ready|hold`, summary, steps, equipment, his cautions, `why` article ids, 2–5 forum post links). Paraphrased only; no critiques.
- `articles.md` — app source. Theory articles (id, pillar, linked `protocols`, 3–5 `key points`, body, 3–12 forum post links) plus a glossary. Paraphrased only; no critiques. `why` ↔ `protocols` links agree both ways.
- `inconsistencies.md` — research only, never shown in the app. Contradictions (C1…), shifts over time and factual slips (C26, C43, C45 sub-items), ≤6 post links per bullet.

The repo is public, so `inconsistencies.md`, `daily-protocol.md`, `notes/`, `rewrite/`, `archive/` and `raw/` are gitignored and stay local. Files pushed before that are still in git history.

## Public content rules
- Explain his model; never name diseases, diagnoses or treatment claims in anything the app shows. `npm run content:build` fails on terms in `scripts/disease-terms.mjs`; accepted passing mentions go in `content/disease-allowlist.json`. Condition material stays in held (`app: hold`) entries.
- Each public article body is 800–1,200 words. A pass rebalances within that budget: new material replaces weaker or repeated material instead of being appended.
- Each article starts with `- **key points:**` and 3–5 indented `  - ` bullets, the plain takeaways; the body under it is the deep dive and is collapsed in the app.
- The app shows each article's glossary terms under it, so define terms in the glossary table rather than at length in the body. Drop glossary rows no article uses.

## Raw sources (`raw/`)
| Range | Posts | Files |
|---|---|---|
| Pilot (selected threads) | 126 | `kruse-pilot-threads.json` |
| Nov 7 – Nov 14, 2026 | 156 | `kruse-dec-posts.json`, `dec-batch-1..4.md` |
| Oct 11 – Nov 7, 2026 | 421 | `kruse-nov-posts.json`, `nov-batch-1..11.md` |
| Sep 11 – Oct 10, 2026 | 273 | `kruse-month-posts.json`, `month-batch-1..5.md` |
| Aug 11 – Sep 10, 2026 | 430 | `kruse-aug-posts.json`, `aug-batch-1..10.md` |
| Jul 11 – Aug 10, 2026 | 498 | `kruse-jul-posts.json`, `jul-batch-1..8.md` |
| Jun 16 – Jul 10, 2026 | 237 | `kruse-jun-posts.json`, `jun-batch-1..3.md` |
| May 11 – Jun 9, 2026 | 581 | `kruse-may-posts.json`, `may-batch-1..12.md` |
| Apr 11 – May 10, 2026 | 955 | `kruse-apr-posts.json`, `apr-batch-1..16.md` |
| Mar 11 – Apr 10, 2026 | 779 | `kruse-mar-posts.json`, `mar-batch-1..20.md` |
| Thread openers Jun 11 – Sep 10 (missed earlier) | 50 | `kruse-thread-starters.json`, `starters-batch-1..2.md` |

4,506 unique posts in total (the May, April and March counts include 26, 30 and 36 thread-opening posts; Nov adds 421; the Nov 7–14 pull adds 156, starting after post 387530). JSON files are arrays of threads with `posts: [{id, date, url, text}]`.

## Notes (`notes/`)
Per-batch reader notes (teachings, protocols, contradictions, slips): `group-1..4` (pilot), `dec-1..4` (Nov 7–14), `month-1..5`, `nov-1..11`, `aug-1..10`, `jul-1..8`, `jun-1..3`, `may-1..12`, `starters-1..2`, `apr-1..16`, `mar-1..20`.

## Archive (`archive/`)
The old long-form index (`kruse-teachings.md`, `kruse-teachings-details.md`, `kruse-references.md`), kept for reference; superseded by the three docs above.

## YouTube (parallel source)
Interviews and talks featuring Kruse are extracted into `raw/youtube-<videoId>.*` (timed transcript, plain text, meta) with reader notes in `notes/youtube-<videoId>.md`. Teachings are paraphrased into `articles.md` / `protocols.md` the same way as forum notes (later statements win; stay inside the article word budget; no disease names in public text). Public `sources:` lines stay forum-post links; YouTube URLs live in the notes and in `inconsistencies.md` when a talk conflicts with the forum.

## Optimal Klubs blog (paywalled — protocols ok, not articles)
Membership WordPress blog at [optimalklubs.com/blog/](https://optimalklubs.com/blog/) (archives from mid-2017).

- **Do not** add blog material into `articles.md` (paywalled theory stays out of public theory pages).
- **Do** update `protocols.md` when a post adds practical steps, settings or cautions the app should show — paraphrase only; no disease names; do **not** cite Optimal Klubs URLs in public `sources:` (forum links only).
- Always save raw + notes and fold teachings into the searchable index `notes/blog-kb.md` (tag with `` `blog:ID` ``).

Pipeline: fetch while logged in via REST (`wp-json/wp/v2/posts?per_page=100&page=N`, full body `wp-json/wp/v2/posts/{id}` → `content.rendered`). Save `raw/blog-{id}.meta.txt`, `.html`, `.plain.txt` and `notes/blog-{id}.md`.

## Method
1. Fetch his posts via XenForo member search (`user_id=1031`), paging back with `before=`; throttle 2.5 s per request and stop on any 429/403. Run the in-page delay on a Web Worker timer (one resolver per call), because background-tab timers get throttled. Each fetched thread page yields every listed post on it, so far fewer requests are needed than posts; save progress to `localStorage` so a page navigation doesn't lose it.
2. Member search links his thread-opening posts to the thread itself (no `post-` id), so in the same loop fetch each such thread and take its first post. Earlier passes missed these and they were collected separately for Jun 11 – Sep 10; Sep 11 – Oct 10 openers were already covered by the pilot.
3. Split into ~90k-character batches (threads over 85k split by post); one reader agent at a time writes a notes file per batch. When extracting notes for the merge, keep indented sub-bullets with their parent bullet.
4. Merge the notes into the three docs (later statements win over earlier ones). For large months, split the notes by destination (article section, protocols, contradictions) and merge each section separately, then reassemble `articles.md`. Articles follow one shape: key points, a plain opening claim, mechanism one idea per paragraph (`####` subheadings for long ones), then what he says to do. New material is worked into that flow within the word budget, not appended; settings and cautions that don't fit an article belong in its protocol. New terms go in the glossary. Then `npm run content:build` (budget, key points, disease terms) and a node check confirm every cited post id exists in `raw/`, ids are unique, `why`/`protocols` links agree, source caps hold, no critique wording, and no 10-word run is copied from a post.

## Next pass
Forward, one month at a time: Nov 15 – Dec 10, 2026 (forum; last post pulled is 388100, Nov 14). Extend `kruse-dec-posts.json` and the `dec-` batches rather than starting a new set. Watch for the replacement for the beeswax candle test ("Decentralized Physics #13", see C85) before changing that protocol. Not yet folded into articles from Nov 7–14: the lattice-lock cascade numbers and the copper–water hydrogen-bond thread (see C83). Optional: fold remaining Nov theory into `articles.md` / `inconsistencies.md`; blog already has `blog-12378` noted. Backward pulls stop at Mar 11, 2026; new posts reflect his current view and replace older material within the budget. `daily-protocol.md` stays personal and is not updated from this pass.
