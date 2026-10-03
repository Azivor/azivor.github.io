# Azivor design system

This is the current visual rule for Home, Explore, Builds, About, and the `/components/` reference page. Preserve the paper-airplane mark, blue Earth-descent opening, restrained glass surfaces, and clear page hierarchy.

## Typography — one serif moment

**EB Garamond is only for the opening headline in the homepage Earth hero** (`.hero-content h1`). The rest of that hero, its glass panel, every section below it, all other pages, navigation, buttons, cards, forms, footer, and the component library use **Geist**. Do not use a serif for article titles or interior page heroes. This rule supersedes earlier notes describing EB Garamond as the general display font.

The source tokens are `--font-hero` (EB Garamond) and `--font-body` (Geist) in `src/styles/tokens.css`. `--font-display` remains an alias for Geist so shared heading components stay sans-serif. The catalog at `/components/` labels the hero exception, but its own headings use Geist. System fallbacks are Georgia for the hero and Arial for the rest.

Use type size, weight, spacing, and color to distinguish headings after the hero. Large type elsewhere should still feel clean and direct, as in the original “A blank page. Endless possibilities.” section.

Do not use Unicode symbols or emoji-prone characters as website icons or decorative cues. They can change appearance across browsers and phones. Prefer clear text without an icon; when an icon is necessary, draw it with SVG or CSS and check it at desktop and phone widths. Use a Unicode symbol only when the user specifically requests one.

## Color, materials, and motion

The Earth scene belongs to the homepage. The shift from dark blue through cloud blue to a light page sets the palette for all four pages. Keep the transition gradual and preserve readable white hero text. Use one clear cyan-tinted glass feature panel in the descent; avoid stacking glass layers for decoration. Shared buttons, surfaces, radii, and focus states live in `src/styles/components.css`, with reusable values in `src/styles/tokens.css`. Page composition lives in `src/styles/home.css` and `src/styles/content.css`.

Use the same transparent, viewport-centered header on Home, Explore, Builds, and About: wordmark left, page links centered, with no separate navbar strip or color block. Each interior hero begins in the same dark blue behind the header. Blend every section background into the next with gradients; avoid sharp color jumps at the header, hero, or content seams.

On Home, the three category cards share the same styles and copy as their examples in `/components/`: blue featured Build, silver editorial Workflows, and pale compact New capabilities. They are whole-card links without numbered labels or repeated “Explore” CTAs. Keep the shared card CSS in `src/styles/category-cards.css` so the homepage and library cannot drift. Reserve visual showcases for real builds or screenshots; do not fabricate project mockups to fill empty cards. The latest real build supplies the homepage Builds preview. The opening Explore control uses a drawn SVG down arrow and carries the visitor through the Earth descent to the first information section at a readable pace. User scrolling or navigation cancels that trip; reduced-motion users jump straight to the section.

The footer keeps its current content and fades from white into the reference's pale blue-gray `#dde2ed`. The color transition spans the full viewport width; do not copy the reference footer's extra controls or columns.

The original transparent header remains at the top of each page. On desktop Home, a 356 × 52px glass route switcher appears only when the Earth descent reaches its reveal panel, around 80% of the scene. It stays hidden during the earlier Earth animation. On Explore, Builds, and About, the original four navigation links stay in the same centered position; scrolling a little causes the frosted shell to form around those very links. The Home glass links use that same centered 22px gap and link padding, and both glass shells fit the group closely. The original header wordmark scrolls away. Do not swap or duplicate the links on inner pages. The current page receives a restrained translucent capsule only in the glass state; its edges extend 9px beyond each side of the link box so the label can breathe without shifting the links. On an unmodified desktop click of another glass-nav route, the capsule slides to that link briefly before navigating; keyboard navigation and reduced-motion settings skip the delay.

The shared glass uses the supplied tint, rim, shine, and SVG refraction map with a slightly stronger frost. Supported Chromium can render refraction; other engines use backdrop blur. Reduced-transparency users get an opaque light surface. Keep route text legible over dark blue and pale editorial sections. Never show the glass pill on mobile: retain the existing three-bar menu and full-screen overlay there. Hidden navigation must not be keyboard-focusable. The filter cannot blur the separately composited Earth canvas itself, so the tint and rim carry that part of the journey. The `/components/` page shows the same glass material.

The three plain menu bars animate into an X and open a full-screen overlay on narrow screens. Maintain visible keyboard focus and a usable reduced-motion layout. The Earth canvas should remain a visual layer behind real HTML text and controls.

The opening headline, supporting text, and Explore control stay fixed during the Earth descent. As the globe rises, its curved edge progressively hides that copy; do not fade or move the copy away. Keep the HTML controls above the canvas and use the scene's sphere geometry to clip the copy. Reduced-motion and fallback views keep the opening copy fully visible.

## Keeping the guide and examples aligned

`DESIGN.md` records the rule; the visual component library renders the shared tokens and components. The file is not parsed by the site build. When changing a shared visual rule, update the source styles/components, the relevant library example, and this guide together, then inspect the actual Home and interior pages at desktop and phone widths. The Earth shader and other scene-specific values are not all represented by catalog swatches.

## Design review workflow

For changes to layout, typography, color, cards, or motion, apply the design-director skill and ask a design-review agent to critique the result. Compare the relevant composition and interaction patterns against polished contemporary sites and the supplied references, then inspect the actual pages at desktop and phone widths. Use comparisons to improve hierarchy, spacing, materials, and clarity; preserve Azivor’s existing identity and factual content. Update this guide and the visual component library when a shared rule changes.

## Information hierarchy

Below the homepage journey and on Explore, Builds, and About, use a split editorial composition: a narrower orientation column and a wider reading column. Section introductions remain in view on desktop; stack them above content at 700px and below. Geist section headings use a 36–54px scale, module headings 22–28px, body text 16px with a 64ch maximum, and metadata 12px. Preserve the existing inner-page heroes and the homepage Earth sequence.

Give content a format that matches its role: actual project screenshot plus linked title for builds; ordered rows for the Human Loop and revision exercise; one inset prompt; a comparison recipe with result/correction/effort criteria; visible notes for guidance and limitations. Page contents are native fragment links with at least 44px targets, including every major chapter. They reflow without horizontal scrolling. All desktop anchor destinations clear the centered glass navigation. Shared examples live in the component library; no fabricated projects or decorative stacked glass.

The informational design references were Linear Method (grouped navigation and article rhythm), Anthropic Engineering (separated summary and reading detail), and GOV.UK layout/paragraph guidance (readable measure and distinct prose roles). These are design references, not measured evidence of learning improvement.

### Boxed information surfaces

The information pages use a quiet cloud-white ground (#f4f8fc) with related white, pale cyan (#e2f0f8), and cool silver (#e9edf6) boxes to distinguish content roles. Preserve textual headings and ordered source sequences so color is never the only signpost. The Human Loop has a wide opening stage and two supporting stage boxes on desktop; exercise steps use equal boxes in reading order. Build overview pairs the summary with its real scene capture, and case-study details/attribution/limits use clearly bounded surfaces. Prose stays in readable panels. Below 900px, narrow process boxes stack; below 700px the main chapter layout stacks.

Interior heroes blend through an opaque 220px blue-to-cloud transition (180px on phones), beginning below the white supporting text. Do not compress the fade into a translucent 64px band. The ground at the seam matches the page exactly. Homepage Earth introduction and animation are unchanged.
