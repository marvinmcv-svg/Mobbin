# Reverse-engineering notes (behavior only)

Method: passive observation of public, anonymous-visitor pages with headless Chromium
(Playwright, CDP) on 2026-10-30 at viewports 1440×900, 768×1024 and 390×844. We recorded
DOM structure, computed layout, CSS transitions, URL patterns and response metadata
(content types and hosts). We did not log in, did not call private APIs, did not download
image assets, and did not keep screenshots in this repo.

REA (`morluto/rea`) was the intended tool. Installing it in this session was blocked by the
sandbox permission policy, so the same kind of CDP-based passive observation was done with
the pre-installed Playwright. Re-running with REA's `inspect_web_page` /
`observe_web_session` should confirm these notes; nothing here depends on REA-only data.

Labels: **Seen** = directly observed. **Inferred** = reasoned from evidence. **Unknown** = not
determinable without breaking the ground rules.

Target requested: `/discover/sites/latest`. **Seen:** anonymous visitors are redirected to
`/?redirect_to=%2Fdiscover%2Fsites%2Flatest` (the marketing home). The page itself is
behind login, so its exact behavior is **Unknown**. The closest public page is
`/explore/sites`, which these notes use as the primary reference.

Files:
- `01-home.md` · `02-browse-grid.md` · `03-filters-search.md` · `04-screen-viewer.md`
- `05-flow-viewer.md` · `06-clips.md` · `07-collections.md` · `08-gating.md`
- `09-navigation-states.md` · `00-summary.md`
