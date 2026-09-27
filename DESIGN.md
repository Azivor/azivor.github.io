# Azivor design system

This is the current visual rule for Home, Explore, Builds, About, and the `/components/` reference page. Preserve the paper-airplane mark, blue Earth-descent opening, restrained glass surfaces, and clear page hierarchy.

## Typography — one serif moment

**EB Garamond is only for the opening headline in the homepage Earth hero** (`.hero-content h1`). The rest of that hero, its glass panel, every section below it, all other pages, navigation, buttons, cards, forms, footer, and the component library use **Geist**. Do not use a serif for article titles or interior page heroes. This rule supersedes earlier notes describing EB Garamond as the general display font.

The source tokens are `--font-hero` (EB Garamond) and `--font-body` (Geist) in `src/styles/tokens.css`. `--font-display` remains an alias for Geist so shared heading components stay sans-serif. The catalog at `/components/` labels the hero exception, but its own headings use Geist. System fallbacks are Georgia for the hero and Arial for the rest.

Use type size, weight, spacing, and color to distinguish headings after the hero. Large type elsewhere should still feel clean and direct, as in the original “A blank page. Endless possibilities.” section.

## Color, materials, and motion

The Earth scene belongs to the homepage. The shift from dark blue through cloud blue to a light page sets the palette for all four pages. Keep the transition gradual and preserve readable white hero text. Use one clear cyan-tinted glass feature panel in the descent; avoid stacking glass layers for decoration. Shared buttons, surfaces, radii, and focus states live in `src/styles/components.css`, with reusable values in `src/styles/tokens.css`. Page composition lives in `src/styles/home.css` and `src/styles/content.css`.

Use the same transparent, viewport-centered header on Home, Explore, Builds, and About: wordmark left, page links centered, with no separate navbar strip or color block. Each interior hero begins in the same dark blue behind the header. Blend every section background into the next with gradients; avoid sharp color jumps at the header, hero, or content seams.

On Home, the three category cards use one quiet pale-periwinkle surface, restrained borders and shadows, compact consistent spacing, and a whole-card link. Keep their writing concrete and avoid repeating “Explore” CTAs inside each card. Reserve visual showcases for real builds or screenshots; do not fabricate project mockups to fill empty cards. The latest real build supplies the homepage Builds preview. The opening Explore control points down and carries the visitor through the Earth descent to the first information section at a readable pace. User scrolling or navigation cancels that trip; reduced-motion users jump straight to the section.

The original transparent header remains at the top of each page. On desktop Home, a smaller 480 × 52px glass route switcher appears only when the Earth descent reaches its reveal panel, around 80% of the scene. It stays hidden during the earlier Earth animation. On Explore, Builds, and About, the original four navigation links stay in the same centered position; scrolling a little causes the frosted shell to form around those very links. The original header wordmark scrolls away. Do not swap or duplicate the links on these inner pages. The current page receives a restrained translucent capsule only in the glass state.

The shared glass uses the supplied tint, rim, shine, and SVG refraction map with a slightly stronger frost. Supported Chromium can render refraction; other engines use backdrop blur. Reduced-transparency users get an opaque light surface. Keep route text legible over dark blue and pale editorial sections. Never show the glass pill on mobile: retain the existing three-bar menu and full-screen overlay there. Hidden navigation must not be keyboard-focusable. The filter cannot blur the separately composited Earth canvas itself, so the tint and rim carry that part of the journey. The `/components/` page shows the same glass material.

The three plain menu bars animate into an X and open a full-screen overlay on narrow screens. Maintain visible keyboard focus and a usable reduced-motion layout. The Earth canvas should remain a visual layer behind real HTML text and controls.

## Keeping the guide and examples aligned

`DESIGN.md` records the rule; the visual component library renders the shared tokens and components. The file is not parsed by the site build. When changing a shared visual rule, update the source styles/components, the relevant library example, and this guide together, then inspect the actual Home and interior pages at desktop and phone widths. The Earth shader and other scene-specific values are not all represented by catalog swatches.

## Design review workflow

For changes to layout, typography, color, cards, or motion, apply the design-director skill and ask a design-review agent to critique the result. Compare the relevant composition and interaction patterns against polished contemporary sites and the supplied references, then inspect the actual pages at desktop and phone widths. Use comparisons to improve hierarchy, spacing, materials, and clarity; preserve Azivor’s existing identity and factual content. Update this guide and the visual component library when a shared rule changes.
