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
  "sections": [{ "body": "…" }, { "heading": "…", "body": "…" }],
  "relatedProtocolIds": ["sunrise-horizon"],
  "sources": [{ "label": "384778", "url": "https://forum.jackkruse.com/posts/384778/" }]
}
```

The first section of an article has no heading. `relatedProtocolIds` lists only
activities shown in the app, and each one links back through its `articleIds`.
