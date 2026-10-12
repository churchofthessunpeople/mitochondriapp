# Mitochondriapp

Mitochondriapp is a public, content-first field guide to activities associated
with light, water, magnetism, and supportive mitochondrial habits. It has no
accounts, tracking, points, social features, or database.

## Experience

- The home screen is a quiet central swan with three surrounding activity
  controls: Light, Water, and Magnetism.
- The swan opens Support activities such as sleep, cold, and movement.
- Each activity includes a practical how-to and a longer educational article.
- **Where you are** accepts a US ZIP code and returns ephemeral sun, latitude,
  elevation, geomagnetic, geology, and artificial-EM context.
- The disclaimer remains fixed at the bottom of the screen.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

The core experience starts without environment variables. ZIP context uses
public geocoding and best-effort public enrichment services; lookup failures
are shown in the place dialog rather than persisted.

## Verification

```bash
npm run lint
npm test
npm run build
```

## Content

The runtime reads the database-independent bundle at
`content/public-content.json`, generated from `research/protocols.md` and
`research/articles.md` by `npm run content:build`. Activities and articles are
read-only at runtime and are shipped with the app.

## Deployment handoff

The repository is ready to connect to a new GitHub repository and a new Vercel
project. Do not reuse the old Gmail-linked projects or commit credentials and
environment secrets. No database or authentication settings are required.

## Disclaimer

This project is educational lifestyle content, not medical advice, diagnosis,
or treatment. Consult a qualified healthcare professional before changing a
health routine or stopping prescribed care.
