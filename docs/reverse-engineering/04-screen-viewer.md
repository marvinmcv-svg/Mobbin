# 04 · Screen / section detail viewer

## What the user sees (public `/explore/sections/{uuid}`)
- Full page (not modal). Breadcrumb: explore › sites › sections.
- Large rounded container (≈ 32 px radius, 1 px border). Header row: app icon + "{App} {Section}" title, a segmented control **Section | Full page**, and save / copy buttons on the right.
- Large centred image of the section; a spinner appears while the full-res image loads.

## Measurable details
| Detail | Value | Label |
|---|---|---|
| Navigation from card | full navigation (URL changes, no `[role=dialog]`) | Seen |
| Section/full-page toggle | segmented control in header | Seen |
| Loading indicator | small circular spinner overlaid at bottom-centre | Seen |
| Next/previous | not visible to anonymous users | Unknown |
| Zoom | Unknown |
| Related items below | Unknown (not reached in observation) |
| Keyboard shortcuts | Unknown |

## Our decision
Viewer is a route (`/screen/[id]`) that also opens as an intercepted overlay from the grid so
←/→ step through the current result set and Esc returns to the grid scroll position. We
keep the "section vs full page" idea as a generic **crop / full capture** toggle, add
click-to-zoom, metadata panel (app, version, capture date, tags), related screens, and a
report link.
