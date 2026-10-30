# 06 · Animations / clips

| Claim | Label |
|---|---|
| "Motion" / "UI animations" / "scroll effects" exist as site styles | Seen |
| No `<video>` elements rendered for anonymous visitors on explore pages | Seen |
| Formats, hover-to-play rules, loop behavior | Unknown |

## Our decision
Clips are short muted loops (WebM + MP4 fallback + poster). Play when ≥ 60 % in view or on
hover, pause off-screen, never autoplay under `prefers-reduced-motion`.
