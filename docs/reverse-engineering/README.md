# Reverse-engineering notes (behavior only)

Method: passive observation of public, anonymous-visitor pages with headless Chromium
(Playwright, CDP) on 2026-10-30 at viewports 1440×900, 768×1024 and 390×844. We recorded
DOM structure, computed layout, CSS transitions, URL patterns and response metadata
(content types and hosts). We did not log in, did not call private APIs, did not download
image assets, and did not keep screenshots in this repo.

Files 01–09 come from a first pass done with Playwright. REA (`rea-agents@6.7.0`) was then
run against the same pages: see **`10-rea-findings.md`** for its Evidence IDs and the
corrections it made. Where 01–09 and 10 disagree, file 10 wins.

Labels: **Seen** = directly observed. **Inferred** = reasoned from evidence. **Unknown** = not
determinable without breaking the ground rules.

Target requested: `/discover/sites/latest`. **Seen:** anonymous visitors are redirected to
`/?redirect_to=%2Fdiscover%2Fsites%2Flatest` (the marketing home). The page itself is
behind login, so its exact behavior is **Unknown**. The closest public page is
`/explore/sites`, which these notes use as the primary reference.

Files:
- `01-home.md` · `02-browse-grid.md` · `03-filters-search.md` · `04-screen-viewer.md`
- `05-flow-viewer.md` · `06-clips.md` · `07-collections.md` · `08-gating.md`
- `09-navigation-states.md` · `10-rea-findings.md` · `00-summary.md`
