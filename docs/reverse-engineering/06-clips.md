# 06 · Animations / clips

| Claim | Label |
|---|---|
| "Motion" / "UI animations" / "scroll effects" exist as site styles | Seen |
| ~~No `<video>` elements~~ **Corrected by REA:** 36 `<video>` elements on `/explore/sites`, `muted loop playsinline`, poster, no `autoplay` (see 10-rea-findings #2–5) | Seen (REA) |
| Clips are range-fetched while scrolling without hover, so playback is likely viewport-driven | Inferred (REA #5) |
| Exact play/pause trigger code | Unknown (we did not read their source) |

## Our decision
Clips are short muted loops (WebM + MP4 fallback + poster). Play when ≥ 60 % in view or on
hover, pause off-screen, never autoplay under `prefers-reduced-motion`.
