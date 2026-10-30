# 07 · Collections, saving, sharing

| Claim | Label |
|---|---|
| Every card has a save action and a copy action on hover | Seen |
| Anonymous click on save/copy routes to `/signup/modal` | Seen |
| Public "popular collections" exist with owner handles (`/@handle`) and URL `/collections/{uuid}/{platform}/screens` | Seen |
| Collections can be public and shared by URL | Inferred |
| Copy puts the image on the clipboard (for pasting into design tools) | Inferred from label |
| Collection editing UI, ordering, permissions | Unknown |

## Our decision
Boards are private by default, optional share link. Save opens a small popover to pick a
board (keyboard `S`). Copy writes the image to the clipboard via the async Clipboard API with
a "copied" toast.
