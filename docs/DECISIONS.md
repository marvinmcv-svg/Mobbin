# Decisions

**2026-10-30 · Studied public pages only.** `/discover/sites/latest` redirects anonymous
visitors to the home page with `redirect_to`, so it was not studied (ground rule 2). The spec
comes from `/explore/sites` and `/explore/web`. See `docs/reverse-engineering/`.

**2026-10-30 · REA not run in this session.** Installing `rea-agents` was blocked by the
sandbox permission policy. Equivalent passive CDP observation was done with the
pre-installed Playwright. Re-run REA locally to confirm the notes.

**2026-10-30 · Placeholder name "Specimen".** The brief left `LIBRARY_NAME` blank. The name
comes from `NEXT_PUBLIC_LIBRARY_NAME`, so renaming is one env change plus the wordmark.

**2026-10-30 · "Sites" as a fourth platform.** Marketing websites are browsed by _section_
(hero, pricing, …) and _style_, not by app pattern or flow. The schema adds
`platform = 'site'`, `screens.kind = 'section'`, `screens.full_image_path` (the full-page
capture a section was cropped from), `patterns.scope`, and a `styles` taxonomy with
`screen_styles`. Everything else follows the brief's schema.

**2026-10-30 · Offset pagination for now.** Offset cursors keep "next/previous within the
current result set" trivial (the viewer carries `?i=`). Switch to keyset cursors for latest
and popular sorts once the table passes ~100k rows.

**2026-10-30 · Filters live in query params on one route.** `/browse?platform=&pattern=&style=&category=&element=&app=&q=&sort=`.
Every combination is shareable. Inputs are parsed with zod and junk falls back to defaults.

**2026-10-30 · Full-text search now, hybrid later.** `search_tsv` is built by
`refresh_screen_tsv()` from the app name, tags, category, description and OCR, with prefix
matching for as-you-type. The `embedding` column and HNSW index exist, but stay empty until
Phase D. "Related" uses tag overlap until vectors exist.

**2026-10-30 · Saves in localStorage until auth.** The `collections` tables exist, and
Phase F moves saves server-side.

**2026-10-30 · Sample content is generated, not captured.** `scripts/generate-samples.ts`
draws SVG mock-ups of invented products, so the UI can be exercised without any third-party
imagery. Replace it with your own captures in Phase C.

**2026-10-30 · Viewer is a page, not yet an intercepted modal.** It already supports ←/→
stepping within the result set, Esc back, prefetching the next item, zoom and the
section/full-page toggle. Turning it into a parallel/intercepting route overlay is next.
