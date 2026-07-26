# Content overlays

Git-tracked Admin / hand edits for the catalog.

| Path | What |
|---|---|
| `activities.json` | **One object per activity** — definition, how-to, equipment, article link, mode `options` |
| `articles/<id>.json` | **One file per Mitoversity article** — flat continuous read (`flatArticle: true`) |
| `categories.json` | Category label overlays |
| `copy.json` | UI copy overlays |
| `registries.json` | Custom activity / article id lists |

- Written by **Admin → Content** when running locally (`npm run dev`)
- Articles are merged from `articles/*.json` at runtime (source of truth)
- Commit and deploy these files for production

### Article shape

```json
{
  "id": "example",
  "title": "…",
  "pillar": "light",
  "summary": "…",
  "relatedProtocolIds": ["…"],
  "flatArticle": true,
  "sections": [
    { "heading": "…", "body": "…" }
  ]
}
```

See `DESIGN.md` §6.1, §11, §16 (decision **P12**).
