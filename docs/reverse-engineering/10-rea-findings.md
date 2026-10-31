# 10 · REA findings (REA 6.7.0, 2026-10-31)

Tool: `rea-agents@6.7.0` CLI, attached over CDP to a loopback headless Chromium
(`--remote-debugging-port=9222`). Anonymous visitor only, no login. REA keeps no raw
bodies, cookies, storage values or script source in its Evidence. Raw Evidence JSON stays
outside the repo; this file records only the facts and their Evidence IDs.

| Evidence ID | Operation | Target |
|---|---|---|
| `ev_168aa38d…eef2` | `inspect_web_page` | `/discover/sites/latest` → landed on `/?redirect_to=%2Fdiscover%2Fsites%2Flatest` |
| `ev_32567bde…84b1f` | `inspect_web_page` | `/explore/sites` (4 040 DOM nodes, 3 067 a11y nodes, 66 scripts) |
| `ev_a684cdc0…48f4f` | `inspect_web_page` | `/explore/sections/{uuid}` (one public section page) |
| `ev_51c7f65e…a9ce5` | `analyze_web_bundle` | `/explore/sites`, 61 scripts parsed, 0 failures, completeness `complete` |
| `ev_60c23bda…d574` | `capture_browser_scenario` | load `/explore/sites`, press End twice with 2 s waits; 239 requests |

## What REA confirmed or corrected

| # | Finding | Label | Evidence | Effect on our notes |
|---|---|---|---|---|
| 1 | `/discover/sites/latest` redirects anonymous users to `/?redirect_to=…`; the page itself is never served | Seen | `ev_168a…` | Confirms 08-gating |
| 2 | **The feed cards include video.** 36 `<video>` elements on `/explore/sites` (15 exposed as `Video` in the a11y tree), 7 on a section page | Seen | `ev_3256…`, `ev_a684…` | **Corrects 06-clips**, which said there were none |
| 3 | Feed videos carry `muted loop playsinline preload poster disableremoteplayback disablepictureinpicture` and **no `autoplay`**, so playback is started by script | Seen (attributes) / Inferred (script-driven) | `ev_3256…` | New card behaviour |
| 4 | On the section page the video drops `muted` | Seen | `ev_a684…` | The viewer plays with sound available, while the feed is always muted |
| 5 | During a 6 s session with no hover, 15 video files were range-fetched (HTTP 206) as both `media` and `fetch` | Seen | `ev_60c2…` | Inferred: clips preload or play when they enter the viewport, not only on hover |
| 6 | Pressing End twice fetched **no** new feed data (only images, video and route prefetches) | Seen | `ev_60c2…` | Confirms "fixed first page + wall" for anonymous users |
| 7 | Feed images and videos come from an image CDN as `…/image/…/file.*?enc=…` (61 images) and `…/video/…/file.*?enc=…`; only a single opaque `enc` param, so variants are pre-signed | Seen | `ev_60c2…` | Matches 02; our CDN stays our own |
| 8 | App icons go through the framework image optimizer (`/_next/image?url&w&q`) | Seen | `ev_60c2…` | Our icons use responsive variants as well |
| 9 | Navigation links are prefetched as React Server Component payloads (`?_rsc`) for `/`, `/pricing`, `/login`, `/signup`, `/explore/mobile`, `/mcp`, `/customers` | Seen | `ev_60c2…` | We keep Next `<Link>` prefetch (same mechanism, our own code) |
| 10 | Stack: Next.js (high confidence) + React, webpack runtime | Seen (inference `high`) | `ev_51c7…` | — |
| 11 | Query-parameter names referenced in the bundle include `q`, `sort`, `filter`, `mode`, `flowId`, `videos`, `text_in_screenshot`, `redirect_to` | Seen (static candidates, not proven at runtime) | `ev_51c7…` | Inferred: logged-in search supports text-in-screenshot search, a videos-only toggle and a mode switch. We add `has=video` and OCR text search |
| 12 | Feature flags are streamed over an EventSource from a flagging service; product analytics, a payments SDK and a retention widget load on public pages | Seen | `ev_60c2…` | Not copied. Noted for the gating study only |
| 13 | Local storage key **names** (values are never captured): referral IDs, a dismissed-banner flag, analytics anonymous ID | Seen | `ev_3256…` | — |
| 14 | Accessible structure: one `main`, two `navigation` landmarks, three `radio` controls for the platform switch, card links named "{App} section" | Seen | `ev_3256…` | Our platform switch uses `tablist`; both are acceptable |
| 15 | Logged-in feed, its filters, sort UI and pagination | **Unknown** | — | Needs a login; out of scope by ground rule 2 |

## Product changes made from these findings
- Cards and the viewer support looping video clips: muted in the grid, no `autoplay`
  attribute, and script plays them when ≥ 60 % of the card is in view and pauses them off-screen.
  Nothing plays under `prefers-reduced-motion`; the poster stays.
- `/browse?has=video` filter ("Motion only").
