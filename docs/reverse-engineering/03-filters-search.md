# 03 · Filters and search

## What the user sees (public)
- Platform segmented control as three links: `/explore/mobile`, `/explore/web`, `/explore/sites`.
- Taxonomy entry tiles: sites → categories / sections / styles; apps → categories / screens /
  UI elements / flows.
- Chips on each card link to a taxonomy page.

## URL structure (Seen)
| Pattern | Example |
|---|---|
| `/explore/{platform}` | `/explore/sites` |
| `/explore/{platform}/{facet}` | `/explore/sites/styles` |
| `/explore/{platform}/{facet}/{slug}` | `/explore/sites/styles/minimal`, `/explore/web/flows/onboarding` |
| `/explore/sections/{uuid}` | single site section |
| `/explore/screens/{uuid}` | single app screen |
| `/collections/{uuid}/{platform}/screens` | public collection |
| `/discover/sites/latest` | logged-in feed; path segment carries sort | 

## Taxonomy observed for sites (names only, used to inform our own list)
- Sections: hero, features, pricing, social proof, stats, CTA, how it works, navigation,
  footer, showcase.
- Styles: minimal, dark, light, bold, colorful, glass, 3D, illustration, photography, grid,
  black & white, fun, motion, scroll effects.
- Categories: finance, technology, business, health, lifestyle, crypto, food, travel,
  portfolio, other.

## Seen / Inferred / Unknown
| Claim | Label |
|---|---|
| Facets are path segments, not query params, on public pages | Seen |
| Logged-in search/filters use query params | Unknown |
| Search box, keyboard shortcut to focus search | Unknown (not shown to anonymous users) |
| Combining multiple filters | Unknown |
| Semantic / AI search | Unknown (the marketing page advertises agent access; implementation not observable) |

## Our decision
All filter state lives in query params on one route (`/browse?platform=sites&section=hero&style=dark&sort=latest&q=…`) so any combination is shareable; taxonomy landing pages are thin redirects into that route. `/` focuses search.
