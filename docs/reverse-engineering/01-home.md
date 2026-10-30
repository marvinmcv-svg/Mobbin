# 01 · Home / marketing page

## What the user sees
- Sticky top bar: logo, three text links (agent integration, customers, pricing), social icons, "log in", and a filled pill CTA.
- Large centred headline (three lines at 1440 px) with small app-icon tiles inlined between words.
- Sub-headline with a live-looking screen count, then two CTAs: a primary filled pill and a secondary grey pill with an arrow.
- Below the fold: a framed mock of the logged-in product (app shell with "Apps / Sites" switch and icon buttons), followed by sections for the library, the agent integration, customer logos, and a closing CTA.
- Cookie banner fixed to the bottom centre (dark pill with accept / deny).

## Measurable details
| Detail | Value | Label |
|---|---|---|
| Header position | `position: sticky`, transparent background at top | Seen |
| Body font | custom grotesk with a size-adjusted fallback (Next.js font pipeline) | Seen |
| Document height @1440 | ≈ 8 100 px | Seen |
| Images on page | ≈ 290 `<img>` elements, mostly WebP from an image CDN | Seen |
| Section rhythm | large vertical gaps (≈ 160–240 px) between sections | Inferred (from screenshots) |
| Marquee motion | no CSS `animation` found on rows; any horizontal motion is JS-driven or absent for anonymous users | Inferred |
| Framework | Next.js (`next-size-adjust` meta, `_next` assets) | Seen |
| OG image 1200×630 served from a headless CMS | Seen |

## Seen / Inferred / Unknown
| Claim | Label |
|---|---|
| Gated deep links redirect here with a `redirect_to` query param | Seen |
| After login the user is returned to `redirect_to` | Inferred |
| Marketing copy and hero assets are CMS-managed | Inferred (OG image host) |
| A/B testing on hero copy | Unknown |

## Our decision
Our landing page uses our own headline, an animated marquee of **our own captures**, and
an editorial "specimen sheet" look (see `00-summary.md`). No inline brand-icon tiles.
