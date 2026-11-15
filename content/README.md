# Public content

The public site reads `public-content.json`. It is generated; don't edit it by
hand. Edit `research/protocols.md` and `research/articles.md`, then run:

```bash
npm run content:build
```

Only protocols marked `app: ready` become activities. Internal ids in the text
are replaced with display names, and mentions of held-back protocols are
reworded or dropped.

## Activity shape

```json
{
  "id": "sunrise-horizon",
  "name": "…",
  "summary": "…",
  "pillar": "light",
  "steps": ["…"],
  "equipment": "none",
  "equipmentDetail": null,
  "cautions": "…",
  "articleIds": ["sunrise-why"],
  "sources": [{ "label": "384778", "url": "https://forum.jackkruse.com/posts/384778/" }]
}
```

Activities intentionally contain no account, completion, duration, score, or
point fields.

## Article shape

```json
{
  "id": "sunrise-why",
  "title": "…",
  "pillar": "light",
  "summary": "…",
  "keyPoints": ["…", "…", "…"],
  "sections": [{ "body": "…" }, { "heading": "…", "body": "…" }],
  "terms": ["Melanopsin"],
  "relatedProtocolIds": ["sunrise-horizon"],
  "sources": [{ "label": "384778", "url": "https://forum.jackkruse.com/posts/384778/" }]
}
```

The app shows `keyPoints` (3–5) first and keeps `sections` collapsed under
them. The first section of an article has no heading. `relatedProtocolIds`
lists only activities shown in the app, and each one links back through its
`articleIds`. `terms` names glossary entries found in the article's text.

## Glossary

`glossary` is a list of `{ "term": "…", "meaning": "…" }`, built from the
glossary table in `research/articles.md`. It holds only terms used by at least
one public article.

## Build checks

`content:build` fails when:

- a public article's sections run over 1,200 words (under 800 is a warning);
  each research pass rebalances within that budget instead of only adding;
- an article has fewer than 3 or more than 5 key points;
- any public text (activities, articles, shipped glossary meanings) names a
  disease or diagnosis from `scripts/disease-terms.mjs`.

A passing mention you accept goes in `disease-allowlist.json` as
`{ "id": "…", "term": "…", "reason": "…" }`, where `id` is the activity or
article id (or `glossary:<Term>`) and `term` is the label from the list.
