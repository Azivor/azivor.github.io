# Azivor website

A dependency-free static site built from reusable HTML-rendering components. Home, Explore, Builds, the Earth descent project notebook, About, and the internal `/components/` catalog share the same implementation. Node 20+ and Python 3 are the only local requirements.

## Work locally

- `npm run build` generates the site in `dist/`.
- `npm test` verifies semantics, escaping, accessibility associations, and page integrity.
- `npm run dev` builds and serves http://127.0.0.1:4173.

No install is needed. Rebuild after editing source; the preview is not a hot-reload server.

## Structure

| Location | Responsibility |
| --- | --- |
| `src/ui/components.mjs` | Button, Brand, Logo, Navigation, Card, Badge, Section, Field, Disclosure |
| `src/ui/logo.mjs` | Single source for the folded A mark, inline branding, SVG asset, and favicon |
| `src/styles/tokens.css` | Palette, fonts, spacing scale, radii, widths, blur, and motion tokens |
| `src/styles/base.css` | Reset, focus treatment, layout and typography utilities |
| `src/styles/components.css` | Shared component variants and interaction states |
| `src/styles/home.css` | Earth-descent homepage composition and responsive adjustments |
| `src/styles/content.css` | Shared editorial base, interior fade, and notebook reading foundations |
| `src/styles/discovery.css` | Varied discovery layouts, project gallery, topic disclosures, and responsive reading |
| `src/styles/category-cards.css` | Legacy category card treatments retained for reference examples |
| `src/styles/catalog.css` | Library reference-page layout only |
| `src/pages/` | Page compositions using the shared UI, including `earth-descent.mjs` |
| `src/discovery.js` | Disclosure deep links and legacy case-study fragment routing |
| `DESIGN.md`, `.impeccable/design.json` | Design rules, extracted values, and preview/source metadata |
| `scripts/build.mjs` | Explicit page registry and deterministic static build |
| `dist/` | Generated deployment output, tracked for static Sites hosting |

## Add a page

Create a module in `src/pages/` that returns an HTML document. Reuse `site-shell.mjs` for the public header, footer, and shared styles. Register the page output in `scripts/build.mjs`. Build and run tests before publishing. Pushing to `main` deploys the site to GitHub Pages. Use the `/components/` developer reference for UI examples; it is excluded from indexing and is not a learner activity. The `/scene-test/` visual reference reuses Home to inspect scene transitions, carries its own canonical URL and `noindex, follow`, and links back to the build case study. Public Home, Explore, Builds, the project notebook, and About have self-canonical URLs and route-specific social metadata with a shared Earth preview. `noindex` is an indexing request, not access control.

```js
import {Section, Card, Button} from '../ui/components.mjs';
Section({id: 'research', title: 'New ideas', children:
  Card({variant: 'solid', children:
    Button({label: 'Explore', href: '/#possibilities'})
  })
});
```

## Component contracts

| Component | Options |
| --- | --- |
| Button | required `label`; `href` makes a link, otherwise native button; variant `primary/glass/ghost`; size `small/default/large`; optional SVG `icon: 'down'`; `className`, `disabled`, `type` |
| Brand | `href`, `label`, `className`; includes decorative Logo |
| Logo | Shared decorative SVG; provide an accessible label on its containing link when icon-only |
| Navigation | `items: [{label,href}]`, `active`, accessible `label` |
| Card | variant `light/dark/solid/silver`, trusted HTML `children`, `className` |
| Badge | `label` |
| Section | required unique `id` and `title`, optional `eyebrow`, trusted HTML `children` |
| Field | required unique `id`, `label`; `type`, `value`, `placeholder`, `help`, `error`, `required`, `disabled` |
| Disclosure | `title`, trusted HTML `children`, `open`; native keyboard-accessible details/summary |

Text and attribute values are escaped. `children` is an intentionally trusted HTML slot; never pass unsanitized external content. Use `escapeHTML` for external plain text. Link schemes are validated. Disabled links are rejected rather than pretending to be disabled. Field errors are presentation props; server validation and persistence are not implemented. The catalog is a style reference, not a working form backend.

Layout utilities: `ui-container`, `ui-stack`, `ui-cluster`, `ui-grid`, `ui-section`. Typography: `ui-title`, `ui-body`, `ui-eyebrow`. Preserve visible keyboard focus, unique IDs, native semantics, and reduced-motion support. Keep the logo and shared component variants centralized. Editorial actions and disclosures are shared across discovery pages through `discovery.css`; extend those patterns rather than creating separate route variants.

## Discovery and project reading

The route `/builds/` is an artifact-first gallery; `/builds/earth-descent/` is the project notebook. Explore offers a prominent exercise and shorter project, workflow, and comparison entries. About presents a short statement with optional question disclosures. Home preserves the original Earth journey before its project evidence and creator routes. The existing Earth renderer, texture assets, and descent behavior are separate from these editorial layouts.

Explore and About use native `details`/`summary`. `discovery.js` opens the appropriate disclosure on an initial fragment, a changed fragment, or repeat activation of the same link, and supports focus at the destination. Native disclosure controls remain usable without JavaScript. Existing exercise/workflow fragments are preserved. Old case-study fragments on `/builds/` (`#the-scene`, `#the-decisions`, `#the-limits`, `#try-it`) route to the same fragment under `/builds/earth-descent/`.

The public shell requests one bundled `/site.css`. The build concatenates tokens, base, components, home, content, category-cards, and discovery styles in that order; preserve this cascade when moving rules. Individual stylesheet outputs remain available, and the component catalog adds its own stylesheet. Rebuild to refresh both forms. The source `discovery.css` is the editorial composition layer; it does not replace the original scene styles.

## Hosting and provenance

GitHub repository: https://github.com/Azivor/azivor.github.io (public). The workflow in `.github/workflows/pages.yml` tests, builds, and publishes `dist/` to https://azivor.github.io after each push to `main`. The existing Sites project remains configured in `.openai/hosting.json`. The visual direction follows the supplied screenshot and subsequent live Cluely audit. The paper-airplane A is original vector geometry. Google Fonts supplies EB Garamond for the homepage opening headline and Geist for every other heading and text element, with system fallbacks.

Design rules and editorial reference decisions are recorded in DESIGN.md, with component/source metadata in `.impeccable/design.json`. The Earth preview is a browser capture of the working site; the editorial references supply no borrowed artwork or project claims. Dark overlays deliberately use 60% charcoal for readable text over the silver feature surface; reference measurements suggested 50% as a starting point.
