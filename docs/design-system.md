# Specimen design system

The identity borrows from natural-history specimen sheets and type catalogues: warm paper,
ink, a single vermilion accent, catalogue numbers, mono labels. All tokens live in
`app/globals.css` (`:root` / `[data-theme="dark"]` plus an `@theme inline` bridge to Tailwind).

## Colour

| Token          | Light     | Dark      | Use                                                             |
| -------------- | --------- | --------- | --------------------------------------------------------------- |
| `paper`        | `#f5f1ea` | `#141311` | page background                                                 |
| `paper-raised` | `#fbf9f5` | `#1c1a17` | inputs, panels, buttons                                         |
| `paper-sunken` | `#ebe5da` | `#0d0c0b` | placeholders, hover fills, segmented controls                   |
| `ink`          | `#1a1714` | `#f0ebe2` | primary text, primary buttons                                   |
| `ink-soft`     | `#5b544b` | `#b5ada1` | secondary text (AA on paper)                                    |
| `ink-faint`    | `#8d857a` | `#8a8278` | labels, meta (large/mono use only)                              |
| `rule`         | `#d9d1c3` | `#34302a` | borders and dividers                                            |
| `accent`       | `#d6401f` | `#ff6a45` | one highlight per view: active save, emphasis, hover on primary |
| `focus`        | `#2457d6` | `#8fb0ff` | focus ring (never the accent)                                   |

Theme: follows the OS by default; the header toggle cycles Auto → Light → Dark and stores
the choice in `localStorage`, applied by an inline script before first paint.

## Type

- Display: **Fraunces** (variable, optical size) for headings and the wordmark.
- Text: **IBM Plex Sans** 400/500/600.
- Meta: **IBM Plex Mono** 400/500 for labels, tags, counts, keyboard hints.
- Scale: 11 (tags) · 12 (meta) · 14 (UI) · 16 (body) · 18 (lead) · 24/30/36/48/72 (display).

## Spacing, radius, elevation

- 4 px base; page gutters 16 px (< 640) / 32 px; grid gaps 24 × 40 px (sites), 16–24 × 32 px (phones).
- Radius: `tile` 6 px (controls), `frame` 14 px (image frames), 22–28 px for phone captures.
- One shadow, `shadow-lift`: hairline + soft drop, used on hover and in the viewer.

## Motion

| Name               | Value                                                                                    | Use                                     |
| ------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| `ease-out-soft`    | `cubic-bezier(0.22, 1, 0.36, 1)`                                                         | entrances, image fade-in, hover lift    |
| `ease-in-out-soft` | `cubic-bezier(0.65, 0, 0.35, 1)`                                                         | reserved for shared-element transitions |
| Durations          | 150 ms colour, 200 ms hover/opacity, 220 ms viewer/flow image swap, 300 ms image fade-in |                                         |
| Marquee            | 60 s linear loop, pauses on hover                                                        | landing only                            |

`prefers-reduced-motion: reduce` collapses all animations/transitions; the flow player also
drops its slide.

## Components

Header · ThemeToggle · BrowseShell (sticky filter bar) · ScreenGrid · ScreenCard (+ skeleton)
· Viewer · FlowPlayer · SaveButton / CopyButton · Toaster · ReportForm · SavedShelf.
