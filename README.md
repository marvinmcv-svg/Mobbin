# Specimen

A searchable library of shipped website sections, app screens and flows, with an original
identity. The product behaviour is informed by passive study of public design-reference pages
(`docs/reverse-engineering/`). No code, copy or assets were copied. All sample imagery is
generated, and real content comes only from your own captures.

## Setup

Requires Node 22+ and Postgres 16 with the `pgvector` extension.

```bash
cp .env.example .env
npm install
createdb specimen && createdb specimen_test   # or use the URLs in .env
npm run db:migrate
npm run db:seed          # idempotent: taxonomy + sample products
npm run build && npm start   # http://localhost:3000
```

Regenerate sample imagery with `npm run samples` (then `npm run db:seed`).

## Checks

```bash
npm run typecheck && npm run lint
npm test                 # data-access tests against TEST_DATABASE_URL (drops and reseeds it)
npm run test:e2e         # Playwright smoke tests (starts the app if not running)
npx tsx scripts/qa-screenshots.ts   # docs/qa/ screenshots at 390/768/1440
```

## Map

| Path              | What                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `app/browse`      | Feed with platform tabs (Sites · Web apps · iOS · Android), facets, search, sort, infinite scroll |
| `app/screen/[id]` | Viewer: section / full page, zoom, ←/→ within results, save, copy, related, report                |
| `app/flow/[id]`   | Flow player: strip, arrows, 1–9, autoplay                                                         |
| `app/apps/[slug]` | Everything for one product                                                                        |
| `app/collections` | Saved items                                                                                       |
| `app/report/[id]` | Takedown request → `takedown_requests`                                                            |
| `db/`             | Migrations, runner, seed, sample data                                                             |
| `lib/data/`       | Typed queries and filter parsing                                                                  |
| `docs/`           | Behaviour study, design system, decisions, QA                                                     |

## Status against the plan

- Phase A (behaviour study): done. The requested `/discover/sites/latest` page is login-gated, so it's marked Unknown.
- Phase B (data model, idempotent seed, typed data access with tests): done.
- Phase E (frontend): browse, viewer, flow, app, saved, report, landing, light/dark, done for a first pass. Intercepted-modal viewer, `/clips` and `/admin` still to do.
- Phases C (ingestion), D (hybrid search), F (auth/tiers), G (MCP): not started.
