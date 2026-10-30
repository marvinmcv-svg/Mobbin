# QA self-critique (Phase E, first pass)

Screenshots: `{home,browse-sites,browse-ios,screen,flow,app}-{390,768,1440}.png`, plus `-1440-dark`.

What still looks generic or weak:
1. **Filter bar on phones** takes three rows. Collapse facets into one "Filters" sheet below 640 px.
2. **Header nav on phones** clips the last link. Use a menu button, or move the theme toggle into it.
3. **Native `<select>` facets** are accessible but plain, and can't show multi-select. Replace them with a combobox popover that has counts and type-to-filter.
4. **The landing page marquee** uses only site sections. Mix in phone screens for rhythm.
5. **The app icons in the samples** are flat squares and disappear on dark paper. Real icons will fix most of this, but frame icons with a 1 px rule.
6. **Catalogue numbers** appear only on hover. Consider showing them persistently in the meta row, since they're a signature element.
7. **No shared-element transition** between grid and viewer yet (planned with the intercepted route).
8. **Lighthouse not run yet.** Images are SVG placeholders. Real captures need the `srcset` variants from Phase C before mobile performance can be measured honestly.
