# 00 · Behavior spec summary

**Target:** `/discover/sites/latest` is login-gated (Seen); spec derived from public
`/explore/sites` and `/explore/web` (Seen) plus clearly-marked inferences.

## Behavior spec (what our product must do)
1. Feed of website **sections** and app **screens**, newest first by default, with a sort switch (latest / popular).
2. Platform switch: iOS · Android · Web app · **Sites**.
3. Facets: for sites → section type, style, category; for apps → pattern, UI element, category, flow. Facets combine and live in the URL.
4. Grid: 2 columns ≥ 900 px, 1 column below; 24 px gaps (12 px on phones); natural-height section images; 16:10 frames for web-app screens; phone frames for mobile.
5. Card: image **or muted looping video clip that plays while in view** (REA #2–5), hover affordances (open, save, copy), scrollable tag chips, app identity row.
6. Viewer: dedicated URL, crop/full toggle, save/copy, metadata, related, next/prev in the current result set.
7. Collections with save/copy everywhere, optional public share link.
8. Gating by configuration; anonymous preview + sign-up wall.
9. Motion: 150–200 ms colour/opacity transitions on standard ease curves; skeleton pulse for loading.

## Where we deliberately differ (our own design decisions)
| Area | Reference behaviour | Ours |
|---|---|---|
| Identity | Monochrome, grotesk sans, pill buttons | "Specimen sheet": warm paper / ink palette, vermilion accent, serif display + mono labels, 6 px radii, catalogue numbers on cards |
| Viewer | Full page navigation | Intercepted overlay + real route, ←/→ stepping, zoom |
| Loading | Flat grey fill, pulse | Dominant-colour placeholder fading to image |
| Filters | Path-segment pages | Single `/browse` route with query params, sticky filter bar |
| Pagination | Fixed page + wall | Infinite scroll + "load more" button, wall only if configured |
| Dark mode | None on public pages | Light + dark tokens |
| Search | Not visible anonymously | Hybrid full-text + vector search, `/` to focus |
| Content | Their captures | Only our own captures; every item has app, version, capture date, and a report link |
