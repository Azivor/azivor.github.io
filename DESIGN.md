# Azivor design system

This is the current visual rule for Home, Explore, Builds, About, and the `/components/` reference page. Preserve the paper-airplane mark, blue Earth-descent opening, restrained glass surfaces, and clear page hierarchy.

## Typography — one serif moment

**EB Garamond is only for the opening headline in the homepage Earth hero** (`.hero-content h1`). The rest of that hero, its glass panel, every section below it, all other pages, navigation, buttons, cards, forms, footer, and the component library use **Geist**. Do not use a serif for article titles or interior page heroes. This rule supersedes earlier notes describing EB Garamond as the general display font.

The source tokens are `--font-hero` (EB Garamond) and `--font-body` (Geist) in `src/styles/tokens.css`. `--font-display` remains an alias for Geist so shared heading components stay sans-serif. The catalog at `/components/` labels the hero exception, but its own headings use Geist. System fallbacks are Georgia for the hero and Arial for the rest.

Use type size, weight, spacing, and color to distinguish headings after the hero. Large type elsewhere should still feel clean and direct, as in the original “A blank page. Endless possibilities.” section.

## Color, materials, and motion

The Earth scene and the shift from dark blue through cloud blue to a light page belong to the homepage. Keep the transition gradual and preserve readable white hero text. Use one clear cyan-tinted glass feature panel in the descent; avoid stacking glass layers for decoration. Shared buttons, surfaces, radii, and focus states live in `src/styles/components.css`, with reusable values in `src/styles/tokens.css`. Page composition lives in `src/styles/home.css` and `src/styles/content.css`.

The three plain menu bars animate into an X and open a full-screen overlay on narrow screens. Maintain visible keyboard focus and a usable reduced-motion layout. The Earth canvas should remain a visual layer behind real HTML text and controls.

## Keeping the guide and examples aligned

`DESIGN.md` records the rule; the visual component library renders the shared tokens and components. The file is not parsed by the site build. When changing a shared visual rule, update the source styles/components, the relevant library example, and this guide together, then inspect the actual Home and interior pages at desktop and phone widths. The Earth shader and other scene-specific values are not all represented by catalog swatches.
