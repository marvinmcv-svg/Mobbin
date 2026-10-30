# 02 · Browse grid (public `/explore/sites`, `/explore/web`)

## What the user sees
- Page title, a three-way segmented control (mobile / web / sites), then "browse by" tiles
  (categories, sections, styles for sites; categories, screens, UI elements, flows for apps).
- A "trending" feed of large cards. Each card = image, a horizontally scrollable row of tag
  chips, and an app identity row (28 px icon + name).
- After ≈ 60 cards the feed ends with a sign-up wall (see `08-gating.md`).

## Card anatomy (Seen)
```
li
 └ div (flex column, 16 px gap)
    ├ div.group (relative)
    │   ├ a → /explore/sections/<uuid>   (image, overflow hidden, 1 px inset border)
    │   ├ hover overlay: centred "Open" label on a dark scrim (≥720 px only)
    │   └ hover action bar: two equal pill buttons (save / copy), slides up 16 px
    ├ chip row: horizontally scrollable, hidden scrollbar, edge fade + arrow buttons fade in (200 ms)
    └ identity row: 28 px rounded icon + truncated name, underline on hover
```

## Measurable details
| Detail | Value | Label |
|---|---|---|
| Columns @1440 | 2 × 676 px, gap 24 px (x) / 32–40 px (y) | Seen |
| Columns @768 | 1 × 704 px | Seen |
| Columns @390 | 1 × 350 px (16–20 px side gutters) | Seen |
| Column gap token | `--column-gap` 12 px < 720 px, 24 px ≥ 720 px | Seen |
| Breakpoints | container queries at 720 and 840 px plus a 900 px media query | Seen |
| Image aspect | sections: natural height (e.g. 676×465, 704×718); web-app screens: 16:10 (264×165) | Seen |
| Pagination | first page server-rendered (60 items), no infinite scroll for anonymous users | Seen |
| Image format | WebP, single URL (no `srcset`), `loading="eager"` on first items | Seen |
| Image host | dedicated image CDN with signed/encoded query params | Seen |
| Skeleton | Tailwind `pulse` animation 1.5 s ease-in-out on placeholders | Seen |
| Transitions | colour/opacity 150 ms `cubic-bezier(0,0,.2,1)`; 200 ms `cubic-bezier(.4,0,.2,1)` | Seen |
| Logged-in pagination | cursor-based infinite scroll | Inferred (typical; gated) |
| Blur-up placeholders | none observed; flat secondary-background fill instead | Seen |

## Seen / Inferred / Unknown
| Claim | Label |
|---|---|
| Card links go to a standalone page, not a modal | Seen |
| Hover actions route anonymous users to a sign-up modal URL | Seen |
| Tag chips are links into taxonomy pages | Seen |
| Virtualisation of the grid | Unknown |
| Sort options on `/discover/sites/latest` (latest vs popular) | Inferred from URL segment `latest` |

## Our decision
Masonry-free 2/1-column grid like this works well for tall website sections, so we keep a
uniform column grid but: add blurhash-style colour placeholders, `srcset` with 3 widths,
and infinite scroll with a visible "load more" fallback. Hover overlay is our own design
(bottom gradient with label + icon buttons rather than a full scrim).
