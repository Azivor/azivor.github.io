# Project AGI homepage

A static placeholder homepage using an sky blue palette, EB Garamond headings, and translucent glass controls.

## Local preview

Run `python3 -m http.server 4173 --directory dist` and open localhost:4173.
No dependencies or build step required. `dist/` is authored source and is tracked.

## Hosting

ChatGPT Sites configuration is in `.openai/hosting.json`. Publish the exact committed source using the Sites connector and static asset packager.

## Design

Requested reference: https://cluely.com. Reference inspection was blocked by the browser security-policy service, so no reference code or assets were copied. The user then supplied a screenshot; the final visual direction follows its saturated sky-blue-to-white background, white serif headline, compact blue glass controls, and large colorful preview panel. No reference code or assets were copied. All copy is provisional. Fonts are loaded from Google Fonts, with system fallbacks. Navigation links move to sections on this page; there are no app or account features.

## Visual refinement

The subsequent live-reference audit confirmed EB Garamond 500, looser headline tracking, compact 44px controls, directional radial lighting on the opaque blue CTA, and translucent dark overlays. `dist/refinements.css` applies those scoped changes, including matching Safari blur properties and reduced-motion support. The simple background from the supplied screenshot is preserved.
