# Project AGI visual system

Preserve the original paper-airplane A, placeholder content, and simple sky background. Adapt material hierarchy and typography from Cluely, not its product screens, imagery, or copy.

## Evidence and decisions

The initial same-conversation live audit measured EB Garamond 500 at 80px, 0.96 line-height, -1px tracking; Geist supporting text; and opaque radial-lit blue controls. The subsequent audit freshly inspected the hero in Safari but lower-page access was interrupted. Lower-panel measurements below are prior same-conversation observations, not newly reverified.

Prior panel observations: neutral charcoal #21232a at 50% with 8px blur; 12px overlays, 6px small overlays; opaque silver radial fill #DDE2EE to #BBC5DD for supporting cards.

## Adaptation

- Primary actions keep blue radial illumination, a soft directional rim, and short interaction-only shimmer.
- Dark overlay: neutral #21232a at 60%, blur 8px, radius 12px. The slightly stronger fill is a readability adaptation over the light silver panel.
- Light glass: restrained transparent white with directional top lighting and a short contact shadow. When nested inside dark glass, use a 10% black fill to preserve small-label contrast; white-on-white layering otherwise weakens it.
- Silver feature surface: cool opaque radial gradient, radius 20px, small elevation. This replaces the generic multicolor backdrop without borrowing product imagery.
- Solid cards: white, neutral hairline border, no blur. Used for dense content and forms.
- Fonts: EB Garamond for display, Geist for interface/body, system fallbacks retained.
- Keep page layout rules in home.css; material and control rules belong in components.css and tokens.css.

The catalog at /components/ demonstrates the same four materials. Reduced motion and visible keyboard focus apply throughout. Unsupported backdrop blur gets an opaque fallback. Automated checks cover component semantics and page assets; browser review of this revision was unavailable during this run.
