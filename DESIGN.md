---
name: Azivor
description: An editorial magazine for things people can create with AI.
colors:
  editorial-navy: "#143b59"
  editorial-muted: "#405e73"
  editorial-ground: "#f4f8fc"
  editorial-line: "#c5d7e5"
  exercise-cyan: "#d6ebf7"
  evidence-cyan: "#e2f0f8"
  white: "#ffffff"
  accent: "#1e82e0"
  accent-deep: "#1c38ea"
  footer-cloud: "#b8cbd6"
  footer-graphite: "#41464b"
typography:
  hero:
    fontFamily: "EB Garamond, Georgia, serif"
    fontWeight: 500
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(3rem, 6vw, 5.8rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-.035em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.7
rounded:
  editorial-artifact: "14px"
  editorial-action: "10px"
  control: "11px"
  panel: "20px"
spacing:
  small: "1rem"
  medium: "1.5rem"
  large: "2rem"
  section-gap: "3rem"
components:
  editorial-primary:
    backgroundColor: "{colors.editorial-navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.editorial-action}"
    padding: "12px 20px"
  editorial-primary-hover:
    backgroundColor: "#1b557d"
  exercise-entry:
    backgroundColor: "{colors.exercise-cyan}"
    rounded: "{rounded.editorial-artifact}"
    padding: "40px"
---

# Azivor design system

## Overview

**Creative North Star: "Editorial magazine"**

Preserve the paper-airplane mark, the original blue Earth descent, restrained glass navigation, and Geist reading typography. The editorial magazine direction changes the composition of information: let real work lead, offer concise routes, then reveal the depth a visitor chooses.

The homepage audience is anyone with something they want to create. The human directs and owns the work. Project evidence remains bounded to actual published work; the site does not imply measured learning, usability, or graphics-performance outcomes.

**Key Characteristics:**

- Real artifacts lead discovery.
- Page composition follows the content.
- Short entry points reveal optional reading.
- Earth and navigation retain their established identity.

## Colors

The dark blue Earth opening blends into a cloud-white reading ground. Editorial navy carries titles and actions; muted blue-gray carries supporting copy; pale cyan identifies the exercise and evidence insets. Thin blue-gray separators distinguish entries without enclosing every paragraph. These values are extracted from `src/styles/discovery.css`, `src/styles/tokens.css`, and `src/styles/home.css`.

The footer uses clean cloud blue-gray `#b8cbd6`, with coordinated graphite `#41464b` for both copyright and wordmark. Cluely's muted blue-gray footer remains a palette reference; Azivor's latest treatment favors a broad diffuse transition instead of a short upper fade. The shared `footer-fade.svg` samples an almost even OKLab progression with gentle easing only in the outer 12%, plus a faint offset white cloud wash and restrained grain. Spread the blend over the full 300px footer (240px on phones) so it never becomes a narrow horizontal haze band. The top matches white exactly and the bottom matches the shared surface token. Shared material/ink tokens also render in the component library.

## Typography

**EB Garamond is only for the opening headline in the homepage Earth hero** (`.hero-content h1`). The rest of that hero, its glass panel, every section below it, all other pages, navigation, buttons, cards, forms, footer, and the component library use **Geist**. Do not use a serif for article titles or interior page heroes. This rule supersedes earlier notes describing EB Garamond as the general display font.

The source tokens are `--font-hero` (EB Garamond) and `--font-body` (Geist) in `src/styles/tokens.css`. `--font-display` remains an alias for Geist so shared heading components stay sans-serif. The catalog at `/components/` labels the hero exception, but its own headings use Geist. System fallbacks are Georgia for the hero and Arial for the rest.

Use type size, weight, spacing, and color to distinguish headings after the hero. Large type elsewhere should still feel clean and direct, as in the original “A blank page. Endless possibilities.” section.

Do not use Unicode symbols or emoji-prone characters as website icons or decorative cues. They can change appearance across browsers and phones. Prefer clear text without an icon; when an icon is necessary, draw it with SVG or CSS and check it at desktop and phone widths. Use a Unicode symbol only when the user specifically requests one.

Editorial discovery headings use Geist at weight 500, tight tracking, and role-specific scale. The shared interior heading spans 3–5.8rem; the compact Builds masthead is 2.1rem. Reading text is generally 1rem with 1.6–1.7 line height and 65–67ch measure. This scale does not make every route hero the same size.

## Layout

**The Composition Follows Content Rule.** Use distinct layouts for browsing, exercises, project notes, and purpose statements. The former universal split-column chapter layout and three-category-card Home instructions are superseded.

Home retains its original Earth journey and intro above a lead project capture, a short evidence column, and a separate “What do you want to create?” section with exercise and workflow routes. Builds is a compact masthead and artifact-first gallery. Explore uses unequal entries: one prominent exercise, one real project, and shorter workflow and comparison links. About uses a centered statement, a purpose section, and optional questions. The project notebook at `/builds/earth-descent/` has its own local index, artifact overview, decision comparison, and evidence inset. These are current surface patterns, not a requirement to reuse any single composition everywhere.

The main reading container is 72rem. Discovery sections use 32px side gutters on desktop and 20px on phones. The main layout stacks at 700px; narrower refinements occur at 1000px and 360px. The Human Loop reads in three columns on desktop and a vertical sequence on phones. The revision exercise is an ordered row sequence, not a stack of repeated cards. The artifact precedes its explanation in document and phone order.

All desktop fragment destinations leave 100px clearance; phone destinations leave 85px. Preserve `/explore/#first-experiment`, `#workflows`, `#new-capabilities`, and `#build`, as well as the notebook section fragments. Legacy `/builds/` case-study fragments continue to their matching notebook sections.

Interior heroes retain `information-fade.svg`: 65 OKLab color samples on a quintic smootherstep curve, fine grain, and matching seams. Discovery openings retain broad 180px fades on desktop and 150px on phones, positioned below the white copy. The upper blue approach and lower cloud fade share the exact #234f78 endpoint; reading surfaces share #f4f8fc with the hero endpoint and editorial footer start. Home retains its white-start footer after its own content gradient. The original homepage Earth introduction and animation remain separate from these editorial composition rules.

The current editorial references are Hack Club’s real maker work and varied density, Experiments with Google’s browse/detail separation, and Are.na’s compact linked entries. Earlier Linear Method, Anthropic Engineering, and GOV.UK references still inform reading rhythm and clear prose. References guide composition; they do not establish measured outcomes.

## Elevation & Depth

The Earth scene belongs to the homepage. The shift from dark blue through cloud blue to a light page sets the palette for all four pages. Keep the transition gradual and preserve readable white hero text. Use one clear cyan-tinted glass feature panel in the descent; avoid stacking glass layers for decoration. Shared buttons, surfaces, radii, and focus states live in `src/styles/components.css`, with reusable values in `src/styles/tokens.css`. Page composition lives in `src/styles/home.css`, `src/styles/content.css`, and `src/styles/discovery.css`.

Editorial reading surfaces are mostly open and flat. Depth comes from tonal insets, genuine imagery, and whitespace. Glass remains concentrated in the established navigation and the single descent reveal panel; retain its supplied tint, rim, shine, refraction fallback, and reduced-transparency behavior.

## Shapes

Real artifact frames and the exercise entry have soft 14px corners. Editorial primary links use 10px corners; the shared controls retain 11px and shared panels retain 20px. Thin separators organize disclosures and reading rows. Prompts use a deep-navy inset with 12px corners. Draw disclosure plus/minus marks with CSS and directional marks with SVG.

## Components

### Navigation

Use the same transparent, viewport-centered header on Home, Explore, Builds, and About: wordmark left, page links centered, with no separate navbar strip or color block. Each interior hero begins in the same dark blue behind the header. Blend every section background into the next with gradients; avoid sharp color jumps at the header, hero, or content seams.

The original transparent header remains at the top of each page on desktop. At 700px and below, the compact wordmark and 44px menu tap target remain fixed to the viewport on every learner page. The mobile header is 60px high plus the top safe area. After scrolling 8px, a translucent frosted backing keeps it readable, with one constant 8% cloud-white wash over a direct 22px backdrop blur; never change the backing tint between dark and light sections; blur belongs to a separate backing layer so the full-screen menu remains viewport-sized. Anchors and the Explore descent leave clearance beneath the mobile header. Foreground colors adapt to the painted DOM surface beneath each control, with the actual hero fade sampled once into a small cached color strip; the Home landing wash uses its existing colors and scene geometry. Keep a small luminance dead band to prevent flickering near the contrast threshold. Never read back the animated Earth canvas or capture page pixels during scrolling. Menu controls stay white over their overlay. Controls and logo interpolate their foreground changes; the backing only fades into view after scrolling. Reduced transparency uses a solid pale backing with navy controls. Desktop floating route colors and their selected capsule also interpolate. Reduced motion follows the shared suppression rule. On desktop Home, a 356 × 52px glass route switcher appears only when the Earth descent reaches its reveal panel, around 80% of the scene. It stays hidden during the earlier Earth animation. On Explore, Builds, and About, the original four navigation links stay in the same centered position; scrolling a little causes the frosted shell to form around those very links. The Home glass links use that same centered 22px gap and link padding, and both glass shells fit the group closely. The original header wordmark scrolls away. Do not swap or duplicate the links on inner pages. The current page receives a restrained translucent capsule only in the glass state; its edges extend 9px beyond each side of the link box so the label can breathe without shifting the links. On an unmodified desktop click of another glass-nav route, the capsule slides to that link briefly before navigating; keyboard navigation and reduced-motion settings skip the delay.

The shared glass uses the supplied tint, rim, shine, and SVG refraction map with a slightly stronger frost. Supported Chromium can render refraction; other engines use backdrop blur. Reduced-transparency users get an opaque light surface. Keep route text legible over dark blue and pale editorial sections. Never show the glass pill on mobile: retain the existing three-bar menu and full-screen overlay there. Hidden navigation must not be keyboard-focusable. The filter cannot blur the separately composited Earth canvas itself, so the tint and rim carry that part of the journey. The `/components/` page shows the same glass material.

The three plain menu bars animate into an X and open a full-screen overlay on narrow screens. Maintain visible keyboard focus and a usable reduced-motion layout. The Earth canvas should remain a visual layer behind real HTML text and controls.

The mobile menu isolates background content while open, cycles focus through its close control and links, and restores state and focus on dismissal. The footer adds direct Builds, Exercises & workflows, and About links alongside the existing mark and copyright.

### Actions and entry points

The original glowing blue primary button remains the Earth descent action. Editorial primary links use navy with white text and a minimum 46px height; secondary actions are underlined links with 44px targets. Whole-entry links use concise action labels tied to their destination. No decorative entrance motion is added to discovery entries.

### Reading disclosures

Native `details` and `summary` provide optional depth on Explore and About. Summaries expose a short heading and, where useful, one teaser line. Their CSS plus/minus mark reflects the open state. `src/discovery.js` opens the matching disclosure for initial fragments, fragment changes, and repeated activation of the current fragment; keyboard activation remains native and focus moves to the destination summary when appropriate. Native disclosures remain operable without JavaScript.

Keep ordered source sequences and textual labels so color is never the only signpost. The selectable prompt has a copy action and accessible status feedback. Its toolbar wraps on phones, and the inset stays within the step’s inner edge. Comparison reading uses result, corrections, and effort criteria. Caveats remain visible at the appropriate entry or evidence level.

### Earth introduction

The opening headline, supporting text, and Explore control stay fixed during the Earth descent. As the globe rises, its curved edge progressively hides that copy; do not fade or move the copy away. Keep the HTML controls above the canvas and use the scene's sphere geometry to clip the copy. Reduced-motion and fallback views keep the opening copy fully visible.

The intro renders only the actual 3D Earth, with a small loading status until its first successful frame. Preload the real surface and compact cloud maps in parallel, then keep those textures unchanged for the entire descent. Do not upload or replace textures during the visible animation. Never replace this scene with a photograph. Texture failures and graphics-context loss expose a retry action and restore usable HTML copy and controls.

Earth camera progress, clipping, and render dimensions use the same actual stage size. The phone stage uses a stable large viewport height so browser controls cannot resize and clear the canvas while scrolling, and the background still fills the screen when they retract. Explore owns one cancellable scroll animation and draws the corresponding Earth frame in the same animation callback; manual scrolling, pointer input, and resize return control to the visitor.

Preserve the original Earth renderer, styles governing its geometry, and texture assets from baseline `1ac3b89`. The editorial redesign does not replace that animation. Homepage headline and supporting-copy changes belong to the separate homepage-positioning task; its existing addendum is retained below rather than being attributed to this redesign.

### Project evidence

The genuine Earth capture is a browser image of the working website, not generated art. The notebook records the 27 September stationary-headline revision with before/decision/after, the source revision link, and limits on outcome claims. Keep the real artifact separate from the explanation of what worked and what remains unmeasured.

## Do's and Don'ts

### Do

- Do preserve the original Earth renderer, texture assets, scroll geometry, and introduction behavior.
- Do lead project discovery with the actual captured artifact.
- Do keep deep links, native disclosure controls, readable measures, and visible keyboard focus.
- Do document AI contribution, human decisions, and limitations beside project evidence.

### Don't

- Don't require every page to repeat a split heading-and-box composition.
- Don't restore the obsolete three-category-card homepage as a mandatory layout.
- Don't fabricate projects, screenshots, adoption, or validated outcomes.
- Don't use emoji-prone Unicode symbols as website icons unless specifically requested.

## Keeping the guide and examples aligned

`DESIGN.md` records the rule; the visual component library renders the shared tokens and components. The file is not parsed by the site build. Its frontmatter records extracted design values; source CSS remains the runtime implementation. `.impeccable/design.json` supplies component previews, motion, breakpoints, and source references for design tools. Legacy category cards may remain as catalog examples without defining the current Home composition. When changing a shared visual rule, update the source styles/components, the relevant library example, and this guide together, then inspect the actual Home and interior pages at desktop and phone widths. The Earth shader and other scene-specific values are not all represented by catalog swatches.

## Design review workflow

For changes to layout, typography, color, cards, or motion, apply the design-director skill and ask a design-review agent to critique the result. Compare the relevant composition and interaction patterns against polished contemporary sites and the supplied references, then inspect the actual pages at desktop and phone widths. Use comparisons to improve hierarchy, spacing, materials, and clarity; preserve Azivor’s existing identity and factual content. Update this guide and the visual component library when a shared rule changes.

## Creator-first homepage

The opening headline is “You can be a” above designer, developer, filmmaker, writer, researcher, animator, builder, and creator. Keep EB Garamond for both lines; the role changes while both headline lines share one font size. Reserve one grid cell for every word so the supporting copy and action do not move. Roles dissolve vertically over 700ms, with 3.4 seconds between changes. Pause while the page or headline is hidden, and keep a static designer headline for reduced motion or no JavaScript. The hero has no pause button. Keep “You can be a” fixed for every role, including animator. Center the prefix above the role, supporting copy, and single CTA. Center the complete hero group at the viewport midpoint on desktop and phones, including screens shorter than the scene’s minimum stage height. Supporting copy is “AI expands what you can create. Azivor helps you make it real.” Assistive technology receives one complete, unchanging headline rather than repeated announcements.

The homepage audience is anyone with something they want to create. The human directs and owns the work. “Explore what you can create” follows the existing descent route. At phone widths, shorten the label to “Explore” and retain the downward arrow. The single glass panel explains the shorter distance from an idea to a finished result; the real Earth build supplies the evidence. The final editorial section asks “What do you want to create?” and connects that ambition to Azivor’s existing exercise, tools, and workflows. Keep project evidence bounded to actual published work.

## The changing creative workspace

After the existing Earth journey, Home follows one visual thread: physical film editing equipment, a laptop editing workspace, then an individual creator. Use sourced real photographs only. Keep large Geist statements beside generous images, with one supporting sentence per chapter. A sticky image dissolves between chapters on desktop; phones, reduced motion, and no-JavaScript show each photograph in document order. Preserve the sky-to-pale landing seam.

One proportion chart presents Pew’s February 2026 finding that 44% of US adults say they ever use ChatGPT. It measures reported use, not skill or unrealized potential. Source/date remain visible; full photographic credits are in a native disclosure and src/assets/PHOTOGRAPHY.md. The real Earth project supplies inspectable evidence, followed by “What do you want to create?” and the existing Explore routes. Generated images and inferred mastery statistics do not belong in this sequence.

## Homepage timeline pacing — October 2026

The Earth landing opens with “One person can create more than ever before.” The three period-authentic historical images form a shorter buildup: craft, mechanization, personal computing. The final computer statement names the remaining barrier: learning each tool. AI receives a centered, larger serif finale on the existing cinematic grain background rather than a fourth photograph-and-copy row. Keep the Earth title and its supporting copy clear of the first historical image. The original white sections resume after the timeline. The BJC project showcase is deferred at the user's request; do not insert stock or invented output examples.

Desktop timeline chapters occupy at least one small viewport height, with a centered sticky photograph. The AI finale also occupies a viewport. Color plateaus follow measured chapter bounds and recalculate after resize/font loading; they are not fixed percentages of the entire story. Phones retain content-sized chapters.
